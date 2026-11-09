'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import SAMPLES from './samples.json';

// The live demo, in the post: the browser streams 16 kHz audio (the microphone, or a recording as it
// plays) to the Earlybird server on Modal over a WebSocket, 80 ms at a time, and shows what comes back.
// Server messages: {ready} | {busy} | {limit} | {t, words: [[text, p]], ghost: [[text, p]], ms}.

const WS_URL = 'wss://sahil-mahendrakar--earlybird-live-live-web.us-east.modal.run/ws';
const SR = 16000;
const CHUNK = 1280; // 80 ms

type Pair = [string, number];
type Msg = { ready?: boolean; busy?: boolean; limit?: boolean; words?: Pair[]; ghost?: Pair[]; ms?: number };
type Clip = { id: string; cat: string; audio: string; said: [string, number, number][] };

const CLIPS = (SAMPLES as unknown as Clip[]).map((c) => ({
  id: c.id,
  cat: c.cat,
  audio: c.audio,
  text: c.said.map((w) => w[0]).join(' '),
}));

// Captures the microphone and hands back 80 ms blocks at 16 kHz. If the context runs at another rate,
// each output sample is the mean of the input samples it covers (a cheap low-pass before decimating).
const WORKLET = `class Cap extends AudioWorkletProcessor{constructor(){super();this.r=sampleRate/${SR};this.buf=[];this.acc=0;this.sum=0;this.n=0}
process(i){const x=i[0]&&i[0][0];if(!x)return true;let lvl=0;for(let k=0;k<x.length;k++){const v=x[k];lvl=Math.max(lvl,Math.abs(v));this.sum+=v;this.n++;this.acc+=1;
if(this.acc>=this.r){this.acc-=this.r;this.buf.push(this.sum/this.n);this.sum=0;this.n=0}}
if(this.buf.length>=${CHUNK}){this.port.postMessage({pcm:new Float32Array(this.buf.splice(0,${CHUNK})),lvl})}return true}}registerProcessor('cap',Cap)`;

const pct = (p: number) => `${Math.round(p * 100)}%`;
const confStyle = (p: number) => ({ '--conf': pct(Math.max(0, Math.min(1, p))) }) as CSSProperties;

type Mode = 'idle' | 'connecting' | 'mic' | 'sample';
type Session = { ws: WebSocket; ctx: AudioContext; stop: () => void };

const IDLE: [string, string] = ['Talk to Earlybird', 'English. Runs on a small CPU server; audio isn’t stored.'];

export function LiveDemo() {
  const [mode, setMode] = useState<Mode>('idle');
  const [status, setStatus] = useState<[string, string]>(IDLE);
  const [words, setWords] = useState<Pair[]>([]);
  const [ghost, setGhost] = useState<Pair[]>([]);
  const [nowIdx, setNowIdx] = useState(-1);
  const [clipId, setClipId] = useState<string | null>(null);
  /** The recording whose words to show under the transcript (kept after it finishes). */
  const [saidId, setSaidId] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const session = useRef<Session | null>(null);
  const lastLen = useRef(0);
  const nowTimer = useRef(0);
  /** Bumped by every start and stop, so a start still waiting on the network can tell it was cancelled. */
  const gen = useRef(0);

  const show = useCallback((m: Msg) => {
    const w = m.words ?? [];
    setWords(w);
    setGhost((m.ghost ?? []).filter((g) => g[1] >= 0.15));
    // The word being spoken: the last word, while the transcript is still growing.
    if (w.length !== lastLen.current) {
      lastLen.current = w.length;
      setNowIdx(w.length - 1);
      window.clearTimeout(nowTimer.current);
      nowTimer.current = window.setTimeout(() => setNowIdx(-1), 700);
    }
  }, []);

  const end = useCallback((msg?: [string, string]) => {
    gen.current++;
    const s = session.current;
    session.current = null;
    if (s) {
      s.stop();
      try { if (s.ws.readyState <= 1) s.ws.close(); } catch {}
      try { s.ctx.close(); } catch {}
    }
    setMode('idle');
    setLevel(0);
    setNowIdx(-1);
    setStatus(msg ?? IDLE);
  }, []);

  useEffect(() => () => end(), [end]);

  const clear = useCallback(() => {
    lastLen.current = 0;
    setSaidId(null);
    setWords([]);
    setGhost([]);
    setNowIdx(-1);
  }, []);

  /** Opens the socket; resolves once the server is ready (or rejects with a status to show). */
  const connect = (onMsg: (m: Msg) => void) =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(WS_URL);
      ws.binaryType = 'arraybuffer';
      let ready = false;
      ws.onmessage = (e) => {
        const m: Msg = JSON.parse(e.data);
        if (m.busy) reject(['Busy right now', 'Everyone’s talking to it at once. Try again in a minute.']);
        else if (m.ready) { ready = true; resolve(ws); }
        else onMsg(m);
      };
      ws.onerror = () => { if (!ready) reject(['Can’t reach the server', 'It may be starting up. Try again shortly.']); };
      ws.onclose = () => { if (ready && session.current?.ws === ws) end(['Disconnected', 'Press the microphone to start again.']); };
    });

  const onMsg = (m: Msg) => {
    if (m.limit) { end(['Two-minute limit reached', 'Press the microphone to start again.']); return; }
    if (m.words) show(m);
  };

  async function startMic() {
    end();
    const my = gen.current;
    clear();
    setClipId(null);
    setMode('connecting');
    setStatus(['Waking the server…', 'This can take a few seconds.']);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    } catch {
      if (gen.current === my) end(['Microphone blocked', 'Allow microphone access for this page and try again.']);
      return;
    }
    if (gen.current !== my) { stream.getTracks().forEach((t) => t.stop()); return; }
    let ctx: AudioContext;
    let src: MediaStreamAudioSourceNode;
    ctx = new AudioContext({ sampleRate: SR });
    try {
      src = ctx.createMediaStreamSource(stream);
    } catch {
      // Firefox can't connect a microphone to a context at another rate; resample in the worklet instead.
      ctx.close();
      ctx = new AudioContext();
      src = ctx.createMediaStreamSource(stream);
    }
    const stopTracks = () => stream.getTracks().forEach((t) => t.stop());
    let ws: WebSocket;
    try {
      ws = await connect(onMsg);
      await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' })));
    } catch (e) {
      stopTracks();
      ctx.close();
      if (gen.current === my) end(Array.isArray(e) ? (e as [string, string]) : ['Couldn’t start the microphone', 'Try again.']);
      return;
    }
    if (gen.current !== my) { stopTracks(); ctx.close(); ws.close(); return; }
    const node = new AudioWorkletNode(ctx, 'cap');
    node.port.onmessage = (e) => {
      if (ws.readyState === 1) ws.send(e.data.pcm.buffer);
      setLevel(Math.min(1, e.data.lvl * 4));
    };
    src.connect(node);
    session.current = { ws, ctx, stop: () => { node.disconnect(); src.disconnect(); stopTracks(); } };
    setMode('mic');
    setStatus(['Listening', 'Speak naturally. Press the button again to stop.']);
  }

  async function playClip(id: string) {
    const again = clipId === id && mode !== 'idle';
    end();
    if (again) { setClipId(null); return; }
    const my = gen.current;
    clear();
    setClipId(id);
    setSaidId(id);
    setMode('connecting');
    setStatus(['Waking the server…', 'This can take a few seconds.']);
    const clip = CLIPS.find((c) => c.id === id)!;
    const ctx = new AudioContext();
    let ws: WebSocket;
    let buf: AudioBuffer;
    try {
      const [b, w] = await Promise.all([
        fetch(clip.audio).then((r) => r.arrayBuffer()).then((a) => ctx.decodeAudioData(a)),
        connect(onMsg),
      ]);
      buf = b;
      ws = w;
    } catch (e) {
      ctx.close();
      if (gen.current === my) end(Array.isArray(e) ? (e as [string, string]) : ['Couldn’t load the recording', 'Try again.']);
      return;
    }
    // 16 kHz mono for the model, plus a second of silence so the last word finishes.
    const off = new OfflineAudioContext(1, Math.ceil(buf.duration * SR), SR);
    const s0 = off.createBufferSource();
    s0.buffer = buf;
    s0.connect(off.destination);
    s0.start();
    const pcm = (await off.startRendering()).getChannelData(0);
    if (gen.current !== my) { ctx.close(); ws.close(); return; }
    const all = new Float32Array(pcm.length + SR);
    all.set(pcm);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    const t0 = ctx.currentTime + 0.05;
    src.start(t0);
    let sent = 0;
    // Send what has been played so far, 80 ms at a time, so the model hears it as it plays.
    const timer = window.setInterval(() => {
      const due = Math.min(all.length, Math.floor(((ctx.currentTime - t0) * SR) / CHUNK) * CHUNK + CHUNK);
      while (sent + CHUNK <= due && ws.readyState === 1) {
        ws.send(all.slice(sent, sent + CHUNK).buffer);
        sent += CHUNK;
      }
      if (sent + CHUNK > all.length) {
        window.clearInterval(timer);
        window.setTimeout(() => { if (session.current?.ws === ws) { setClipId(null); end(['Done', 'Pick another recording, or press the microphone.']); } }, 500);
      }
    }, 20);
    session.current = { ws, ctx, stop: () => { window.clearInterval(timer); try { src.stop(); } catch {} } };
    setMode('sample');
    setStatus(['Playing a recording', 'The model hears it 80 ms at a time, as it plays.']);
  }

  const micOn = mode === 'mic';
  const said = saidId ? CLIPS.find((c) => c.id === saidId)?.text : null;

  return (
    <div className="ebs ebl">
      <div className="ebs-stage">
        <div className="ebs-ctrl">
          <button
            type="button"
            className={`ebl-mic${micOn ? ' on' : ''}`}
            style={{ '--lvl': (1 + level * 0.25).toFixed(3) } as CSSProperties}
            onClick={() => (micOn || (mode === 'connecting' && !clipId) ? end() : startMic())}
            aria-label={micOn ? 'Stop' : 'Talk to Earlybird'}
          >
            {micOn ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" /></svg>
            )}
          </button>
          <div className="ebl-status" aria-live="polite">
            <b>{status[0]}</b>
            <small>{status[1]}</small>
          </div>
          {words.length > 0 && mode === 'idle' && (
            <button type="button" className="ebl-clear" onClick={clear}>Clear</button>
          )}
        </div>
        <div className="ebl-screen">
          {words.length === 0 && ghost.length === 0 ? (
            <span className="ebs-wait">{mode === 'idle' ? 'Your words appear here as you speak.' : '…'}</span>
          ) : (
            <p className="ebs-text">
              {words.map(([w, p], i) => (
                <span key={i} className={`c${i === nowIdx ? ' ahead' : ''}`} style={confStyle(p)} title={`${pct(p)} confident`}><span className="w">{w}</span><small>{pct(p)}</small></span>
              ))}
              {ghost.map(([g, p], i) => (
                <span key={`g${i}`} className="g c" style={confStyle(p)} title={`guess, ${pct(p)} confident`}>
                  <span className="w">{g}</span><small>{pct(p)}</small>
                </span>
              ))}
            </p>
          )}
        </div>
        {said && <p className="ebl-said"><span>What was said</span>{said}</p>}
        <div className="ebl-picks">
          <span>Or play a recording through it</span>
          <div className="ebs-picker" role="group" aria-label="Play a recording through Earlybird">
            {CLIPS.map((c) => (
              <button key={c.id} type="button" aria-pressed={clipId === c.id} onClick={() => playClip(c.id)}>
                <span>{c.cat}</span>
                <q>{c.text.split(' ').slice(0, 5).join(' ')}…</q>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
