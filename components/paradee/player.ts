'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * One shared audio element for every clip in the post, so starting a clip
 * stops whichever one was playing, and any component can follow the playhead.
 */
interface PlayerState {
  src: string | null;
  playing: boolean;
}

const IDLE: PlayerState = { src: null, playing: false };
let state: PlayerState = IDLE;
let el: HTMLAudioElement | null = null;
const subscribers = new Set<() => void>();

function set(next: PlayerState) {
  state = next;
  subscribers.forEach((notify) => notify());
}

function element(): HTMLAudioElement {
  if (!el) {
    el = new Audio();
    el.preload = 'auto';
    el.addEventListener('ended', () => set({ src: state.src, playing: false }));
  }
  return el;
}

export function play(src: string, opts: { at?: number; volume?: number } = {}) {
  const audio = element();
  if (state.src !== src) audio.src = src;
  audio.volume = opts.volume ?? 1;
  audio.currentTime = opts.at ?? 0;
  set({ src, playing: true });
  audio.play().catch(() => set({ src, playing: false }));
}

export function stop() {
  el?.pause();
  set({ src: state.src, playing: false });
}

export function toggle(src: string, opts?: { volume?: number }) {
  if (state.playing && state.src === src) stop();
  else play(src, opts);
}

export function currentTime(): number {
  return el?.currentTime ?? 0;
}

/** Fraction of the current clip played so far, 0 to 1. */
export function progress(): number {
  if (!el || !el.duration || Number.isNaN(el.duration)) return 0;
  return Math.min(1, el.currentTime / el.duration);
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
}

export function usePlayer(): PlayerState {
  return useSyncExternalStore(subscribe, () => state, () => IDLE);
}

/** Calls `onFrame` every animation frame while `active`, and once more when it stops. */
export function useFrame(active: boolean, onFrame: (active: boolean) => void) {
  useEffect(() => {
    if (!active) {
      onFrame(false);
      return;
    }
    let raf = 0;
    const tick = () => {
      onFrame(true);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

/**
 * Index of the `[data-step]` element closest to a horizontal line across the
 * viewport, updated on scroll. `line` is that line's position as a fraction of
 * the viewport height.
 */
export function nearestStep(root: HTMLElement, line: number): number {
  const y = window.innerHeight * line;
  let best = 0;
  let bestDistance = Infinity;
  root.querySelectorAll<HTMLElement>('[data-step]').forEach((step) => {
    const r = step.getBoundingClientRect();
    const d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
    if (d < bestDistance) {
      bestDistance = d;
      best = Number(step.dataset.step);
    }
  });
  return best;
}
