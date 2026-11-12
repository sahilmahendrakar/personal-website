// @ts-nocheck
/* Animated SVG figures for the cold-start post. Plain DOM code: call it once the figure markup is on the page.
   It returns a function that stops the animation and clears what it drew. */
export function mountServingFigures() {
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent, text) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (text != null) n.textContent = text; if (parent) parent.appendChild(n); return n; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const mod = (a, n) => ((a % n) + n) % n, clamp = v => Math.max(0, Math.min(1, v)), ease = p => p * p * (3 - 2 * p);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ICON_PAUSE = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="1.5" width="2.6" height="9" rx="0.8" fill="currentColor"/><rect x="7.4" y="1.5" width="2.6" height="9" rx="0.8" fill="currentColor"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';

  const ICON_REPLAY = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.3 6a3.7 3.7 0 1 0 1.1-2.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2.6 1.4v2.4H5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SPEEDS = [0.25, 0.5, 1];
  const ICON_MAX = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M7.2 1.5h3.3v3.3M4.8 10.5H1.5V7.2M10.5 1.5 7 5M1.5 10.5 5 7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_MIN = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M10.5 4.8H7.2V1.5M1.5 7.2h3.3v3.3M7.2 4.8 10.8 1.2M4.8 7.2 1.2 10.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Bigger view: the figure floats over a dimmed page, sized to fit the window.
  let open = null;
  const backdrop = document.createElement('div');
  backdrop.className = 'csf-backdrop'; backdrop.hidden = true;
  document.querySelector('.csf')?.appendChild(backdrop);
  const fit = () => {
    if (!open) return;
    const vb = open.fig.querySelector('svg[id^="fig-"]').viewBox.baseVal;
    const chrome = open.fig.offsetHeight - open.fig.querySelector('svg[id^="fig-"]').getBoundingClientRect().height;
    const w = Math.min(1240, window.innerWidth * 0.96, (window.innerHeight * 0.94 - chrome) * vb.width / vb.height);
    open.fig.style.width = `${Math.round(w)}px`;
  };
  const setMax = (fig, btn, on) => {
    if (on) {
      if (open) setMax(open.fig, open.btn, false);
      const ph = document.createElement('div'); ph.style.height = `${fig.offsetHeight}px`; ph.className = 'csf-ph';
      fig.after(ph); open = { fig, btn, ph };
      fig.classList.add('is-max'); backdrop.hidden = false; document.documentElement.style.overflow = 'hidden';
      fit(); fit();
    } else if (open && open.fig === fig) {
      fig.classList.remove('is-max'); fig.style.width = ''; open.ph.remove(); open = null;
      backdrop.hidden = true; document.documentElement.style.overflow = '';
    }
    btn.innerHTML = on ? ICON_MIN : ICON_MAX;
    btn.setAttribute('aria-label', on ? 'Close the bigger view' : 'Open in a bigger view');
    btn.setAttribute('aria-expanded', String(on));
  };
  const closeOpen = () => { if (open) setMax(open.fig, open.btn, false); };
  const onKey = e => { if (e.key === 'Escape') closeOpen(); };
  backdrop.addEventListener('click', closeOpen);
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', fit);

  // Speed choices, replay and play/pause, the same for every figure.
  function controls(id, f) {
    const host = document.querySelector(`[data-fig="${id}"]`);
    host.innerHTML = `<div class="spd" role="group" aria-label="Animation speed">${SPEEDS.map(v => `<button type="button" data-v="${v}" aria-pressed="${v === f.speed}">${v}×</button>`).join('')}</div><button type="button" class="pp rp" aria-label="Replay from the start">${ICON_REPLAY}</button><button type="button" class="pp pl"></button><button type="button" class="pp mx"></button>`;
    const btn = host.querySelector('.pl');
    const label = () => { btn.innerHTML = f.playing ? ICON_PAUSE : ICON_PLAY; btn.setAttribute('aria-label', f.playing ? 'Pause' : 'Play'); };
    btn.addEventListener('click', () => { f.playing = !f.playing; label(); });
    const mx = host.querySelector('.mx'), fig = host.closest('figure');
    setMax(fig, mx, false);
    mx.addEventListener('click', () => setMax(fig, mx, !fig.classList.contains('is-max')));
    host.querySelector('.rp').addEventListener('click', () => { f.t = 0; f.draw(0); f.playing = true; label(); });
    host.querySelectorAll('.spd button').forEach(b => b.addEventListener('click', () => {
      f.speed = Number(b.dataset.v);
      host.querySelectorAll('.spd button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    }));
    label();
    return label;
  }
  // Drag (or arrow keys) on a strip of the figure to scrub through time.
  function scrubber(svg, f, box, T, toLocal, fromLocal, draw, label) {
    const hit = el('rect', { ...box, rx: 6, class: 'hit', tabindex: 0, role: 'slider', 'aria-label': 'Timeline: drag to scrub through the animation', 'aria-valuemin': 0, 'aria-valuemax': T.toFixed(1) }, svg);
    const toT = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return toLocal(pt.matrixTransform(svg.getScreenCTM().inverse()).x); };
    let held = false, was = false;
    const set = t => { f.t = Math.max(0, Math.min(T - 0.001, t)); draw(f.t); hit.setAttribute('aria-valuenow', f.t.toFixed(1)); };
    hit.addEventListener('pointerdown', e => { held = true; was = f.playing; f.playing = false; label(); hit.setPointerCapture(e.pointerId); set(toT(e)); e.preventDefault(); });
    hit.addEventListener('pointermove', e => { if (held) set(toT(e)); });
    const up = () => { if (held) { held = false; f.playing = was; label(); } };
    hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up);
    hit.addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; f.playing = false; label(); set(fromLocal(f.t, e.key === 'ArrowRight' ? 1 : -1, e.shiftKey)); e.preventDefault(); });
  }

  /* ---------------- Figure 1: one forward pass ---------------- */
  function passFigure(svg) {
    const L = 9, N = 8, LT = 0.8, READ = 0.55, MUL = 0.8, PICK = 1.3, PASS = L * LT + PICK;
    const PROMPT = ['The', ' capital', ' of', ' France', ' is'];
    const OUT = [' Paris', '.', ' It', ' is', ' known', ' for', ' its', ' food', '.'];
    const TOT = PASS * OUT.length;
    const r = rng(5), W = Array.from({ length: L }, () => Array.from({ length: N * N }, () => 0.15 + 0.85 * r()));
    const act = (tok, l) => { const o = []; for (let i = 0; i < N; i++) o.push(0.15 + 0.85 * Math.abs(Math.sin(1.7 * i + 2.3 * l + 0.9 * tok))); return o; };

    el('text', { x: 20, y: 22, class: 'cap' }, svg, 'TEXT SO FAR');
    const line = el('text', { x: 20, y: 50, 'font-size': 20 }, svg);
    // memory
    const mx = 20, mw = 150, lh = 18, lg = 5, by = 96, bh = L * (lh + lg) + 11, my = by + 8;
    el('text', { x: mx - 8, y: by - 10, class: 'cap' }, svg, 'GPU MEMORY');
    el('rect', { x: mx - 8, y: by, width: mw + 16, height: bh, rx: 10, class: 'box' }, svg);
    const layers = [], lText = [];
    for (let i = 0; i < L; i++) {
      layers.push(el('rect', { x: mx, y: my + i * (lh + lg), width: mw, height: lh, rx: 3, class: 'layer', 'fill-opacity': 0.18 }, svg));
      lText.push(el('text', { x: mx + 8, y: my + i * (lh + lg) + 13, class: 'mono', 'font-size': 10.5, fill: 'var(--paper)', opacity: 0 }, svg, `layer ${i + 1}`));
    }
    el('text', { x: mx - 8, y: by + bh + 18, class: 'mono t-mut', 'font-size': 10.5 }, svg, '');
    // compute
    const cx = 250, cw = 490, cell = 15, gap = 3, gx = cx + 150, gy = by + 50;
    el('text', { x: cx, y: by - 10, class: 'cap' }, svg, 'GPU COMPUTE');
    el('rect', { x: cx, y: by, width: cw, height: bh, rx: 12, class: 'box' }, svg);
    const status = el('text', { x: cx + cw, y: by - 10, class: 'mono t-ink', 'font-size': 11.5, 'text-anchor': 'end' }, svg, '');
    el('line', { x1: mx + mw + 10, y1: gy + 70, x2: cx - 4, y2: gy + 70, class: 'rd' }, svg);
    const tile = el('rect', { x: 0, y: gy + 64, width: 26, height: 12, rx: 2, class: 'layer', opacity: 0 }, svg);
    const vx = gx - 56, ox = gx + N * (cell + gap) + 40;
    el('text', { x: vx + cell / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, 'IN');
    el('text', { x: gx + (N * (cell + gap)) / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, '× WEIGHTS');
    el('text', { x: ox + cell / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, '= OUT');
    const vin = [], vout = [], mat = [], slide = [];
    for (let i = 0; i < N; i++) {
      vin.push(el('rect', { x: vx, y: gy + i * (cell + gap), width: cell, height: cell, rx: 3, class: 'fillc', 'fill-opacity': 0.2 }, svg));
      vout.push(el('rect', { x: ox, y: gy + i * (cell + gap), width: cell, height: cell, rx: 3, class: 'fillc', 'fill-opacity': 0 }, svg));
      for (let j = 0; j < N; j++) mat.push(el('rect', { x: gx + j * (cell + gap), y: gy + i * (cell + gap), width: cell, height: cell, rx: 2, class: 'layer', 'fill-opacity': 0.06 }, svg));
    }
    for (let i = 0; i < N; i++) slide.push(el('rect', { x: ox, y: gy + i * (cell + gap), width: cell, height: cell, rx: 3, class: 'fillc', 'fill-opacity': 0, stroke: 'var(--paper)', 'stroke-width': 1.5 }, svg));
    const sweep = el('rect', { x: gx - 2, y: gy - 2, width: N * (cell + gap) + 1, height: cell + 4, rx: 3, fill: 'none', stroke: 'var(--ours)', 'stroke-width': 1.6, opacity: 0 }, svg);
    const tx = ox + 44;
    el('text', { x: tx + 37, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, 'NEXT TOKEN');
    const tokBox = el('rect', { x: tx, y: gy + 54, width: 74, height: 34, rx: 8, fill: 'none', stroke: 'var(--hair)', 'stroke-width': 1.2 }, svg);
    const tokTxt = el('text', { x: tx + 37, y: gy + 76, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, class: 't-ink' }, svg, '');
    el('line', { x1: ox + cell + 6, y1: gy + 71, x2: tx - 6, y2: gy + 71, class: 'wire' }, svg);
    // pass bar: one segment per layer, then the token pick
    const SY = by + bh + 24, sx0 = 64, sw = 676, segW = sw / (L + 1);
    el('text', { x: 20, y: SY + 10, class: 'cap' }, svg, 'PASS');
    const segs = [];
    for (let i = 0; i <= L; i++) {
      el('rect', { x: sx0 + i * segW + 1, y: SY, width: segW - 2, height: 12, rx: 2, class: 'track' }, svg);
      segs.push(el('rect', { x: sx0 + i * segW + 1, y: SY, width: 0, height: 12, rx: 2, class: i < L ? 'layer' : 'fillc', 'fill-opacity': i < L ? 0.55 : 1 }, svg));
      el('text', { x: sx0 + i * segW + segW / 2, y: SY + 28, class: 'mono t-mut', 'font-size': 10, 'text-anchor': 'middle' }, svg, i < L ? `layer ${i + 1}` : 'token');
    }

    function draw(t) {
      const k = Math.floor(t / PASS), u = t - k * PASS, tokIdx = k % OUT.length;
      while (line.firstChild) line.removeChild(line.firstChild);
      PROMPT.forEach(w => el('tspan', { class: 't-2' }, line, w));
      OUT.slice(0, tokIdx).forEach(w => el('tspan', { class: 'fillc', 'font-weight': 600 }, line, w));
      el('tspan', { class: 't-mut', opacity: Math.floor(t * 2) % 2 ? 0.25 : 0.8 }, line, ' ▍');
      const inLayer = u < L * LT, li = inLayer ? Math.floor(u / LT) : L - 1, v = inLayer ? (u - li * LT) / LT : 1;
      const reading = inLayer && v < READ, rp = reading ? v / READ : 1, mEnd = li < L - 1 ? MUL : 1, mp = inLayer ? clamp((v - READ) / (mEnd - READ)) : 1;
      const sliding = inLayer && li < L - 1 && v >= MUL, sp = sliding ? ease((v - MUL) / (1 - MUL)) : 0;
      layers.forEach((rc, i) => { const on = inLayer && i === li; rc.setAttribute('fill-opacity', on ? 0.95 : (inLayer ? i < li : true) ? 0.4 : 0.18); lText[i].setAttribute('opacity', on ? 1 : 0); });
      tile.setAttribute('opacity', reading ? 1 : 0);
      tile.setAttribute('x', mx + mw + 10 + (cx - 30 - mx - mw - 10) * ease(rp));
      const w = W[li], ain = li === 0 ? act(k, -1) : act(k, li - 1), aout = act(k, li);
      mat.forEach((c, q) => c.setAttribute('fill-opacity', sliding ? w[q] * 0.7 * (1 - sp) + 0.06 * sp : inLayer ? (reading ? 0.06 + (w[q] * 0.7 - 0.06) * clamp(rp * 1.4 - Math.floor(q / N) * 0.05) : w[q] * 0.7) : 0.06));
      vin.forEach((c, i) => c.setAttribute('fill-opacity', sliding ? ain[i] * (1 - sp) : inLayer ? ain[i] : 0.15));
      const rowsDone = Math.floor(mp * N);
      vout.forEach((c, i) => c.setAttribute('fill-opacity', sliding ? 0 : inLayer ? (i < rowsDone ? aout[i] : 0) : aout[i] * 0.4));
      slide.forEach((c, i) => { c.setAttribute('fill-opacity', sliding ? aout[i] : 0); c.setAttribute('x', (ox + (vx - ox) * sp).toFixed(1)); });
      sweep.setAttribute('opacity', inLayer && !reading && !sliding && rowsDone < N ? 1 : 0);
      sweep.setAttribute('y', gy - 2 + Math.min(N - 1, rowsDone) * (cell + gap));
      const picking = !inLayer, pp = picking ? (u - L * LT) / PICK : 0;
      tokTxt.textContent = picking ? OUT[tokIdx].trim() : '';
      tokBox.setAttribute('stroke', picking ? 'var(--ours)' : 'var(--hair)');
      status.textContent = '';
      segs.forEach((s, i) => { const full = i < L ? (i < li || !inLayer ? 1 : i === li ? v : 0) : pp; s.setAttribute('width', Math.max(0, (segW - 2) * clamp(full))); });
    }
    const f = { t: reduce ? 3 * LT + 0.3 : 0, playing: !reduce, speed: 0.5, T: TOT, rate: 1, draw };
    const label = controls('pass', f);
    // The pass bar scrubs within the current token's pass.
    const toLocal = x => Math.floor(f.t / PASS) * PASS + clamp((x - sx0) / sw) * (PASS - 0.001);
    const fromLocal = (t, dir, big) => t + dir * (big ? PASS : LT / 2);
    scrubber(svg, f, { x: sx0 - 6, y: SY - 8, width: sw + 12, height: 42 }, TOT, toLocal, fromLocal, draw, label);
    return f;
  }

  /* ---------------- Figure 1b: one forward pass, four requests in the batch ---------------- */
  function passBatchFigure(svg) {
    const L = 9, N = 8, B = 4, LT = 0.8, READ = 0.55, MUL = 0.8, PICK = 1.3, PASS = L * LT + PICK;
    const REQ = [
      { id: 'A', prompt: ['The', ' capital', ' of', ' France', ' is'], out: [' Paris', '.', ' It', ' is', ' known', ' for', ' its', ' food', '.'] },
      { id: 'B', prompt: ['Water', ' boils', ' at'], out: [' 100', ' degrees', ' Celsius', ' at', ' sea', ' level', ' on', ' Earth', '.'] },
      { id: 'C', prompt: ['The', ' total', ' on', ' this', ' receipt', ' is'], out: [' $', '42', '.', '17', ' with', ' tax', ' and', ' tip', '.'] },
      { id: 'D', prompt: ['Two', ' plus', ' two', ' is'], out: [' four', '.', ' Two', ' times', ' two', ' is', ' also', ' four', '.'] },
    ];
    const NT = REQ[0].out.length, TOT = PASS * NT;
    const r = rng(5), W = Array.from({ length: L }, () => Array.from({ length: N * N }, () => 0.15 + 0.85 * r()));
    const act = (tok, l, b) => { const o = []; for (let i = 0; i < N; i++) o.push(0.15 + 0.85 * Math.abs(Math.sin(1.7 * i + 2.3 * l + 0.9 * tok + 1.3 * b))); return o; };

    el('text', { x: 20, y: 22, class: 'cap' }, svg, 'TEXT SO FAR');
    const lines = REQ.map((q, b) => {
      el('text', { x: 20, y: 48 + b * 25, class: 'mono t-mut', 'font-size': 11.5 }, svg, q.id);
      return el('text', { x: 40, y: 48 + b * 25, 'font-size': 16.5 }, svg);
    });
    // memory
    const mx = 20, mw = 150, lh = 18, lg = 5, by = 166, bh = L * (lh + lg) + 11, my = by + 8;
    el('text', { x: mx - 8, y: by - 10, class: 'cap' }, svg, 'GPU MEMORY');
    el('rect', { x: mx - 8, y: by, width: mw + 16, height: bh, rx: 10, class: 'box' }, svg);
    const layers = [], lText = [];
    for (let i = 0; i < L; i++) {
      layers.push(el('rect', { x: mx, y: my + i * (lh + lg), width: mw, height: lh, rx: 3, class: 'layer', 'fill-opacity': 0.18 }, svg));
      lText.push(el('text', { x: mx + 8, y: my + i * (lh + lg) + 13, class: 'mono', 'font-size': 10.5, fill: 'var(--paper)', opacity: 0 }, svg, `layer ${i + 1}`));
    }
    el('text', { x: mx - 8, y: by + bh + 18, class: 'mono t-mut', 'font-size': 10.5 }, svg, '');
    // compute
    const cx = 250, cw = 490, cell = 15, gap = 3, step = cell + gap, gy = by + 50;
    const vx = 266, gx = vx + B * step + 20, ox = gx + N * step + 20, tx = ox + B * step + 18, tw = cx + cw - 12 - tx;
    el('text', { x: cx, y: by - 10, class: 'cap' }, svg, 'GPU COMPUTE');
    el('rect', { x: cx, y: by, width: cw, height: bh, rx: 12, class: 'box' }, svg);
    const status = el('text', { x: cx + cw, y: by - 10, class: 'mono t-ink', 'font-size': 11.5, 'text-anchor': 'end' }, svg, '');
    el('line', { x1: mx + mw + 10, y1: gy + 70, x2: cx - 4, y2: gy + 70, class: 'rd' }, svg);
    const tile = el('rect', { x: 0, y: gy + 64, width: 26, height: 12, rx: 2, class: 'layer', opacity: 0 }, svg);
    el('text', { x: vx + (B * step - gap) / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, 'IN');
    el('text', { x: gx + (N * step - gap) / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, '× WEIGHTS');
    el('text', { x: ox + (B * step - gap) / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, '= OUT');
    el('text', { x: tx + tw / 2, y: gy - 12, class: 'cap', 'text-anchor': 'middle' }, svg, 'NEXT TOKENS');
    const vin = [], vout = [], mat = [], slide = [];
    for (let b = 0; b < B; b++) {
      vin.push([]); vout.push([]); slide.push([]);
      for (let i = 0; i < N; i++) {
        vin[b].push(el('rect', { x: vx + b * step, y: gy + i * step, width: cell, height: cell, rx: 3, class: 'fillc', 'fill-opacity': 0.2 }, svg));
        vout[b].push(el('rect', { x: ox + b * step, y: gy + i * step, width: cell, height: cell, rx: 3, class: 'fillc', 'fill-opacity': 0 }, svg));
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) mat.push(el('rect', { x: gx + j * step, y: gy + i * step, width: cell, height: cell, rx: 2, class: 'layer', 'fill-opacity': 0.06 }, svg));
    for (let b = 0; b < B; b++) for (let i = 0; i < N; i++) slide[b].push(el('rect', { x: ox + b * step, y: gy + i * step, width: cell, height: cell, rx: 3, class: 'fillc', 'fill-opacity': 0, stroke: 'var(--paper)', 'stroke-width': 1.5 }, svg));
    const sweep = el('rect', { x: gx - 2, y: gy - 2, width: N * step + 1, height: cell + 4, rx: 3, fill: 'none', stroke: 'var(--ours)', 'stroke-width': 1.6, opacity: 0 }, svg);
    const th = 26, tg = 6, ty0 = gy + (N * step - gap) / 2 - (B * th + (B - 1) * tg) / 2;
    const tokBox = [], tokTxt = [];
    for (let b = 0; b < B; b++) {
      const y = ty0 + b * (th + tg);
      el('text', { x: tx + 9, y: y + 17, class: 'mono t-mut', 'font-size': 10 }, svg, REQ[b].id);
      tokBox.push(el('rect', { x: tx, y, width: tw, height: th, rx: 7, fill: 'none', stroke: 'var(--hair)', 'stroke-width': 1.2 }, svg));
      tokTxt.push(el('text', { x: tx + tw / 2 + 6, y: y + 18, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, class: 't-ink' }, svg, ''));
    }
    // pass bar: one segment per layer, then the token pick
    const SY = by + bh + 24, sx0 = 64, sw = 676, segW = sw / (L + 1);
    el('text', { x: 20, y: SY + 10, class: 'cap' }, svg, 'PASS');
    const segs = [];
    for (let i = 0; i <= L; i++) {
      el('rect', { x: sx0 + i * segW + 1, y: SY, width: segW - 2, height: 12, rx: 2, class: 'track' }, svg);
      segs.push(el('rect', { x: sx0 + i * segW + 1, y: SY, width: 0, height: 12, rx: 2, class: i < L ? 'layer' : 'fillc', 'fill-opacity': i < L ? 0.55 : 1 }, svg));
      el('text', { x: sx0 + i * segW + segW / 2, y: SY + 28, class: 'mono t-mut', 'font-size': 10, 'text-anchor': 'middle' }, svg, i < L ? `layer ${i + 1}` : 'tokens');
    }

    function draw(t) {
      const k = Math.floor(t / PASS), u = t - k * PASS, tokIdx = k % NT;
      lines.forEach((line, b) => {
        while (line.firstChild) line.removeChild(line.firstChild);
        REQ[b].prompt.forEach(w => el('tspan', { class: 't-2' }, line, w));
        REQ[b].out.slice(0, tokIdx).forEach(w => el('tspan', { class: 'fillc', 'font-weight': 600 }, line, w));
        el('tspan', { class: 't-mut', opacity: Math.floor(t * 2) % 2 ? 0.25 : 0.8 }, line, ' ▍');
      });
      const inLayer = u < L * LT, li = inLayer ? Math.floor(u / LT) : L - 1, v = inLayer ? (u - li * LT) / LT : 1;
      const reading = inLayer && v < READ, rp = reading ? v / READ : 1, mEnd = li < L - 1 ? MUL : 1, mp = inLayer ? clamp((v - READ) / (mEnd - READ)) : 1;
      const sliding = inLayer && li < L - 1 && v >= MUL, sp = sliding ? ease((v - MUL) / (1 - MUL)) : 0;
      layers.forEach((rc, i) => { const on = inLayer && i === li; rc.setAttribute('fill-opacity', on ? 0.95 : (inLayer ? i < li : true) ? 0.4 : 0.18); lText[i].setAttribute('opacity', on ? 1 : 0); });
      tile.setAttribute('opacity', reading ? 1 : 0);
      tile.setAttribute('x', mx + mw + 10 + (cx - 30 - mx - mw - 10) * ease(rp));
      const w = W[li];
      mat.forEach((c, q) => c.setAttribute('fill-opacity', sliding ? w[q] * 0.7 * (1 - sp) + 0.06 * sp : inLayer ? (reading ? 0.06 + (w[q] * 0.7 - 0.06) * clamp(rp * 1.4 - Math.floor(q / N) * 0.05) : w[q] * 0.7) : 0.06));
      const rowsDone = Math.floor(mp * N);
      for (let b = 0; b < B; b++) {
        const ain = li === 0 ? act(k, -1, b) : act(k, li - 1, b), aout = act(k, li, b);
        vin[b].forEach((c, i) => c.setAttribute('fill-opacity', sliding ? ain[i] * (1 - sp) : inLayer ? ain[i] : 0.15));
        vout[b].forEach((c, i) => c.setAttribute('fill-opacity', sliding ? 0 : inLayer ? (i < rowsDone ? aout[i] : 0) : aout[i] * 0.4));
        slide[b].forEach((c, i) => { c.setAttribute('fill-opacity', sliding ? aout[i] : 0); c.setAttribute('x', (ox + b * step + (vx - ox) * sp).toFixed(1)); });
      }
      sweep.setAttribute('opacity', inLayer && !reading && !sliding && rowsDone < N ? 1 : 0);
      sweep.setAttribute('y', gy - 2 + Math.min(N - 1, rowsDone) * step);
      const picking = !inLayer, pp = picking ? (u - L * LT) / PICK : 0;
      for (let b = 0; b < B; b++) {
        tokTxt[b].textContent = picking ? REQ[b].out[tokIdx].trim() : '';
        tokBox[b].setAttribute('stroke', picking ? 'var(--ours)' : 'var(--hair)');
      }
      status.textContent = '';
      segs.forEach((s, i) => { const full = i < L ? (i < li || !inLayer ? 1 : i === li ? v : 0) : pp; s.setAttribute('width', Math.max(0, (segW - 2) * clamp(full))); });
    }
    const f = { t: reduce ? 2 * PASS + 3 * LT + 0.56 : 0, playing: !reduce, speed: 0.5, T: TOT, rate: 1, draw };
    const label = controls('passb', f);
    const toLocal = x => Math.floor(f.t / PASS) * PASS + clamp((x - sx0) / sw) * (PASS - 0.001);
    const fromLocal = (t, dir, big) => t + dir * (big ? PASS : LT / 2);
    scrubber(svg, f, { x: sx0 - 6, y: SY - 8, width: sw + 12, height: 42 }, TOT, toLocal, fromLocal, draw, label);
    return f;
  }

  /* ---------------- Figures 2 to 4: the batch on one GPU ---------------- */
  const G = { x: 232, y: 44, cols: 8, rows: 4, cell: 24, gap: 6, pad: 13, memW: 96, link: 62 };
  G.gridX = G.x + G.pad + G.memW + G.link;
  G.w = G.pad * 2 + G.memW + G.link + G.cols * G.cell + (G.cols - 1) * G.gap;
  G.h = 34 + G.rows * G.cell + (G.rows - 1) * G.gap + G.pad + 20;
  G.mid = G.y + G.h / 2 + 2;
  const P = 0.08, LAYERS = 9, SRC_X = 128, OUT_X = 744, TRAVEL = 0.8, OUT = 0.7;
  const TX = 132, TW = 612, Y_USE = 270, Y_BILL = 304, Y_LEG = 336;
  const GPU_T = 1.4, RESTORE_T = 1.0, LOAD_T = 1.8, COLD = GPU_T + RESTORE_T + LOAD_T, WARM = 3.0, DOWN = 0.5;
  const lens = [2.4, 2.1, 2.6, 2.2, 2.8, 2.3, 2.5, 2.0, 2.7, 2.2];
  const BURSTS = [[1.0, [0, 0.35]], [9.4, [0, 0.15, 0.3, 0.55, 0.8]], [19.4, [0, 0.25, 0.6]]];

  // Each job: arr (sent), joinK (first pass), need (passes), slot, src. Joins and tokens happen only on pass boundaries.
  function frontierJobs(T) {
    const r = rng(7), jobs = [], KT = Math.round(T / P);
    for (let s = 0; s < 32; s++) {
      const js = []; let t = 0;
      while (t < T - 1.2) { const w = 1.3 + r() * 1.9, g = 0.08 + r() * 0.45; js.push({ start: t + g, w, src: Math.floor(r() * 6) }); t += g + w; }
      const k = T / t, phase = r() * T;
      js.forEach(j => { const start = mod(j.start * k + phase, T), joinK = Math.ceil(start / P) % KT; jobs.push({ arr: mod(start - TRAVEL, T), joinK, need: Math.min(25, Math.max(2, Math.round(j.w * k * 0.97 / P))), s, src: j.src }); });
    }
    return { jobs, ups: null };
  }
  function burstJobs(cold) {
    const jobs = [], ups = []; let n = 0, cur = null;
    BURSTS.forEach(([at, offs]) => offs.forEach((o, k) => {
      const arr = at + o;
      if (cold && (!cur || arr >= cur.downStart)) { cur = { coldStart: arr, ready: arr + COLD, lastDone: 0 }; ups.push(cur); }
      const eff = Math.max(arr + TRAVEL, cold ? cur.ready : 0), joinK = Math.ceil(eff / P - 1e-9), need = Math.min(25, Math.max(2, Math.round(lens[n++ % lens.length] / P)));
      jobs.push({ arr, joinK, need, s: k, src: 0, up: cur });
      if (cold) { cur.lastDone = Math.max(cur.lastDone, (joinK + need) * P); cur.downStart = cur.lastDone + WARM; cur.downEnd = cur.downStart + DOWN; }
    }));
    return { jobs, ups: cold ? ups : null };
  }

  function batchFigure(svg, cfg) {
    const T = cfg.T, KT = Math.round(T / P), { jobs, ups } = cfg.make(), cold = !!ups, nSrc = cfg.sources.length;
    jobs.forEach(j => { j.done = ((j.joinK + j.need) % KT) * P; j.wait = mod(j.joinK * P - j.arr, T) - TRAVEL; });
    // Each queued request keeps one place in line, so dots never jump or pass each other.
    const QX = G.x - 16, QS = 11, queuedJob = j => j.wait > 0.12;
    jobs.forEach(j => { j.qi = queuedJob(j) ? jobs.filter(o => o !== j && queuedJob(o) && o.arr < j.arr && o.joinK * P > j.arr + TRAVEL).length : 0; });
    const dk = (j, t) => mod(Math.floor(t / P) - j.joinK, KT);
    const inBatch = (j, t) => dk(j, t) < j.need;
    const upAt = t => !cold || ups.find(u => t >= u.coldStart && t < u.downEnd);
    const phase = t => {
      if (!cold) return { name: jobs.some(j => inBatch(j, t)) ? 'serve' : 'idle' };
      const u = upAt(t); if (!u) return { name: 'off' };
      const c = t - u.coldStart;
      if (c < GPU_T) return { name: 'gpu', p: c / GPU_T };
      if (c < GPU_T + RESTORE_T) return { name: 'restore', p: (c - GPU_T) / RESTORE_T };
      if (t < u.ready) return { name: 'load', p: (c - GPU_T - RESTORE_T) / LOAD_T };
      if (t < u.downStart) return { name: jobs.some(j => j.up === u && inBatch(j, t)) ? 'serve' : 'warm' };
      return { name: 'down', p: (t - u.downStart) / DOWN };
    };
    const STATUS = { serve: 'Serving', idle: 'Idle', off: 'No GPU', gpu: 'Cold start · finding a GPU', restore: 'Cold start · starting the engine', load: 'Cold start · loading weights', warm: 'Idle · kept warm', down: 'Releasing the GPU' };
    const srcY = i => nSrc === 1 ? G.mid : 66 + i * 29;

    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: `${svg.id}-hatch`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'hatch-l' }, pat);
    el('text', { x: 20, y: 24, class: 'cap' }, svg, nSrc === 1 ? 'CUSTOMER' : 'CUSTOMERS');
    el('text', { x: G.x, y: 24, class: 'cap' }, svg, cfg.gpu);
    const OUT_END = nSrc === 1 ? OUT_X - 6 : OUT_X - 24, SX = nSrc === 1 ? 26 : SRC_X;
    cfg.sources.forEach((name, i) => {
      el('text', { x: 20, y: nSrc === 1 ? srcY(i) - 12 : srcY(i) + 5, class: 't-2', 'font-size': 14.5 }, svg, name);
      el('line', { x1: SX, y1: srcY(i), x2: G.x, y2: G.mid, class: 'wire' }, svg);
      el('circle', { cx: SX, cy: srcY(i), r: 3.2, class: 'src' }, svg);
      el('line', { x1: G.x + G.w, y1: G.mid, x2: OUT_END, y2: srcY(i), class: 'wire' }, svg);
      el('circle', { cx: OUT_END, cy: srcY(i), r: 3.2, class: 'src' }, svg);
      if (nSrc === 1) el('text', { x: OUT_X, y: srcY(i) - 12, class: 't-2', 'font-size': 14.5, 'text-anchor': 'end' }, svg, name);
    });
    const queueTxt = el('text', { x: QX + 4, y: G.mid - 12, class: 'mono t-mut', 'font-size': 10.5, 'text-anchor': 'end', opacity: 0 }, svg, 'queued');

    const boxOff = el('rect', { x: G.x, y: G.y, width: G.w, height: G.h, rx: 12, class: 'box-off', 'stroke-opacity': 0 }, svg);
    const boxOn = el('rect', { x: G.x, y: G.y, width: G.w, height: G.h, rx: 12, class: 'box' }, svg);
    const dot = el('circle', { cx: G.x + G.pad + 4, cy: G.y + 19, r: 4, fill: 'var(--muted)' }, svg);
    const statusTxt = el('text', { x: G.x + G.pad + 14, y: G.y + 23, class: 'mono t-ink', 'font-size': 12 }, svg, '');
    const gridG = el('g', {}, svg);
    const top = G.y + 34, slots = [];
    for (let s = 0; s < 32; s++) {
      const sx = G.gridX + (s % G.cols) * (G.cell + G.gap), sy = top + Math.floor(s / G.cols) * (G.cell + G.gap);
      el('rect', { x: sx, y: sy, width: G.cell, height: G.cell, rx: 5, class: 'slot' }, gridG);
      const clip = el('clipPath', { id: `${svg.id}-c${s}` }, svg);
      el('rect', { x: sx, y: sy, width: G.cell, height: G.cell, rx: 5 }, clip);
      const g = el('g', { 'clip-path': `url(#${svg.id}-c${s})` }, gridG);
      const base = el('rect', { x: sx, y: sy, width: G.cell, height: G.cell, class: 'fillc', 'fill-opacity': 0 }, g);
      const toks = [], TS = 3.6, TG = 1.2, off = (G.cell - (5 * TS + 4 * TG)) / 2;
      for (let q = 0; q < 25; q++) toks.push(el('rect', { x: sx + off + (q % 5) * (TS + TG), y: sy + off + Math.floor(q / 5) * (TS + TG), width: TS, height: TS, rx: 0.6, class: 'fillc', opacity: 0 }, g));
      slots.push({ base, toks, shown: -1 });
    }
    const mx = G.x + G.pad, mh = G.rows * G.cell + (G.rows - 1) * G.gap, lh = (mh - (LAYERS - 1) * 3) / LAYERS;
    const layers = [];
    for (let i = 0; i < LAYERS; i++) {
      el('rect', { x: mx, y: top + i * (lh + 3), width: G.memW, height: lh, rx: 2.5, class: 'layer-o' }, svg);
      const clip = el('clipPath', { id: `${svg.id}-l${i}` }, svg);
      const cr = el('rect', { x: mx, y: top + i * (lh + 3), width: G.memW, height: lh }, clip);
      layers.push({ r: el('rect', { x: mx, y: top + i * (lh + 3), width: G.memW, height: lh, rx: 2.5, class: 'layer', 'fill-opacity': 0.35, 'clip-path': `url(#${svg.id}-l${i})` }, svg), cr });
    }
    const memTxt = el('text', { x: mx, y: top + mh + 17, class: 'cap' }, svg, 'WEIGHTS');
    const batchTxt = el('text', { x: G.gridX, y: top + mh + 17, class: 'cap' }, svg, 'BATCH');
    const ly = top + mh / 2;
    const rdLine = el('line', { x1: mx + G.memW + 6, y1: ly, x2: G.gridX - 6, y2: ly, class: 'rd' }, svg);
    const passTxt = el('text', { x: mx + G.memW + G.link / 2, y: ly - 10, class: 'mono t-mut', 'font-size': 10, 'text-anchor': 'middle' }, svg, '');
    let stLine, stTile;
    if (cold) {
      const SB = G.y + G.h - 46;
      el('rect', { x: 20, y: SB, width: 150, height: 42, rx: 8, class: 'store' }, svg);
      el('text', { x: 32, y: SB + 18, class: 'cap' }, svg, 'STORAGE');
      el('text', { x: 32, y: SB + 33, class: 't-2', 'font-size': 12.5 }, svg, 'model weights');
      const stY = SB + 21;
      stLine = el('line', { x1: 176, y1: stY, x2: mx - 6, y2: stY, class: 'rd', 'stroke-opacity': 0.25 }, svg);
      stTile = el('rect', { x: 176, y: stY - 5, width: 22, height: 10, rx: 2, class: 'layer', opacity: 0 }, svg);
    }

    // Timeline
    const N = 600, samples = new Float32Array(N), work = new Uint8Array(N);
    for (let i = 0; i < N; i++) { const t = (i + 0.5) / N * T; let b = 0; for (const j of jobs) if (inBatch(j, t)) b++; samples[i] = Math.min(32, b) / 32; work[i] = b > 0; }
    const avg = samples.reduce((a, b) => a + b, 0) / N;
    const xAt = t => TX + t / T * TW;
    const billedShare = cold ? ups.reduce((a, u) => a + (u.downEnd - u.coldStart - GPU_T), 0) / T : 1;
    el('text', { x: 20, y: Y_USE - 1, class: 'mono t-2', 'font-size': 11.5 }, svg, 'Utilization');
    el('text', { x: 20, y: Y_USE + 13, class: 'mono t-mut', 'font-size': 10.5 }, svg, `avg ${Math.round(avg * 100)}%`);
    el('text', { x: 20, y: Y_BILL - 1, class: 'mono t-2', 'font-size': 11.5 }, svg, 'Billed');
    el('text', { x: 20, y: Y_BILL + 13, class: 'mono t-mut', 'font-size': 10.5 }, svg, `${Math.round(billedShare * 100)}% of the time`);
    el('rect', { x: TX, y: Y_USE - 15, width: TW, height: 30, rx: 3, class: 'track' }, svg);
    el('rect', { x: TX, y: Y_BILL - 6, width: TW, height: 12, rx: 3, class: 'track' }, svg);
    const rvClip = el('clipPath', { id: `${svg.id}-rv` }, svg);
    const rv = el('rect', { x: TX, y: Y_USE - 20, width: 0, height: 60 }, rvClip);
    const g2 = el('g', { 'clip-path': `url(#${svg.id}-rv)` }, svg);
    if (cold) ups.forEach(u => el('rect', { x: xAt(u.coldStart), y: Y_USE - 15, width: xAt(u.ready) - xAt(u.coldStart), height: 30, fill: `url(#${svg.id}-hatch)` }, g2));
    let wd = '', ud = '';
    for (let i = 0; i < N; i++) if (work[i]) { const x0 = (TX + i / N * TW).toFixed(1), dw = (TW / N + 0.4).toFixed(2); wd += `M${x0} ${Y_USE - 15}h${dw}v30h-${dw}Z`; ud += `M${x0} ${Y_USE + 15}h${dw}v-${(samples[i] * 30).toFixed(2)}h-${dw}Z`; }
    el('path', { d: wd, class: 'work' }, g2);
    el('path', { d: ud, class: 'use' }, g2);
    if (cold) ups.forEach(u => el('rect', { x: xAt(u.coldStart + GPU_T), y: Y_BILL - 6, width: xAt(u.downEnd) - xAt(u.coldStart + GPU_T), height: 12, rx: 3, class: 'bill' }, g2));
    else el('rect', { x: TX, y: Y_BILL - 6, width: TW, height: 12, rx: 3, class: 'bill' }, g2);
    const head = el('line', { x1: TX, x2: TX, y1: Y_USE - 20, y2: Y_BILL + 9, class: 'head' }, svg);
    const knob = el('circle', { cx: TX, cy: Y_USE - 20, r: 4.5, class: 'knob' }, svg);
    // Legend
    let lx = TX;
    const sw = (draw, text) => { draw(lx); el('text', { x: lx + 15, y: Y_LEG + 4, class: 'mono t-mut', 'font-size': 10.5 }, svg, text); lx += 15 + text.length * 6.4 + 18; };
    if (cold) sw(x => el('rect', { x, y: Y_LEG - 5, width: 10, height: 10, rx: 2, fill: `url(#${svg.id}-hatch)`, stroke: 'var(--hair)' }, svg), 'cold start');

    const pk = jobs.map(() => el('circle', { r: 4.5, class: 'pkt', opacity: 0 }, svg));
    const an = jobs.map(() => el('circle', { r: 4.5, class: 'ans', opacity: 0 }, svg));

    function draw(t) {
      const ph = phase(t), name = ph.name, serving = name === 'serve';
      const boxA = !cold ? 1 : name === 'off' ? 0 : name === 'gpu' ? ph.p : name === 'down' ? 1 - ph.p : 1;
      boxOn.setAttribute('stroke-opacity', boxA); boxOff.setAttribute('stroke-opacity', cold ? 1 - boxA : 0);
      gridG.setAttribute('opacity', !cold ? 1 : name === 'off' || name === 'gpu' ? 0.25 : name === 'restore' ? 0.25 + 0.75 * ph.p : name === 'down' ? 1 - 0.75 * ph.p : 1);
      const loaded = !cold ? LAYERS : name === 'load' ? ph.p * LAYERS : name === 'serve' || name === 'warm' ? LAYERS : name === 'down' ? LAYERS * (1 - ph.p) : 0;
      const li = Math.min(LAYERS - 1, Math.floor(mod(t, P) / P * LAYERS));
      layers.forEach((Lr, i) => {
        Lr.cr.setAttribute('width', (G.memW * clamp(loaded - i)).toFixed(1));
        Lr.r.setAttribute('fill-opacity', serving ? (i === li ? 0.95 : i < li ? 0.55 : 0.35) : name === 'load' && i === Math.floor(loaded) ? 0.8 : 0.35);
      });
      if (cold) {
        memTxt.textContent = 'WEIGHTS';
        const loading = name === 'load';
        stLine.setAttribute('stroke-opacity', loading ? 0.9 : 0.25);
        if (loading) { stLine.setAttribute('stroke-dashoffset', (-t * 30).toFixed(1)); stTile.setAttribute('x', (176 + (mx - 30 - 176) * ease(mod(ph.p * LAYERS, 1))).toFixed(1)); }
        stTile.setAttribute('opacity', loading ? 1 : 0);
      }
      rdLine.setAttribute('stroke-opacity', serving ? 0.9 : 0.25);
      if (serving) rdLine.setAttribute('stroke-dashoffset', (-t * 30).toFixed(1));
      passTxt.textContent = '';
      // requests in, the queue, answers out
      let busy = 0, queued = 0;
      slots.forEach(sl => { sl.on = false; });
      jobs.forEach((j, k) => {
        const sl = slots[j.s];
        if (inBatch(j, t)) { sl.on = true; sl.n = dk(j, t); }
        const s = mod(t - j.arr, T), y0 = srcY(j.src), qd = queuedJob(j);
        if (s < TRAVEL) {
          const p = ease(s / TRAVEL), endX = qd ? QX - j.qi * QS : G.x;
          pk[k].setAttribute('cx', SX + (endX - SX) * p); pk[k].setAttribute('cy', y0 + (G.mid - y0) * p); pk[k].setAttribute('opacity', 1);
        } else if (qd && s < TRAVEL + j.wait) {
          pk[k].setAttribute('cx', QX - j.qi * QS); pk[k].setAttribute('cy', G.mid); pk[k].setAttribute('opacity', 1); queued++;
        } else pk[k].setAttribute('opacity', 0);
        const o = mod(t - j.done, T);
        if (o < OUT) { const p = ease(o / OUT), y1 = srcY(j.src); an[k].setAttribute('cx', G.x + G.w + (OUT_END - G.x - G.w) * p); an[k].setAttribute('cy', G.mid + (y1 - G.mid) * p); an[k].setAttribute('opacity', (0.55 * Math.min(1, (1 - o / OUT) * 4)).toFixed(2)); }
        else an[k].setAttribute('opacity', 0);
      });
      queueTxt.setAttribute('opacity', queued ? 1 : 0);
      slots.forEach(sl => {
        const n = sl.on ? sl.n : -1;
        if (sl.on) busy++;
        if (n !== sl.shown) { sl.shown = n; sl.base.setAttribute('fill-opacity', sl.on ? 0.12 : 0); sl.toks.forEach((r, q) => r.setAttribute('opacity', q < n ? (q === n - 1 ? 1 : 0.6) : 0)); }
      });
      statusTxt.textContent = STATUS[name];
      statusTxt.setAttribute('class', name === 'off' ? 'mono t-mut' : 'mono t-ink');
      dot.setAttribute('fill', serving ? 'var(--ours)' : name === 'gpu' || name === 'restore' || name === 'load' ? 'var(--gpt)' : 'var(--muted)');
      dot.setAttribute('fill-opacity', name === 'off' ? 0.5 : 1);
      batchTxt.textContent = `BATCH · ${busy} / 32`;
      const x = xAt(t);
      rv.setAttribute('width', x - TX); head.setAttribute('x1', x); head.setAttribute('x2', x); knob.setAttribute('cx', x);
    }
    const f = { t: reduce ? cfg.still : 0, playing: !reduce, speed: 0.5, T, rate: 0.8, draw };
    const label = controls(cfg.id, f);
    scrubber(svg, f, { x: TX - 8, y: Y_USE - 26, width: TW + 16, height: Y_BILL - Y_USE + 38 }, T, x => (x - TX) / TW * T, (t, dir, big) => t + dir * (big ? T / 10 : T / 60), draw, label);
    return f;
  }

  /* ---------------- Figure 5: a cold start, stage by stage ---------------- */
  function dissectFigure(svg) {
    const PATHS = [
      { name: 'AWS · stopped GPU box', stages: [
        ['gpu', 53, 'Finding a GPU', 'L40S capacity refused, retried 40 to 66 s later'],
        ['boot', 20, 'Booting the instance', 'starting the stopped machine'],
        ['imports', 46, 'Importing Python and vLLM', 'loading the inference engine'],
        ['weights', 153, 'Loading 18 GB of weights', 'bf16, from an EBS disk at about 130 MB/s'],
        ['warmup', 128, 'Warming up the engine', 'profiling memory, compiling, capturing CUDA graphs']] },
      { name: 'Modal · fresh start', stages: [
        ['gpu', 5, 'Finding a GPU', 'a few seconds when one is free, minutes when none is'],
        ['imports', 70, 'Importing Python and vLLM', 'loading the inference engine'],
        ['weights', 35, 'Loading 18 GB of weights', 'the same bf16 checkpoint, from a Modal volume'],
        ['warmup', 70, 'Warming up the engine', 'compile caches kept on a volume']] },
      { name: 'Modal · from a snapshot', stages: [
        ['gpu', 5, 'Finding a GPU', 'a few seconds when one is free, minutes when none is'],
        ['restore', 7, 'Restoring the memory snapshot', 'a running, warmed-up engine, minus its weights'],
        ['weights', 5.6, 'Reloading the weights', '4.5 to 6.7 s from the volume'],
        ['kv', 2, 'Rebuilding the KV cache', 'and reloading the speculative-decoding head']] },
    ];
    PATHS.forEach(p => { let a = 0; p.stages = p.stages.map(([id, d, label, note]) => { const s = { id, d, label, note, a, b: a + d }; a += d; return s; }); p.total = a; });
    const SIMT = 440, AX = 200, AW = 540, AMAX = 420, xAt = s => AX + Math.min(s, AMAX) / AMAX * AW;
    const fmt = s => s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
    const prog = (p, id, t) => { const s = p.stages.find(x => x.id === id); return s ? clamp((t - s.a) / s.d) : null; };
    const STYLE = { gpu: { fill: `url(#${svg.id}-hatch)` }, boot: { class: 'layer', 'fill-opacity': 0.5 }, imports: { class: 'layer', 'fill-opacity': 0.5 }, weights: { class: 'fillc' }, warmup: { class: 'layer', 'fill-opacity': 0.22 }, request: { class: 'layer', 'fill-opacity': 0.22 }, restore: { class: 'fillc', 'fill-opacity': 0.4 }, kv: { class: 'fillc', 'fill-opacity': 0.4 } };
    let sel = 0;
    const segBtns = PATHS.map((p, r) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = p.name; b.addEventListener('click', () => select(r)); document.querySelector('[data-seg="dissect"]').appendChild(b); return b; });
    const select = r => { sel = r; segBtns.forEach((b, i) => b.setAttribute('aria-selected', i === r)); f.draw(f.t); };
    segBtns.forEach((b, i) => b.setAttribute('aria-selected', i === sel));

    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: `${svg.id}-hatch`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'hatch-l' }, pat);

    // Storage
    el('text', { x: 20, y: 22, class: 'cap' }, svg, 'STORAGE');
    el('rect', { x: 20, y: 38, width: 150, height: 46, rx: 8, class: 'store' }, svg);
    el('text', { x: 32, y: 56, class: 'cap' }, svg, 'DISK / VOLUME');
    el('text', { x: 32, y: 73, class: 't-2', 'font-size': 12.5 }, svg, 'model weights');
    const snapG = el('g', {}, svg);
    el('rect', { x: 20, y: 100, width: 150, height: 46, rx: 8, class: 'store' }, snapG);
    el('text', { x: 32, y: 118, class: 'cap' }, snapG, 'SNAPSHOT');
    el('text', { x: 32, y: 135, class: 't-2', 'font-size': 12.5 }, snapG, 'engine memory');
    const wLine = el('line', { x1: 176, y1: 61, x2: 232, y2: 61, class: 'rd' }, svg);
    const sLine = el('line', { x1: 176, y1: 123, x2: 232, y2: 123, class: 'rd' }, svg);

    // The machine
    const MX = 220, MY = 32, MW = 520, MH = 128;
    el('text', { x: MX, y: 22, class: 'cap' }, svg, 'GPU MACHINE');
    const following = el('text', { x: MX + MW, y: 22, class: 'cap', 'text-anchor': 'end' }, svg, '');
    const boxOff = el('rect', { x: MX, y: MY, width: MW, height: MH, rx: 12, class: 'box-off' }, svg);
    const boxOn = el('rect', { x: MX, y: MY, width: MW, height: MH, rx: 12, class: 'box' }, svg);
    const inner = el('g', {}, svg);
    el('text', { x: 236, y: 54, class: 'cap' }, inner, 'WEIGHTS');
    const wb = [];
    for (let i = 0; i < 9; i++) {
      const y = 62 + i * 10;
      el('rect', { x: 236, y, width: 150, height: 7, rx: 2, class: 'layer-o' }, inner);
      const clip = el('clipPath', { id: `${svg.id}-w${i}` }, svg), cr = el('rect', { x: 236, y, width: 0, height: 7 }, clip);
      el('rect', { x: 236, y, width: 150, height: 7, rx: 2, class: 'fillc', 'fill-opacity': 0.85, 'clip-path': `url(#${svg.id}-w${i})` }, inner);
      wb.push(cr);
    }
    el('text', { x: 406, y: 54, class: 'cap' }, inner, 'KV CACHE');
    const kv = [];
    for (let i = 0; i < 21; i++) kv.push(el('rect', { x: 406 + (i % 7) * 19, y: 60 + Math.floor(i / 7) * 17, width: 16, height: 14, rx: 3, class: 'slot' }, inner));
    el('text', { x: 406, y: 126, class: 'cap' }, inner, 'CUDA GRAPHS');
    el('rect', { x: 406, y: 133, width: 130, height: 8, rx: 2, class: 'track' }, inner);
    const graphs = el('rect', { x: 406, y: 133, width: 0, height: 8, rx: 2, class: 'layer', 'fill-opacity': 0.5 }, inner);
    el('line', { x1: 558, y1: 46, x2: 558, y2: 146, class: 'wire' }, inner);
    el('text', { x: 574, y: 54, class: 'cap' }, inner, 'ENGINE');
    const eng = [['boot', 'machine boot'], ['imports', 'Python + vLLM']].map(([id, t], i) => {
      const y = 84 + i * 32;
      const lab = el('text', { x: 574, y, class: 't-2', 'font-size': 11.5 }, inner, t);
      el('rect', { x: 574, y: y + 5, width: 150, height: 6, rx: 2, class: 'track' }, inner);
      const bar = el('rect', { x: 574, y: y + 5, width: 0, height: 6, rx: 2, class: 'layer', 'fill-opacity': 0.5 }, inner);
      return { id, lab, bar };
    });
    const waitTxt = el('text', { x: MX + MW / 2, y: MY + MH / 2 + 5, class: 'mono t-mut', 'font-size': 12, 'text-anchor': 'middle' }, svg, '');
    const stepTxt = el('text', { x: MX, y: 184, 'font-size': 14 }, svg);
    const stepA = el('tspan', { class: 't-ink', 'font-weight': 600 }, stepTxt, ''), stepB = el('tspan', { class: 't-mut' }, stepTxt, '');

    // Gantt chart, to scale
    const RY = [222, 260, 298], RH = 18;
    for (let m = 0; m <= 7; m++) {
      const x = xAt(m * 60);
      el('line', { x1: x, y1: 210, x2: x, y2: 324, stroke: 'var(--grid)', 'stroke-width': 1 }, svg);
      el('text', { x, y: 340, class: 'mono t-mut', 'font-size': 10, 'text-anchor': m ? 'middle' : 'start' }, svg, m ? `${m} min` : '0');
    }
    const rows = PATHS.map((p, r) => {
      const y = RY[r];
      el('rect', { x: AX, y, width: AW, height: RH, rx: 3, class: 'track' }, svg);
      const clip = el('clipPath', { id: `${svg.id}-r${r}` }, svg), rv = el('rect', { x: AX, y: y - 2, width: 0, height: RH + 4 }, clip);
      const g = el('g', { 'clip-path': `url(#${svg.id}-r${r})` }, svg);
      p.stages.forEach(s => el('rect', { x: xAt(s.a), y, width: Math.max(1, xAt(s.b) - xAt(s.a) - 1), height: RH, ...STYLE[s.id] }, g));
      const bg = el('rect', { x: 10, y: y - 9, width: AX - 18, height: RH + 18, rx: 7, fill: 'var(--soft)', stroke: 'var(--hair)', 'stroke-width': 1, opacity: 0 }, svg);
      el('circle', { cx: 24, cy: y + 9, r: 5.5, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.2 }, svg);
      const radio = el('circle', { cx: 24, cy: y + 9, r: 3, class: 'fillc', opacity: 0 }, svg);
      const name = el('text', { x: 36, y: y + 13.5, 'font-size': 13 }, svg, p.name);
      const tot = el('text', { x: 36, y: y + 22, class: 't-mut', 'font-size': 11.5 }, svg, '');
      const done = el('text', { x: xAt(p.total) + 6, y: y + 13, class: 'mono t-ink', 'font-size': 10.5, opacity: 0 }, svg, fmt(p.total));
      const hit = el('rect', { x: 10, y: y - 8, width: AX - 16, height: RH + 16, rx: 6, fill: 'transparent', style: 'cursor:pointer', tabindex: 0, role: 'button', 'aria-label': `Follow ${p.name} in the diagram` }, svg);
      const pick = () => select(r);
      hit.addEventListener('click', pick); hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { pick(); e.preventDefault(); } });
      return { rv, name, tot, done, hit, bg, radio };
    });
    const head = el('line', { x1: AX, x2: AX, y1: 210, y2: 324, class: 'head' }, svg);
    const knob = el('circle', { cx: AX, cy: 210, r: 4.5, class: 'knob' }, svg);
    const clock = el('text', { x: AX, y: 203, class: 'mono t-ink', 'font-size': 11, 'text-anchor': 'middle' }, svg, '');
    // Legend
    let lx = 20; const LY = 366;
    [['gpu', 'waiting for a GPU'], ['imports', 'boot and imports'], ['weights', 'loading weights'], ['warmup', 'engine warm-up'], ['restore', 'snapshot restore']].forEach(([id, text]) => {
      el('rect', { x: lx, y: LY - 5, width: 10, height: 10, rx: 2, ...STYLE[id], ...(id === 'gpu' ? { stroke: 'var(--hair)' } : {}) }, svg);
      el('text', { x: lx + 15, y: LY + 4, class: 'mono t-mut', 'font-size': 10.5 }, svg, text);
      lx += 15 + text.length * 6.4 + 20;
    });

    function draw(T) {
      const t = Math.min(T, AMAX), p = PATHS[sel];
      following.textContent = '';
      rows.forEach((rw, r) => {
        const q = PATHS[r];
        rw.rv.setAttribute('width', Math.max(0, xAt(t) - AX));
        rw.name.setAttribute('class', r === sel ? 't-ink' : 't-mut'); rw.name.setAttribute('font-weight', r === sel ? 600 : 400);
        rw.bg.setAttribute('opacity', r === sel ? 1 : 0); rw.radio.setAttribute('opacity', r === sel ? 1 : 0); rw.hit.setAttribute('aria-pressed', r === sel);
        rw.tot.textContent = '';
        rw.done.setAttribute('opacity', t >= q.total ? 1 : 0);
      });
      const x = xAt(t); head.setAttribute('x1', x); head.setAttribute('x2', x); knob.setAttribute('cx', x); clock.setAttribute('x', x); clock.textContent = fmt(t);
      // The machine, for the selected path
      const found = prog(p, 'gpu', t) >= 1, ready = t >= p.total;
      boxOn.setAttribute('stroke-opacity', found ? 1 : 0); boxOff.setAttribute('stroke-opacity', found ? 0 : 1);
      boxOn.setAttribute('stroke', ready ? 'var(--ours)' : 'var(--ink)');
      inner.setAttribute('opacity', found ? 1 : 0.25);
      waitTxt.textContent = found ? '' : `waiting for a free GPU${'.'.repeat(1 + Math.floor(T * 2) % 3)}`;
      const usesSnap = p.stages.some(s => s.id === 'restore');
      snapG.setAttribute('opacity', usesSnap ? 1 : 0.35);
      const pw = prog(p, 'weights', t), pr = prog(p, 'restore', t), pk = prog(p, 'kv', t), pwu = prog(p, 'warmup', t);
      wb.forEach((cr, i) => cr.setAttribute('width', (150 * clamp(pw * 9 - i)).toFixed(1)));
      const kvFill = pk != null ? pk : clamp(pwu * 2);
      kv.forEach((c, i) => { const on = i < Math.round(kvFill * kv.length); c.setAttribute('class', on ? 'fillc' : 'slot'); c.setAttribute('fill-opacity', on ? 0.35 : 1); });
      graphs.setAttribute('width', (130 * (pr != null ? pr : clamp(pwu * 2 - 1))).toFixed(1));
      graphs.setAttribute('fill-opacity', pr != null ? 0.4 : 0.5); graphs.setAttribute('class', pr != null ? 'fillc' : 'layer');
      eng.forEach(e => {
        let v = prog(p, e.id, t), restored = false;
        if (e.id === 'imports' && v == null && pr != null) { v = pr; restored = true; }
        const has = v != null;
        e.lab.setAttribute('opacity', has ? 1 : 0.4);
        e.bar.setAttribute('width', (150 * (has ? v : 0)).toFixed(1));
        e.bar.setAttribute('class', restored ? 'fillc' : 'layer'); e.bar.setAttribute('fill-opacity', restored ? 0.4 : 0.5);
      });
      if (!p.stages.some(s => s.id === 'boot')) { eng[0].bar.setAttribute('width', found ? 150 : 0); eng[0].bar.setAttribute('fill-opacity', 0.2); }
      const fl = (line, on) => { line.setAttribute('stroke-opacity', on ? 0.9 : 0.2); if (on) line.setAttribute('stroke-dashoffset', (-T * 6).toFixed(1)); };
      fl(wLine, pw > 0 && pw < 1); fl(sLine, pr != null && pr > 0 && pr < 1);
      const cur = p.stages.find(s => t >= s.a && t < s.b);
      if (cur) { stepA.textContent = `${fmt(t)} · ${cur.label}`; stepB.textContent = ''; }
      else { stepA.textContent = `${fmt(p.total)} · Ready`; stepB.textContent = ''; }
    }
    const f = { t: reduce ? 120 : 0, playing: !reduce, speed: 0.5, T: SIMT, rate: 20, draw };
    const label = controls('dissect', f);
    scrubber(svg, f, { x: AX - 6, y: 196, width: AW + 12, height: 132 }, SIMT, x => (x - AX) / AW * AMAX, (t, dir, big) => t + dir * (big ? 60 : 10), draw, label);
    return f;
  }

  /* ---------------- Figure 6: the same traffic with slow and fast cold starts ---------------- */
  function compareFigure(svg) {
    const T = 30, TR = 0.3, OUTT = 0.3, BURSTS = [1.5, 11, 20.5], OFFS = [0, 0.05, 0.1, 0.15, 0.2, 0.25]; // minutes
    const V = [
      { name: 'Fresh start', cold: 5, idle: 1, sub: 'wakes in 5 min · 1 min idle',
        phases: [['gpu', 0.03, 'Cold start · finding a GPU'], ['engine', 0.39, 'Cold start · importing Python and vLLM'], ['weights', 0.19, 'Cold start · loading weights'], ['warmup', 0.39, 'Cold start · warming up the engine']] },
      { name: 'From a snapshot', cold: 1 / 3, idle: 1 / 6, sub: 'wakes in 20 s · 10 s idle',
        phases: [['gpu', 0.25, 'Cold start · finding a GPU'], ['engine', 0.35, 'Cold start · restoring the snapshot'], ['weights', 0.3, 'Cold start · reloading weights'], ['warmup', 0.1, 'Cold start · rebuilding the KV cache']] },
    ];
    const fmt = m => { const s = Math.round(m * 60); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    V.forEach(v => {
      v.ups = []; v.reqs = []; let cur = null;
      BURSTS.forEach(at => {
        if (!cur || at >= cur.down) { cur = { start: at, ready: at + v.cold, serveEnd: 0 }; v.ups.push(cur); }
        OFFS.forEach((o, k) => {
          const arr = at + o, join = Math.max(arr + TR, cur.ready), done = join + 0.2 + 0.15 * k;
          v.reqs.push({ arr, join, done, k, up: cur, queued: join > arr + TR + 1e-9 });
          cur.serveEnd = Math.max(cur.serveEnd, done); cur.down = cur.serveEnd + v.idle;
        });
      });
      v.waits = BURSTS.map(at => { const r = v.reqs.find(r => Math.abs(r.arr - at) < 1e-9); return { at, ans: r.done }; });
    });
    let sel = 0;
    const defs = el('defs', {}, svg);
    const pat = el('pattern', { id: `${svg.id}-hatch`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, class: 'hatch-l' }, pat);

    /* GPU view, as in Figure 4, for the selected start */
    const SX = 26, OUT_END = OUT_X - 6, QX = G.x - 16, QS = 11;
    el('text', { x: 20, y: 24, class: 'cap' }, svg, 'CUSTOMER');
    const gpuCap = el('text', { x: G.x, y: 24, class: 'cap' }, svg, '');
    el('text', { x: 20, y: G.mid - 12, class: 't-2', 'font-size': 14.5 }, svg, 'Customer');
    el('line', { x1: SX, y1: G.mid, x2: G.x, y2: G.mid, class: 'wire' }, svg);
    el('circle', { cx: SX, cy: G.mid, r: 3.2, class: 'src' }, svg);
    el('line', { x1: G.x + G.w, y1: G.mid, x2: OUT_END, y2: G.mid, class: 'wire' }, svg);
    el('circle', { cx: OUT_END, cy: G.mid, r: 3.2, class: 'src' }, svg);
    el('text', { x: OUT_X, y: G.mid - 12, class: 't-2', 'font-size': 14.5, 'text-anchor': 'end' }, svg, 'Customer');
    const queueTxt = el('text', { x: QX + 4, y: G.mid - 12, class: 'mono', 'font-size': 10.5, 'text-anchor': 'end', fill: 'var(--gpt)' }, svg, '');
    const boxOff = el('rect', { x: G.x, y: G.y, width: G.w, height: G.h, rx: 12, class: 'box-off' }, svg);
    const boxOn = el('rect', { x: G.x, y: G.y, width: G.w, height: G.h, rx: 12, class: 'box' }, svg);
    const dot = el('circle', { cx: G.x + G.pad + 4, cy: G.y + 19, r: 4, fill: 'var(--muted)' }, svg);
    const statusTxt = el('text', { x: G.x + G.pad + 14, y: G.y + 23, class: 'mono t-ink', 'font-size': 12 }, svg, '');
    const gridG = el('g', {}, svg);
    const top = G.y + 34, slots = [];
    for (let s = 0; s < 32; s++) {
      const sx = G.gridX + (s % G.cols) * (G.cell + G.gap), sy = top + Math.floor(s / G.cols) * (G.cell + G.gap);
      el('rect', { x: sx, y: sy, width: G.cell, height: G.cell, rx: 5, class: 'slot' }, gridG);
      const clip = el('clipPath', { id: `${svg.id}-c${s}` }, svg);
      el('rect', { x: sx, y: sy, width: G.cell, height: G.cell, rx: 5 }, clip);
      const g = el('g', { 'clip-path': `url(#${svg.id}-c${s})` }, gridG);
      const base = el('rect', { x: sx, y: sy, width: G.cell, height: G.cell, class: 'fillc', 'fill-opacity': 0 }, g);
      const toks = [], TS = 3.6, TG = 1.2, off = (G.cell - (5 * TS + 4 * TG)) / 2;
      for (let q = 0; q < 25; q++) toks.push(el('rect', { x: sx + off + (q % 5) * (TS + TG), y: sy + off + Math.floor(q / 5) * (TS + TG), width: TS, height: TS, rx: 0.6, class: 'fillc', opacity: 0 }, g));
      slots.push({ base, toks });
    }
    const mx = G.x + G.pad, mh = G.rows * G.cell + (G.rows - 1) * G.gap, lh = (mh - (LAYERS - 1) * 3) / LAYERS;
    const layers = [];
    for (let i = 0; i < LAYERS; i++) {
      el('rect', { x: mx, y: top + i * (lh + 3), width: G.memW, height: lh, rx: 2.5, class: 'layer-o' }, svg);
      const clip = el('clipPath', { id: `${svg.id}-l${i}` }, svg);
      const cr = el('rect', { x: mx, y: top + i * (lh + 3), width: G.memW, height: lh }, clip);
      el('rect', { x: mx, y: top + i * (lh + 3), width: G.memW, height: lh, rx: 2.5, class: 'layer', 'fill-opacity': 0.35, 'clip-path': `url(#${svg.id}-l${i})` }, svg);
      layers.push(cr);
    }
    const memTxt = el('text', { x: mx, y: top + mh + 17, class: 'cap' }, svg, '');
    const batchTxt = el('text', { x: G.gridX, y: top + mh + 17, class: 'cap' }, svg, '');
    const ly = top + mh / 2;
    const rdLine = el('line', { x1: mx + G.memW + 6, y1: ly, x2: G.gridX - 6, y2: ly, class: 'rd' }, svg);
    const SB = G.y + G.h - 46, stY = SB + 21;
    el('rect', { x: 20, y: SB, width: 150, height: 42, rx: 8, class: 'store' }, svg);
    el('text', { x: 32, y: SB + 18, class: 'cap' }, svg, 'STORAGE');
    el('text', { x: 32, y: SB + 33, class: 't-2', 'font-size': 12.5 }, svg, 'model weights');
    const stLine = el('line', { x1: 176, y1: stY, x2: mx - 6, y2: stY, class: 'rd' }, svg);
    const stTile = el('rect', { x: 176, y: stY - 5, width: 22, height: 10, rx: 2, class: 'layer', opacity: 0 }, svg);
    const pk = OFFS.map(() => el('circle', { r: 4.5, class: 'pkt', opacity: 0 }, svg));
    const an = OFFS.map(() => el('circle', { r: 4.5, class: 'ans', opacity: 0 }, svg));

    /* Both timelines, to scale */
    const AX = 200, AW = 540, xAt = m => AX + Math.min(m, T) / T * AW, R0 = 244;
    const rows = V.map((v, i) => {
      const y0 = R0 + 22 + i * 104, gy = y0 + 30, by = gy + 22;
      const bg = el('rect', { x: 10, y: gy - 22, width: AX - 18, height: 66, rx: 7, fill: 'var(--soft)', stroke: 'var(--hair)', 'stroke-width': 1, opacity: 0 }, svg);
      el('circle', { cx: 24, cy: gy - 1, r: 5.5, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.2 }, svg);
      const radio = el('circle', { cx: 24, cy: gy - 1, r: 3, class: 'fillc', opacity: 0 }, svg);
      const name = el('text', { x: 36, y: gy + 4, 'font-size': 14 }, svg, v.name);
      el('text', { x: 36, y: gy + 20, class: 't-mut', 'font-size': 11 }, svg, v.sub);
      const tot = el('text', { x: 36, y: gy + 36, class: 'mono t-2', 'font-size': 10.5 }, svg, '');
      el('rect', { x: AX, y: gy - 10, width: AW, height: 24, rx: 3, class: 'track' }, svg);
      el('rect', { x: AX, y: by, width: AW, height: 8, rx: 3, class: 'track' }, svg);
      const clip = el('clipPath', { id: `${svg.id}-r${i}` }, svg), rv = el('rect', { x: AX, y: y0 - 10, width: 0, height: 100 }, clip);
      const g = el('g', { 'clip-path': `url(#${svg.id}-r${i})` }, svg);
      v.ups.forEach(u => {
        el('rect', { x: xAt(u.start), y: gy - 10, width: Math.max(2, xAt(u.ready) - xAt(u.start)), height: 24, fill: `url(#${svg.id}-hatch)`, stroke: 'var(--muted)', 'stroke-width': 0.6 }, g);
        el('rect', { x: xAt(u.ready), y: gy - 10, width: xAt(u.serveEnd) - xAt(u.ready), height: 24, class: 'fillc', 'fill-opacity': 0.85 }, g);
        el('rect', { x: xAt(u.serveEnd), y: gy - 10, width: Math.max(1, xAt(u.down) - xAt(u.serveEnd)), height: 24, class: 'layer', 'fill-opacity': 0.14 }, g);
        el('rect', { x: xAt(u.start), y: by, width: xAt(u.down) - xAt(u.start), height: 8, rx: 3, class: 'bill' }, g);
      });
      v.waits.forEach(w => {
        const x0 = xAt(w.at), x1 = xAt(w.ans), ty = gy - 18;
        el('circle', { cx: x0, cy: ty, r: 4, class: 'pkt' }, g);
        el('line', { x1: x0, y1: ty, x2: x1, y2: ty, stroke: 'var(--gpt)', 'stroke-width': 2 }, g);
        el('line', { x1, y1: ty - 4, x2: x1, y2: ty + 4, stroke: 'var(--gpt)', 'stroke-width': 2 }, g);
      });
      const hit = el('rect', { x: 10, y: gy - 22, width: AX - 18, height: 66, rx: 7, fill: 'transparent', style: 'cursor:pointer', tabindex: 0, role: 'button', 'aria-label': `Show ${v.name} in the GPU view` }, svg);
      hit.addEventListener('click', () => select(i)); hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { select(i); e.preventDefault(); } });
      return { v, rv, name, tot, bg, radio, hit };
    });
    const AY = R0 + 22 + 2 * 104 + 6, HT = R0 + 12;
    for (let m = 0; m <= T; m += 5) {
      const gl = el('line', { x1: xAt(m), y1: HT, x2: xAt(m), y2: AY - 12, stroke: 'var(--grid)', 'stroke-width': 1 }, svg);
      svg.insertBefore(gl, rows[0].bg);
      el('text', { x: xAt(m), y: AY, class: 'mono t-mut', 'font-size': 10, 'text-anchor': m ? 'middle' : 'start' }, svg, m ? `${m} min` : '0');
    }
    const head = el('line', { x1: AX, x2: AX, y1: HT, y2: AY - 12, class: 'head' }, svg);
    const knob = el('circle', { cx: AX, cy: HT, r: 4.5, class: 'knob' }, svg);
    let lx = 20; const LY = AY + 26;
    const sw = (draw, text) => { draw(lx); el('text', { x: lx + 15, y: LY + 4, class: 'mono t-mut', 'font-size': 10.5 }, svg, text); lx += 15 + text.length * 6.4 + 18; };
    sw(x => el('circle', { cx: x + 5, cy: LY, r: 4, class: 'pkt' }, svg), 'burst arrives');
    sw(x => el('rect', { x, y: LY - 5, width: 10, height: 10, rx: 2, fill: `url(#${svg.id}-hatch)`, stroke: 'var(--hair)' }, svg), 'cold start');
    sw(x => el('rect', { x, y: LY - 5, width: 10, height: 10, rx: 2, class: 'fillc', 'fill-opacity': 0.85 }, svg), 'serving');
    sw(x => el('rect', { x, y: LY - 5, width: 10, height: 10, rx: 2, class: 'layer', 'fill-opacity': 0.14, stroke: 'var(--hair)' }, svg), 'idle, kept warm');
    sw(x => el('rect', { x, y: LY - 5, width: 10, height: 10, rx: 2, class: 'bill' }, svg), 'billed');

    function draw(t) {
      const v = V[sel], u = v.ups.find(u => t >= u.start && t < u.down);
      // GPU view
      let name = 'off', label = 'No GPU · nothing billed', loaded = 0, coldP = 0;
      if (u && t < u.ready) {
        coldP = (t - u.start) / v.cold; let a = 0;
        for (const [id, fr, lab] of v.phases) { if (coldP < a + fr || id === 'warmup') { name = id; label = lab; loaded = id === 'weights' ? (coldP - a) / fr : id === 'warmup' ? 1 : 0; break; } a += fr; }
      } else if (u) {
        const busy = v.reqs.some(r => r.up === u && t >= r.join && t < r.done);
        name = busy ? 'serve' : 'warm'; label = busy ? 'Serving' : `Idle · releasing in ${fmt(u.down - t)}`; loaded = 1;
      }
      const cold = name === 'gpu' || name === 'engine' || name === 'weights' || name === 'warmup';
      const boxA = name === 'off' ? 0 : name === 'gpu' ? clamp(coldP / v.phases[0][1]) : 1;
      boxOn.setAttribute('stroke-opacity', boxA); boxOff.setAttribute('stroke-opacity', 1 - boxA);
      gridG.setAttribute('opacity', name === 'off' || name === 'gpu' ? 0.25 : name === 'engine' || name === 'weights' ? 0.5 : 1);
      layers.forEach((cr, i) => cr.setAttribute('width', (G.memW * clamp(loaded * LAYERS - i)).toFixed(1)));
      memTxt.textContent = 'WEIGHTS';
      stLine.setAttribute('stroke-opacity', name === 'weights' ? 0.9 : 0.25);
      stTile.setAttribute('opacity', name === 'weights' ? 1 : 0);
      if (name === 'weights') { stLine.setAttribute('stroke-dashoffset', (-t * 300).toFixed(1)); stTile.setAttribute('x', (176 + (mx - 30 - 176) * ease(mod(loaded * LAYERS, 1))).toFixed(1)); }
      rdLine.setAttribute('stroke-opacity', name === 'serve' ? 0.9 : 0.25);
      if (name === 'serve') rdLine.setAttribute('stroke-dashoffset', (-t * 300).toFixed(1));
      statusTxt.textContent = label; statusTxt.setAttribute('class', name === 'off' ? 'mono t-mut' : 'mono t-ink');
      dot.setAttribute('fill', name === 'serve' ? 'var(--ours)' : cold ? 'var(--gpt)' : 'var(--muted)');
      gpuCap.textContent = 'ONE GPU, STARTED ON DEMAND';
      // requests, queue, batch, answers (the burst nearest in time)
      slots.forEach(s => { s.n = -1; });
      let queued = 0, waitFrom = null;
      const burst = v.reqs.filter(r => t >= r.arr - 0.01 && t < r.done + OUTT + 0.01);
      OFFS.forEach((_, k) => { pk[k].setAttribute('opacity', 0); an[k].setAttribute('opacity', 0); });
      burst.forEach(r => {
        const k = r.k, qx = QX - k * QS;
        if (t < r.arr + TR) { const p = ease(clamp((t - r.arr) / TR)), ex = r.queued ? qx : G.x; pk[k].setAttribute('cx', SX + (ex - SX) * p); pk[k].setAttribute('cy', G.mid); pk[k].setAttribute('opacity', 1); }
        else if (t < r.join) { pk[k].setAttribute('cx', qx); pk[k].setAttribute('cy', G.mid); pk[k].setAttribute('opacity', 1); queued++; waitFrom = waitFrom == null ? r.arr : Math.min(waitFrom, r.arr); }
        if (t >= r.join && t < r.done) slots[k].n = Math.max(1, Math.ceil((t - r.join) / (r.done - r.join) * 25));
        if (t >= r.done && t < r.done + OUTT) { const p = ease((t - r.done) / OUTT); an[k].setAttribute('cx', G.x + G.w + (OUT_END - G.x - G.w) * p); an[k].setAttribute('cy', G.mid); an[k].setAttribute('opacity', (0.55 * Math.min(1, (1 - (t - r.done) / OUTT) * 4)).toFixed(2)); }
      });
      queueTxt.textContent = queued ? `waiting ${fmt(t - waitFrom)}` : '';
      let busy = 0;
      slots.forEach(s => { const on = s.n >= 0; if (on) busy++; s.base.setAttribute('fill-opacity', on ? 0.12 : 0); s.toks.forEach((q, i) => q.setAttribute('opacity', on && i < s.n ? (i === s.n - 1 ? 1 : 0.6) : 0)); });
      batchTxt.textContent = `BATCH · ${busy} / 32`;
      // timelines
      const x = xAt(t);
      rows.forEach((rw, i) => {
        rw.rv.setAttribute('width', Math.max(0, x - AX + 0.5));
        rw.bg.setAttribute('opacity', i === sel ? 1 : 0); rw.radio.setAttribute('opacity', i === sel ? 1 : 0); rw.hit.setAttribute('aria-pressed', i === sel);
        rw.name.setAttribute('class', i === sel ? 't-ink' : 't-mut'); rw.name.setAttribute('font-weight', i === sel ? 600 : 400);
        const billed = rw.v.ups.reduce((a, w) => a + Math.max(0, Math.min(t, w.down, T) - w.start), 0);
        rw.tot.textContent = `${billed.toFixed(1)} min billed`;
      });
      head.setAttribute('x1', x); head.setAttribute('x2', x); knob.setAttribute('cx', x);
    }
    const segBtns = V.map((v, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.textContent = v.name; b.addEventListener('click', () => select(i)); document.querySelector('[data-seg="compare"]').appendChild(b); return b; });
    const select = i => { sel = i; segBtns.forEach((b, j) => b.setAttribute('aria-selected', j === i)); f.draw(f.t); };
    segBtns.forEach((b, j) => b.setAttribute('aria-selected', j === sel));
    const f = { t: reduce ? 25.9 : 0, playing: !reduce, speed: 0.5, T, rate: 1.2, draw };
    const lbl = controls('compare', f);
    scrubber(svg, f, { x: AX - 6, y: HT - 6, width: AW + 12, height: AY - HT - 6 }, T, x => (x - AX) / AW * T, (t, dir, big) => t + dir * (big ? 5 : 0.5), draw, lbl);
    return f;
  }

  const figs = [
    passFigure(document.getElementById('fig-pass')),
    passBatchFigure(document.getElementById('fig-passb')),
    batchFigure(document.getElementById('fig-frontier'), { id: 'frontier', T: 12, make: () => frontierJobs(12), gpu: 'ONE SHARED GPU', sources: ['Customer A', 'Customer B', 'Customer C', 'Customer D', 'Customer E', 'Customer F'], still: 7.4 }),
    batchFigure(document.getElementById('fig-custom'), { id: 'custom', T: 20, make: () => burstJobs(false), gpu: 'ONE DEDICATED GPU', sources: ['Customer'], still: 10.6 }),
    batchFigure(document.getElementById('fig-cold'), { id: 'cold', T: 30, make: () => burstJobs(true), gpu: 'ONE GPU, STARTED ON DEMAND', sources: ['Customer'], still: 4.4 }),
    dissectFigure(document.getElementById('fig-dissect')),
    compareFigure(document.getElementById('fig-compare')),
  ];
  figs.forEach(f => f.draw(f.t));
  // Only animate figures that are on screen.
  const vis = new Map(figs.map(f => [f, true]));
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(es => es.forEach(e => { const f = figs.find(g => g.svg === e.target); if (f) vis.set(f, e.isIntersecting); }));
    ['pass', 'passb', 'frontier', 'custom', 'cold', 'dissect', 'compare'].forEach((id, i) => { figs[i].svg = document.getElementById(`fig-${id}`); io.observe(figs[i].svg); });
  }
  let last = null;
  const tick = now => {
    const dt = last == null ? 0 : Math.min(0.05, (now - last) / 1000); last = now;
    for (const f of figs) if (f.playing && vis.get(f)) { f.t = mod(f.t + dt * f.speed * f.rate, f.T); f.draw(f.t); }
    raf = requestAnimationFrame(tick);
  };
  let raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    if (io) io.disconnect();
    closeOpen(); backdrop.remove();
    window.removeEventListener('keydown', onKey); window.removeEventListener('resize', fit);
    document.querySelectorAll('.csf svg[id^="fig-"], .csf [data-fig], .csf [data-seg]').forEach((n) => { n.innerHTML = ''; });
  };
}
