// Shared by the Earlybird post's server page and its client charts.
export const sgn = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v));
export const ms = (v: number) => `${sgn(v)} ms`;
export const pct = (v: number) => `${v.toFixed(1)}%`;
export const mb = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)} GB` : `${v} MB`);
export const MODELS = ['Earlybird', 'Moonshine Tiny', 'Whistle', 'Whisper base'];

export type Point = {
  name: string;
  x: number;
  y: number;
  ours?: boolean;
  published?: boolean;
  label: 'left' | 'right' | 'above' | 'below';
  /** Lines shown in the hover card. */
  lines: string[];
};
