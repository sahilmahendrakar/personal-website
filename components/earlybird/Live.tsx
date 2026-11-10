'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

// The live demo, in the post: the browser streams 16 kHz microphone audio
// to the Earlybird server on Modal over a WebSocket, 80 ms at a time, and shows what comes back.
// Server messages: {ready} | {busy} | {limit} | {t, words: [[text, p]], ghost: [[text, p]], ms}.

const WS_URL = 'wss://sahil-mahendrakar--earlybird-live-live-web.us-east.modal.run/ws';
const SR = 16000;
const CHUNK = 1280; // 80 ms

type Pair = [string, number];
type Msg = { ready?: boolean; busy?: boolean; limit?: boolean; words?: Pair[]; ghost?: Pair[]; ms?: number };

// Captures the microphone and hands back 80 ms blocks at 16 kHz. If the context runs at another rate,
// each output sample is the mean of the input samples it covers (a cheap low-pass before decimating).
const WORKLET = `class Cap extends AudioWorkletProcessor{constructor(){super();this.r=sampleRate/${SR};this.buf=[];this.acc=0;this.sum=0;this.n=0}
process(i){const x=i[0]&&i[0][0];if(!x)return true;let lvl=0;for(let k=0;k<x.length;k++){const v=x[k];lvl=Math.max(lvl,Math.abs(v));this.sum+=v;this.n++;this.acc+=1;
if(this.acc>=this.r){this.acc-=this.r;this.buf.push(this.sum/this.n);this.sum=0;this.n=0}}
if(this.buf.length>=${CHUNK}){this.port.postMessage({pcm:new Float32Array(this.buf.splice(0,${CHUNK})),lvl})}return true}}registerProcessor('cap',Cap)`;

const pct = (p: number) => `${Math.round(p * 100)}%`;
const confStyle = (p: number) => ({ '--conf': pct(Math.max(0, Math.min(1, p))) }) as CSSProperties;

type Mode = 'idle' | 'connecting' | 'mic';
type Session = { ws: WebSocket; ctx: AudioContext; stop: () => void };

const IDLE: [string, string] = ['Talk to Earlybird', 'English. Runs on a small CPU server; audio isn’t stored.'];

export function LiveDemo() {
  const [mode, setMode] = useState<Mode>('idle');
  const [status, setStatus] = useState<[string, string]>(IDLE);
  const [words, setWords] = useState<Pair[]>([]);
  const [ghost, setGhost] = useState<Pair[]>([]);
  const [nowIdx, setNowIdx] = useState(-1);
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

  const micOn = mode === 'mic';

  return (
    <div className="ebs ebl">
      <div className="ebs-stage">
        <div className="ebs-ctrl">
          <button
            type="button"
            className={`ebl-mic${micOn ? ' on' : ''}`}
            style={{ '--lvl': (1 + level * 0.25).toFixed(3) } as CSSProperties}
            onClick={() => (micOn || mode === 'connecting' ? end() : startMic())}
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
      </div>
    </div>
  );
}
