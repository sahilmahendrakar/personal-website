'use client';

import { useState, type ReactNode } from 'react';

// Interactive charts for the Earlybird post. Every number comes from the Earlybird repo's results files.

import { MODELS, mb, ms, sgn, type Point } from './format';

/** Wraps an SVG chart and shows a small card over the point being hovered or focused. */
function Frame({ children, tip }: { children: ReactNode; tip?: { x: number; y: number; title: string; lines: string[] } | null }) {
  return (
    <div className="eb-frame">
      {children}
      {tip && (
        <div
          className="eb-tip"
          style={{ left: `${tip.x}%`, top: `${tip.y}%`, transform: tip.x > 62 ? 'translate(calc(-100% - 14px), -50%)' : 'translate(14px, -50%)' }}
        >
          <b>{tip.title}</b>
          {tip.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Scatter: two measures, "better" at the top left ----------

type Axis = { lo: number; hi: number; ticks: number[]; fmt: (v: number) => string; label: string; log?: boolean };

const AXES: Record<string, Axis> = {
  size: { lo: 10, hi: 2000, log: true, ticks: [10, 20, 50, 100, 200, 500, 1000, 2000], fmt: mb, label: 'Size on disk (log scale)' },
  latency: { lo: -150, hi: 450, ticks: [-100, 0, 100, 200, 300, 400], fmt: ms, label: 'Word latency (median)' },
  wer: { lo: 5, hi: 15, ticks: [6, 8, 10, 12, 14], fmt: (v) => `${v}%`, label: 'Mean word error rate' },
};

export function Scatter({ points, x: xKey, y: yKey, shade, shadeLabel, desc }: {
  points: Point[];
  x: 'size' | 'latency';
  y: 'wer' | 'latency';
  /** Shade the region before the word ends: left of x = 0 or above y = 0. */
  shade?: 'x' | 'y';
  shadeLabel?: string;
  desc: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const xAxis = AXES[xKey], yAxis = AXES[yKey];
  const W = 680, H = 380, L = 92, R = 20, T = 16, B = 54;
  const tx = (v: number) => (xAxis.log ? Math.log10(v) : v);
  const x = (v: number) => L + ((tx(v) - tx(xAxis.lo)) / (tx(xAxis.hi) - tx(xAxis.lo))) * (W - L - R);
  // Lower values sit higher: the top of the chart is better.
  const y = (v: number) => T + ((v - yAxis.lo) / (yAxis.hi - yAxis.lo)) * (H - T - B);
  const cy = T + (H - T - B) / 2;
  const p = hover === null ? null : points[hover];
  return (
    <Frame tip={p && { x: (x(p.x) / W) * 100, y: (y(p.y) / H) * 100, title: p.name, lines: p.lines }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={desc} onMouseLeave={() => setHover(null)}>
        {shade === 'x' && <rect x={L} y={T} width={x(0) - L} height={H - T - B} className="eb-band" />}
        {shade === 'y' && <rect x={L} y={T} width={W - L - R} height={y(0) - T} className="eb-band" />}
        {yAxis.ticks.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className={shade === 'y' && v === 0 ? 'eb-zero' : 'eb-grid'} />
            <text x={L - 10} y={y(v) + 4} textAnchor="end" className="eb-tick">{yAxis.fmt(v)}</text>
          </g>
        ))}
        {shade === 'x' && <line x1={x(0)} x2={x(0)} y1={T} y2={H - B} className="eb-zero" />}
        {shade && shadeLabel && (
          <text x={L + 10} y={shade === 'y' ? y(0) - 9 : H - B - 10} className="eb-note">{shadeLabel}</text>
        )}
        {xAxis.ticks.map((v) => (
          <text key={v} x={x(v)} y={H - B + 22} textAnchor="middle" className="eb-tick">{xAxis.fmt(v)}</text>
        ))}
        <text x={L + (W - L - R) / 2} y={H - 8} textAnchor="middle" className="eb-axis">{xAxis.label}</text>
        <text x={14} y={cy} textAnchor="middle" className="eb-axis" transform={`rotate(-90 14 ${cy})`}>{yAxis.label}</text>
        <text x={W - R - 10} y={T + 20} textAnchor="end" className="eb-note">↖ better</text>
        {points.map((pt, i) => {
          const px = x(pt.x), py = y(pt.y);
          const g = pt.ours ? 15 : 11;
          const lx = pt.label === 'left' ? px - g : pt.label === 'right' ? px + g : px;
          const ly = pt.label === 'above' ? py - g : pt.label === 'below' ? py + g + 10 : py + 5;
          const anchor = pt.label === 'left' ? 'end' : pt.label === 'right' ? 'start' : 'middle';
          const dim = hover !== null && hover !== i;
          return (
            <g
              key={pt.name}
              className={`eb-pt${pt.ours ? ' eb-ours' : ''}${pt.published ? ' eb-pub' : ''}${dim ? ' eb-dim' : ''}`}
              tabIndex={0}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <circle cx={px} cy={py} r={20} className="eb-hit" />
              {pt.ours && <circle cx={px} cy={py} r={14} className="eb-halo" />}
              <circle cx={px} cy={py} r={pt.ours ? 7.5 : 5.5} className="eb-dot" />
              <text x={lx} y={ly} textAnchor={anchor} className="eb-lbl">{pt.name}</text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}


// ---------- Timeline: when a typical word is predicted correctly ----------

const TIMELINE: [string, number][] = [['Earlybird', -90], ['Whisper base', 90], ['Moonshine Tiny', 270], ['Whistle', 400]];
export function Timeline() {
  const [hover, setHover] = useState<number | null>(null);
  const L = 150, R = 600, lo = -200, hi = 450, T = 70, h = 46;
  const x = (v: number) => L + ((v - lo) / (hi - lo)) * (R - L);
  return (
    <svg viewBox="0 0 680 270" role="img" aria-label="Median word latency on audiobooks: Earlybird −90 ms, Whisper base +90 ms, Moonshine Tiny +270 ms, Whistle +400 ms" onMouseLeave={() => setHover(null)}>
      <rect x={x(-200)} y={18} width={x(0) - x(-200)} height={26} rx={5} className="eb-band" />
      <text x={(x(-200) + x(0)) / 2} y={36} textAnchor="middle" className="eb-note">word still being spoken</text>
      {[-200, -100, 0, 100, 200, 300, 400].map((v) => (
        <g key={v}>
          <line x1={x(v)} x2={x(v)} y1={T - 16} y2={T + 3 * h + 16} className={v === 0 ? 'eb-zero' : 'eb-grid'} />
          <text x={x(v)} y={T + 3 * h + 38} textAnchor="middle" className="eb-tick">{sgn(v)}</text>
        </g>
      ))}
      <text x={x(0) + 6} y={T + 3 * h + 60} className="eb-axis">word ends · milliseconds →</text>
      {TIMELINE.map(([n, v], i) => {
        const yy = T + i * h, ours = i === 0, dim = hover !== null && hover !== i;
        return (
          <g key={n} className={`eb-row${ours ? ' eb-ours' : ''}${dim ? ' eb-dim' : ''}`} onMouseEnter={() => setHover(i)} tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
            <rect x={0} y={yy - h / 2} width={680} height={h} fill="transparent" />
            <text x={L - 14} y={yy + 5} textAnchor="end" className="eb-lbl">{n}</text>
            <line x1={x(-200)} x2={x(v)} y1={yy} y2={yy} className="eb-stem" />
            <circle cx={x(v)} cy={yy} r={8} className="eb-dot" />
            <text x={x(v) + 15} y={yy + 5} className="eb-val">{ms(v)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------- Words predicted correctly before they end ----------

const KEPT: [string, number[]][] = [
  ['Audiobooks', [68.8, 3.4, 9.1, 25.4]],
  ['TED talks', [52.1, 1.0, 2.6, 17.6]],
  ['Public speech', [31.8, 1.0, 2.9, 11.3]],
  ['Synthetic', [56.9, 2.2, 6.8, 22.0]],
];
export function KeptBars() {
  const [hover, setHover] = useState<number | null>(null);
  const B = 220, T = 14, x0 = 52, gw = 148, bw = 27;
  const y = (v: number) => B - (v / 75) * (B - T);
  return (
    <>
      <Legend names={MODELS} active={hover} onHover={setHover} />
      <svg viewBox="0 0 640 262" role="img" aria-label="Share of words predicted correctly before they end, per test set. Earlybird 32 to 69%, the other models 1 to 25%." onMouseLeave={() => setHover(null)}>
        {[0, 20, 40, 60].map((v) => (
          <g key={v}>
            <line x1={x0 - 6} x2={632} y1={y(v)} y2={y(v)} className="eb-grid" />
            <text x={x0 - 12} y={y(v) + 4} textAnchor="end" className="eb-tick">{v}%</text>
          </g>
        ))}
        {KEPT.map(([n, vals], i) => {
          const gx = x0 + 12 + i * gw;
          return (
            <g key={n}>
              {vals.map((v, j) => (
                <g key={j} className={`eb-series eb-s${j}${hover !== null && hover !== j ? ' eb-dim' : ''}`} onMouseEnter={() => setHover(j)}>
                  <title>{`${n}, ${MODELS[j]}: ${v}%`}</title>
                  <rect x={gx + j * (bw + 5)} y={y(v)} width={bw} height={Math.max(1.5, B - y(v))} rx={3} className="eb-bar" />
                  <text x={gx + j * (bw + 5) + bw / 2} y={y(v) - 6} textAnchor="middle" className="eb-tick">{v < 10 ? v.toFixed(1) : Math.round(v)}</text>
                </g>
              ))}
              <text x={gx + (4 * bw + 15) / 2} y={B + 26} textAnchor="middle" className="eb-lbl">{n}</text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

function Legend({ names, active, onHover }: { names: string[]; active: number | null; onHover: (i: number | null) => void }) {
  return (
    <div className="eb-legend" onMouseLeave={() => onHover(null)}>
      {names.map((n, i) => (
        <button
          key={n}
          type="button"
          className={`eb-s${i}${active !== null && active !== i ? ' eb-dim' : ''}`}
          onMouseEnter={() => onHover(i)}
          onFocus={() => onHover(i)}
          onClick={() => onHover(active === i ? null : i)}
        >
          <i />
          {n}
        </button>
      ))}
    </div>
  );
}

// ---------- Calibration ----------

const REL: [string, [number, number][]][] = [
  ['Audiobooks', [[6.1, 6.7], [15.5, 18.2], [25.3, 34.6], [35.5, 45.4], [45.1, 55.8], [55.1, 68.6], [64.9, 73.2], [75.3, 77.9], [85.4, 84.9], [96.9, 96.0]]],
  ['TED talks', [[6.4, 3.4], [16.2, 18.9], [25.9, 31.5], [35.5, 41.5], [45.3, 52.0], [54.9, 62.6], [65.1, 70.2], [75.1, 73.1], [85.4, 83.0], [96.9, 94.8]]],
  ['Public speech', [[5.2, 2.6], [15.5, 16.7], [25.6, 25.0], [35.1, 38.8], [45.2, 47.4], [54.8, 57.9], [65.3, 62.5], [74.9, 66.0], [84.9, 74.1], [96.8, 90.6]]],
  ['Synthetic', [[5.0, 5.3], [14.8, 10.8], [25.5, 29.2], [35.2, 39.1], [45.1, 52.6], [54.8, 63.8], [65.0, 64.1], [75.4, 72.3], [85.4, 82.3], [96.6, 94.0]]],
];
export function Calibration() {
  const [set, setSet] = useState<number | null>(null);
  const [pt, setPt] = useState<[number, number] | null>(null);
  const W = 640, H = 340, L = 64, R = 30, T = 16, Bm = 52;
  const x = (v: number) => L + (v / 100) * (W - L - R), y = (v: number) => T + ((100 - v) / 100) * (H - T - Bm);
  const cy = T + (H - T - Bm) / 2;
  const tip = pt && { x: (x(REL[pt[0]][1][pt[1]][0]) / W) * 100, y: (y(REL[pt[0]][1][pt[1]][1]) / H) * 100, title: REL[pt[0]][0], lines: [`${REL[pt[0]][1][pt[1]][0]}% confident`, `right ${REL[pt[0]][1][pt[1]][1]}% of the time`] };
  return (
    <>
      <Legend names={REL.map(([n]) => n)} active={set} onHover={setSet} />
      <Frame tip={tip}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Stated confidence against how often the word is right, for words still being spoken. All four test sets lie close to the diagonal." onMouseLeave={() => { setPt(null); setSet(null); }}>
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="eb-grid" />
              <text x={L - 10} y={y(v) + 4} textAnchor="end" className="eb-tick">{v}%</text>
              <text x={x(v)} y={H - Bm + 22} textAnchor="middle" className="eb-tick">{v}%</text>
            </g>
          ))}
          <line x1={x(0)} y1={y(0)} x2={x(100)} y2={y(100)} className="eb-diag" />
          <text x={x(70)} y={y(70) - 10} textAnchor="end" className="eb-note" transform={`rotate(-28 ${x(70)} ${y(70) - 10})`}>perfectly calibrated</text>
          <text x={L + (W - L - R) / 2} y={H - 8} textAnchor="middle" className="eb-axis">Earlybird&rsquo;s confidence in the word</text>
          <text x={14} y={cy} textAnchor="middle" className="eb-axis" transform={`rotate(-90 14 ${cy})`}>How often it is right</text>
          {REL.map(([n, pts], i) => (
            <g key={n} className={`eb-series eb-s${i}${set !== null && set !== i ? ' eb-dim' : ''}`} onMouseEnter={() => setSet(i)}>
              <polyline points={pts.map((p) => `${x(p[0])},${y(p[1])}`).join(' ')} className="eb-line" />
              {pts.map((p, k) => (
                <circle key={k} cx={x(p[0])} cy={y(p[1])} r={4} className="eb-mark" onMouseEnter={() => setPt([i, k])} onMouseLeave={() => setPt(null)} />
              ))}
            </g>
          ))}
        </svg>
      </Frame>
    </>
  );
}

// ---------- One training example, with a slider for where the audio stops ----------

const WORDS: [string, number, number][] = [['turn', 120, 185], ['on', 197, 237], ['the', 249, 297], ['kitchen', 309, 455], ['lights', 469, 590]];
export function TrainingExample() {
  const [cut, setCut] = useState(372);
  const cy = 54;
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const bars: { x: number; h: number }[] = [];
  for (let bx = 118; bx <= 592; bx += 5) {
    const w = WORDS.find((w) => bx >= w[1] && bx <= w[2]);
    bars.push({ x: bx, h: w ? 6 + rnd() * 26 : 2 });
  }
  // The word being spoken at the cut, or the last one already finished.
  const cur = WORDS.findIndex(([, a, b]) => cut >= a && cut <= b);
  const last = cur >= 0 ? cur : WORDS.filter(([, a]) => a < cut).length - 1;
  return (
    <div>
      <svg viewBox="0 0 680 200" role="img" aria-label="Audio of 'turn on the kitchen lights' stops partway through. The target is every word heard so far, with the word being spoken written in full, plus a guess of the next word.">
        <text x={0} y={cy + 5} className="eb-axis">Audio heard</text>
        <text x={0} y={158} className="eb-axis">Target</text>
        {bars.map((b) => <rect key={b.x} x={b.x} y={cy - b.h / 2} width={3} height={b.h} rx={1.5} className={b.x <= cut ? 'eb-wave' : 'eb-wave eb-off'} />)}
        {WORDS.map(([t, a, b]) => <text key={t} x={(a + b) / 2} y={cy + 44} textAnchor="middle" className={a > cut ? 'eb-tick eb-faint' : 'eb-tick'}>{t}</text>)}
        <line x1={cut + 2} x2={cut + 2} y1={20} y2={cy + 28} className="eb-cut" />
        <text x={cut + 2} y={13} textAnchor="middle" className="eb-note eb-acc">audio stops here</text>
        {WORDS.map(([t, a, b], i) => {
          if (i > last + 1) return null;
          const isCur = i === cur, guess = i === last + 1;
          return (
            <g key={t}>
              <rect x={a} y={138} width={b - a} height={32} rx={8} className={isCur ? 'eb-chip eb-cur' : guess ? 'eb-chip eb-guess' : 'eb-chip'} />
              <text x={(a + b) / 2} y={159} textAnchor="middle" className={'eb-word' + (isCur ? ' eb-acc' : guess ? ' eb-faint' : '')}>{t}</text>
            </g>
          );
        })}
        {cur >= 0 && <text x={(WORDS[cur][1] + WORDS[cur][2]) / 2} y={192} textAnchor="middle" className="eb-note eb-acc">whole word, half heard</text>}
        {last + 1 < WORDS.length && <text x={(WORDS[last + 1][1] + WORDS[last + 1][2]) / 2} y={192} textAnchor="middle" className="eb-note">guess</text>}
      </svg>
      <label className="eb-slider">
        <span>Move where the audio stops</span>
        <input type="range" min={130} max={585} step={4} value={cut} onChange={(e) => setCut(Number(e.target.value))} />
      </label>
    </div>
  );
}
