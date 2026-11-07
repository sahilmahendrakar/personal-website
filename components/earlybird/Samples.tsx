'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import SAMPLES from './samples.json';
import { ms } from './format';

// Side-by-side replay of real recordings: what each model showed, and when, against the audio clock.
// Each lane is the model's logged output (every change to its text), replayed in time with the audio.

/** A shown word: text, confidence (null if the model gives none), index of the reference word it matches (-1 if none). */
type Word = [string, number | null, number];
type Guess = [string, number | null];
type Step = [number, Word[], Guess[]];
type Clip = {
  id: string;
  cat: string;
  audio: string;
  dur: number;
  end: number;
  said: [string, number, number][];
  env: number[];
  lanes: Record<string, Step[]>;
  /** Median word latency on this clip, in ms, per model (null if under half the words were ever right). */
  latency: Record<string, number | null>;
};

const CLIPS = SAMPLES as unknown as Clip[];

/** Lanes in display order, with the size shown next to each name. */
const LANES: [string, string][] = [
  ['Earlybird', '16.8 MB'],
  ['Moonshine Tiny', '45 MB'],
  ['Whisper base', '145 MB'],
  ['Whistle', '16.9 MB'],
];

const RATES: [number, string][] = [[1, '1×'], [0.5, '½×'], [0.25, '¼×']];

/** The last step at or before time t. */
function stepAt(steps: Step[], t: number): Step | null {
  let lo = 0, hi = steps.length - 1, best = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (steps[mid][0] <= t + 1e-6) { best = mid; lo = mid + 1; } else hi = mid - 1;
  }
  return best < 0 ? null : steps[best];
}

/** Text color for a confidence: pale at 0, Earlybird blue at 1. */
const confStyle = (c: number | null): CSSProperties | undefined =>
  c === null ? undefined : ({ '--conf': `${Math.round(Math.max(0, Math.min(1, c)) * 100)}%` } as CSSProperties);

const fmtConf = (c: number | null) => (c === null ? '' : `${Math.round(c * 100)}%`);

export function SamplePlayer({ ids }: { ids?: string[] }) {
  const clips = useMemo(() => (ids ? ids.map((id) => CLIPS.find((c) => c.id === id)!).filter(Boolean) : CLIPS), [ids]);
  const [ci, setCi] = useState(0);
  const clip = clips[ci];
  const [t, setT] = useState(clip.end);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const audio = useRef<HTMLAudioElement | null>(null);
  const raf = useRef(0);
  // Clock anchor: time at a known performance.now(), advanced at the playback rate.
  const anchor = useRef({ t: 0, perf: 0 });
  const rateRef = useRef(rate);
  const tRef = useRef(t);
  tRef.current = t;

  const lanes = LANES.filter(([name]) => clip.lanes[name]?.length);
  // The longest text each lane ever shows, rendered invisibly so the layout never jumps.
  const longest = useMemo(
    () =>
      Object.fromEntries(
        lanes.map(([name]) => {
          let best: string[] = [];
          for (const [, w, g] of clip.lanes[name]) {
            const all = [...w.map((x) => x[0]), ...g.map((x) => x[0])];
            if (all.join(' ').length > best.join(' ').length) best = all;
          }
          return [name, best];
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clip],
  );

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    audio.current?.pause();
    setPlaying(false);
  }, []);

  const tick = useCallback(() => {
    const a = audio.current;
    const now = performance.now();
    let nt: number;
    if (a && !a.paused && !a.ended) {
      nt = a.currentTime;
      anchor.current = { t: nt, perf: now };
    } else {
      nt = anchor.current.t + ((now - anchor.current.perf) / 1000) * rateRef.current;
    }
    if (nt >= clip.end) {
      setT(clip.end);
      stop();
      return;
    }
    setT(nt);
    raf.current = requestAnimationFrame(tick);
  }, [clip.end, stop]);

  const playFrom = useCallback(
    (from: number) => {
      const a = audio.current;
      cancelAnimationFrame(raf.current);
      anchor.current = { t: from, perf: performance.now() };
      setT(from);
      setPlaying(true);
      if (a) {
        a.playbackRate = rateRef.current;
        if (from < clip.dur) {
          a.currentTime = from;
          a.play().catch(() => {});
        }
      }
      raf.current = requestAnimationFrame(tick);
    },
    [clip.dur, tick],
  );

  const toggle = () => (playing ? stop() : playFrom(tRef.current >= clip.end - 0.01 ? 0 : tRef.current));

  const seek = (to: number) => {
    const v = Math.max(0, Math.min(clip.end, to));
    if (playing) playFrom(v);
    else {
      setT(v);
      if (audio.current && v < clip.dur) audio.current.currentTime = v;
    }
  };

  const pick = (i: number) => {
    stop();
    setCi(i);
  };

  // A new clip loads, then plays from the start.
  const shown = useRef(ci);
  useEffect(() => {
    if (shown.current === ci) return;
    shown.current = ci;
    const a = audio.current;
    if (a) a.load();
    playFrom(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ci]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const setSpeed = (r: number) => {
    rateRef.current = r;
    setRate(r);
    anchor.current = { t: tRef.current, perf: performance.now() };
    if (audio.current) audio.current.playbackRate = r;
  };

  // Waveform track
  const W = 600, H = 44;
  const bin = 0.02;
  const track = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);
  const timeAt = (e: PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * clip.end;
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { seek(t + 0.1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { seek(t - 0.1); e.preventDefault(); }
    if (e.key === ' ' || e.key === 'Enter') { toggle(); e.preventDefault(); }
  };

  const done = !playing && t >= clip.end - 0.01;

  return (
    <div className="ebs">
      <div className="ebs-picker" role="group" aria-label="Choose a recording">
        {clips.map((c, i) => (
          <button key={c.id} type="button" aria-pressed={i === ci} onClick={() => pick(i)}>
            <span>{c.cat}</span>
            <q>{c.said.slice(0, 5).map(([w]) => w).join(' ')}…</q>
          </button>
        ))}
      </div>

      <div className="ebs-stage">
        <audio ref={audio} src={clip.audio} preload="auto" onEnded={() => (anchor.current = { t: clip.dur, perf: performance.now() })} />
        <div className="ebs-ctrl">
          <button type="button" className="ebs-play" onClick={toggle} aria-label={playing ? 'Pause' : done ? 'Play again' : 'Play'}>
            {playing ? (
              <svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.5" y="2" width="2.4" height="8" rx=".6" /><rect x="7.1" y="2" width="2.4" height="8" rx=".6" /></svg>
            ) : done ? (
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 2.2a3.8 3.8 0 1 1-3.6 2.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M1.6 1.8l.9 3.3 3.2-1z" /></svg>
            ) : (
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.2 1.6l7 4.4-7 4.4z" /></svg>
            )}
          </button>
          <svg
            ref={track}
            className="ebs-wave"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="slider"
            tabIndex={0}
            aria-label="Position in the recording"
            aria-valuemin={0}
            aria-valuemax={Number(clip.end.toFixed(2))}
            aria-valuenow={Number(t.toFixed(2))}
            aria-valuetext={`${t.toFixed(1)} seconds`}
            onKeyDown={onKey}
            onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); seek(timeAt(e)); }}
            onPointerMove={(e) => dragging.current && seek(timeAt(e))}
            onPointerUp={() => (dragging.current = false)}
          >
            {clip.env.map((v, i) => {
              const x = (i * bin / clip.end) * W;
              const h = Math.max(1.5, v * (H - 6));
              return <rect key={i} x={x} y={(H - h) / 2} width={(bin / clip.end) * W * 0.62} height={h} rx={0.8} className={i * bin < t ? 'on' : ''} />;
            })}
            <line x1={(t / clip.end) * W} x2={(t / clip.end) * W} y1={0} y2={H} className="ebs-head" />
          </svg>
          <span className="ebs-clock">{t.toFixed(1)} s</span>
          <div className="ebs-speed" role="group" aria-label="Playback speed">
            {RATES.map(([r, l]) => (
              <button key={r} type="button" aria-pressed={rate === r} onClick={() => setSpeed(r)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="ebs-lanes">
          <div className="ebs-lane ebs-said">
            <div className="ebs-name"><b>Speaker</b><small>what was said</small></div>
            <p className="ebs-text">
              {clip.said.map(([w, s, e], i) => {
                const p = t <= s ? 0 : t >= e ? 1 : (t - s) / (e - s);
                return (
                  <span key={i} className={p >= 1 ? 'done' : p > 0 ? 'now' : ''} style={{ '--p': `${Math.round(p * 100)}%` } as CSSProperties}>
                    {w}
                  </span>
                );
              })}
            </p>
          </div>

          {lanes.map(([name, size]) => {
            const step = stepAt(clip.lanes[name], t);
            const words = step?.[1] ?? [];
            const guesses = step?.[2] ?? [];
            const lat = clip.latency[name] ?? null;
            const ours = name === 'Earlybird';
            return (
              <div key={name} className={`ebs-lane${ours ? ' ours' : ''}`}>
                <div className="ebs-name">
                  <b>{name}</b>
                  <small>{size}{lat !== null && <> · <span className={lat < 0 ? 'early' : ''}>{ms(lat)}</span></>}</small>
                </div>
                <div className="ebs-text ebs-stack">
                  <p aria-hidden="true" className="ebs-sizer">
                    {longest[name].map((w, i) => <span key={i}>{w}</span>)}
                  </p>
                  <p>
                    {words.map(([w, c, j], i) => (
                      <span
                        key={i}
                        className={`${c !== null ? 'c' : ''}${j >= 0 && clip.said[j][2] > t ? ' ahead' : ''}`}
                        style={confStyle(c)}
                        title={c !== null ? `${fmtConf(c)} confident` : undefined}
                      >
                        {w}
                      </span>
                    ))}
                    {guesses.map(([w, c], i) => (
                      <span key={`g${i}`} className="g c" style={confStyle(c)} title={`guess, ${fmtConf(c)} confident`}>
                        {w}
                        <sup>{fmtConf(c)}</sup>
                      </span>
                    ))}
                    {!words.length && !guesses.length && <span className="ebs-wait">…</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ebs-legend">
        <span><i className="ebs-lg-conf" />Earlybird&rsquo;s confidence, low to high</span>
        <span><i className="ebs-lg-ahead" />shown before the speaker finished the word</span>
        <span><i className="ebs-lg-guess" />guess of the next word</span>
      </div>
    </div>
  );
}
