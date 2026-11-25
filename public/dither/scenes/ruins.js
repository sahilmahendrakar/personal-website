// An original scene: a few broken columns in a meadow at golden hour, ivy climbing them.
// Nothing is traced from a painting; it is drawn with simple shapes and then dithered.
(window.SCENES = window.SCENES || {}).ruins = {
  ink: '#1d2136', paper: '#f5eedd', leaf: '#2f9e44', sat: 1.65, sway: 0.6, wind: (x, y) => 1.1 - y * 0.5, ivyStart: 0.32, ivySeconds: 160,
  paint(P) {
    const { W, H, R, back, front, colour } = P, por = P.portrait;
    const hz = H * (por ? 0.6 : 0.6), u = Math.min(W * (por ? 0.95 : 0.5), H * 0.95) * 0.01;
    const cx = W * (por ? 0.52 : 0.6), base = H * (por ? 0.72 : 0.71);
    const grey = (v) => { const c = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${c},${c},${c})`; };
    const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; };
    const rad = (c, x, y, r, stops) => { const g = c.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([o, s]) => g.addColorStop(o, s)); return g; };
    // draw one shape into a tone layer and the colour layer
    const shape = (layer, path, tone, col, blur) => {
      for (const [c, st] of [[layer, tone], [colour, col]]) {
        if (st == null) continue;
        c.save(); if (blur) c.filter = `blur(${blur}px)`; c.beginPath(); path(c); c.fillStyle = typeof st === 'function' ? st(c) : st; c.fill(); c.restore();
      }
    };
    const rect = (x, y, w, h) => (c) => c.rect(x, y, w, h);
    const ridge = (y0, amp, k, ph) => (c) => { c.moveTo(-2, H); for (let x = -2; x <= W + 2; x += 2) { const t = x / W; c.lineTo(x, y0 - amp * (0.55 * Math.sin(t * k + ph) + 0.3 * Math.sin(t * k * 2.3 + ph * 1.7) + 0.15 * Math.sin(t * k * 5.1 + ph * 0.3))); } c.lineTo(W + 2, H); c.closePath(); };
    const sunX = W * (por ? 0.7 : 0.74), sunY = hz - H * 0.05;

    // sky: deep blue above, warm gold toward a low sun
    shape(back, rect(0, 0, W, hz + 4), (c) => lin(c, 0, 0, 0, hz, [[0, grey(0.54)], [0.5, grey(0.64)], [1, grey(0.86)]]), (c) => lin(c, 0, 0, 0, hz, [[0, '#2a64d6'], [0.5, '#5f9cf0'], [0.85, '#ffb04a'], [1, '#ff8f3c']]));
    shape(back, (c) => c.arc(sunX, sunY, H * 0.5, 0, 7), (c) => rad(c, sunX, sunY, H * 0.5, [[0, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]), (c) => rad(c, sunX, sunY, H * 0.55, [[0, 'rgba(255,214,90,.95)'], [0.5, 'rgba(255,150,70,.45)'], [1, 'rgba(255,150,70,0)']]));
    // long soft clouds catching the light
    for (let k = 0; k < 7; k++) {
      const x = W * (0.15 + R() * 0.85), y = H * (0.12 + R() * 0.32), w = W * (0.12 + R() * 0.2), h = H * (0.012 + R() * 0.02);
      shape(back, (c) => c.ellipse(x, y, w, h, 0, 0, 7), grey(0.9 + R() * 0.06), y > H * 0.3 ? '#ff9fb2' : '#ffd8c4', 2.5);
    }
    // distant hills, violet then blue
    shape(back, ridge(hz - H * 0.075, H * 0.06, 5.5, R() * 6), grey(0.66), '#9b6de0', 1);
    shape(back, ridge(hz - H * 0.025, H * 0.035, 9, R() * 6), grey(0.56), '#4f7fe0', 0.6);
    // meadow, lit gold where the sun reaches it
    shape(back, rect(0, hz - 2, W, H - hz + 2), (c) => lin(c, 0, hz, 0, H, [[0, grey(0.6)], [0.35, grey(0.48)], [1, grey(0.3)]]), (c) => lin(c, 0, hz, 0, H, [[0, '#b8d84a'], [0.4, '#5cc04a'], [1, '#1f9a4e']]));
    shape(back, (c) => c.ellipse(sunX - W * 0.05, hz + H * 0.08, W * 0.35, H * 0.08, 0, 0, 7), grey(0.68), '#ffd24a', 8);
    // patches of different greens and long shadows of unseen trees across the meadow
    for (let k = 0; k < 9; k++) { const x = W * R(), y = hz + (H - hz) * (0.15 + R() * 0.7), w = W * (0.08 + R() * 0.16), h = (H - hz) * (0.03 + R() * 0.06); shape(back, (c) => c.ellipse(x, y, w, h, 0, 0, 7), null, ['#d6e04a', '#18a86a', '#8fd03a'][k % 3], 6); }
    for (let k = 0; k < 4; k++) { const x = W * R(), y = hz + (H - hz) * (0.25 + R() * 0.55), w = W * (0.1 + R() * 0.12), h = (H - hz) * (0.025 + R() * 0.03); shape(back, (c) => c.ellipse(x, y, w, h, 0, 0, 7), 'rgba(0,0,0,.16)', '#1a6ac0', 4); }
    // a worn path to the ruins
    shape(back, (c) => { c.moveTo(W * 0.3, H + 2); c.bezierCurveTo(W * 0.42, H * 0.9, cx - 10 * u, base + 8 * u, cx - 4 * u, base + 1.5 * u); c.lineTo(cx + 2 * u, base + 1.5 * u); c.bezierCurveTo(cx - 2 * u, base + 10 * u, W * 0.56, H * 0.92, W * 0.5, H + 2); c.closePath(); }, grey(0.72), '#f2b860', 1);
    // poppies scattered in the grass
    for (let k = 0; k < 60; k++) {
      const x = W * R(), y = hz + (H - hz) * (0.2 + R() * 0.75), r = 1.2 + R() * 2.2 * ((y - hz) / (H - hz));
      shape(back, (c) => c.arc(x, y, r, 0, 7), grey(0.38), null);
      shape(back, (c) => c.arc(x, y, r * 2.5, 0, 7), null, 'rgba(255,40,30,.7)', 1);
    }
    // an older broken wall with an arch, half lost in trees, on the left
    const wx = W * (por ? 0.16 : 0.22), wy = hz + H * 0.07, ww = 16 * u, wh = 14 * u;
    shape(back, (c) => { c.moveTo(wx - ww / 2, wy); c.lineTo(wx - ww / 2, wy - wh * 0.8); c.lineTo(wx - ww * 0.2, wy - wh); c.lineTo(wx + ww * 0.05, wy - wh * 0.86); c.lineTo(wx + ww * 0.3, wy - wh * 0.9); c.lineTo(wx + ww / 2, wy - wh * 0.55); c.lineTo(wx + ww / 2, wy); c.closePath(); c.moveTo(wx + ww * 0.18, wy); c.lineTo(wx + ww * 0.18, wy - wh * 0.42); c.arc(wx, wy - wh * 0.42, ww * 0.18, 0, Math.PI, true); c.lineTo(wx - ww * 0.18, wy); c.closePath(); }, (c) => lin(c, wx - ww / 2, 0, wx + ww / 2, 0, [[0, grey(0.24)], [0.85, grey(0.42)], [1, grey(0.8)]]), '#c0507a');
    // the colonnade: a step, four columns of different heights, one lintel
    const step = [[-24, 0, 48, 1.6, 0.82], [-22, -1.6, 44, 1.5, 0.86]];
    for (const [x, y, w, h, v0] of step) { const v = v0 - 0.2; shape(back, rect(cx + x * u, base + y * u - h * u, w * u, h * u), (c) => lin(c, 0, base + (y - h) * u, 0, base + y * u, [[0, grey(v + 0.25)], [0.3, grey(v)], [1, grey(v - 0.3)]]), '#e07a6a'); }
    shape(back, (c) => { c.moveTo(cx - 24 * u, base); c.lineTo(cx + 24 * u, base); c.lineTo(cx + 10 * u, base + 3.2 * u); c.lineTo(cx - 40 * u, base + 3.2 * u); c.closePath(); }, 'rgba(0,0,0,.3)', '#2a56c8', 1.5);
    const top = base - 3.1 * u, cols = [[-17, 36, 1], [-6, 36, 1], [6, 23, 0], [17, 9, 0]], cw = 4.4 * u;
    const colPath = (x, h, whole) => (c) => {
      const L = cx + x * u - cw / 2, Rt = L + cw, T = top - h * u;
      c.moveTo(L, top); c.lineTo(L + cw * 0.06, T);
      if (whole) c.lineTo(Rt - cw * 0.06, T);
      else { for (let k = 1; k <= 5; k++) c.lineTo(L + cw * 0.06 + (cw * 0.88) * k / 5, T + (k % 2 ? 1 : -0.4) * u * (0.6 + R())); }
      c.lineTo(Rt, top); c.closePath();
    };
    for (const [x, h, whole] of cols) {
      const L = cx + x * u - cw / 2;
      shape(back, colPath(x, h, whole), (c) => lin(c, L, 0, L + cw, 0, [[0, grey(0.2)], [0.5, grey(0.34)], [0.8, grey(0.5)], [0.92, grey(0.86)], [1, grey(0.7)]]), (c) => lin(c, L, 0, L + cw, 0, [[0, '#9a3a8a'], [0.6, '#e0506a'], [1, '#ff9a4a']]));
      for (let f = 1; f < 4; f++) shape(back, rect(L + cw * f / 4 - 0.4, top - h * u + 2 * u, 0.8, h * u - 2.5 * u), grey(0.16 + f * 0.08), null);
      if (whole) { // capital
        shape(back, rect(L - 0.9 * u, top - h * u - 1.3 * u, cw + 1.8 * u, 1.3 * u), (c) => lin(c, L, 0, L + cw, 0, [[0, grey(0.28)], [0.8, grey(0.5)], [1, grey(0.9)]]), '#e0606a');
      }
    }
    // the lintel, broken off past the second column
    const lt = top - 36 * u - 1.3 * u;
    shape(back, (c) => { const a = cx - 20 * u, b = cx - 1.5 * u; c.moveTo(a, lt); c.lineTo(b, lt); c.lineTo(b + 0.8 * u, lt - 1.4 * u); c.lineTo(b - 0.6 * u, lt - 2.4 * u); c.lineTo(b + 0.4 * u, lt - 4 * u); c.lineTo(a, lt - 4 * u); c.closePath(); }, (c) => lin(c, 0, lt - 4 * u, 0, lt, [[0, grey(0.88)], [0.3, grey(0.45)], [1, grey(0.26)]]), '#d0506a');
    // a fallen drum in the grass
    const dx = cx + 27 * u, dy = base + 3.5 * u;
    shape(back, (c) => c.ellipse(dx - 2 * u, dy + 1.8 * u, 7 * u, 1.3 * u, 0, 0, 7), grey(0.32), '#3a62c8', 1.5);
    shape(back, (c) => { c.rect(dx - 5 * u, dy - 1.8 * u, 8 * u, 3.6 * u); }, (c) => lin(c, 0, dy - 1.8 * u, 0, dy + 1.8 * u, [[0, grey(0.86)], [0.3, grey(0.45)], [1, grey(0.22)]]), '#e0506a');
    shape(back, (c) => c.ellipse(dx + 3 * u, dy, 1.1 * u, 1.8 * u, 0, 0, 7), grey(0.7), '#ff9a4a');

    // ---- the front layer moves a little in the wind ----
    // two cypresses behind the old wall
    for (const [x, h, w] of [[wx - ww * 0.72, 22, 3.4], [wx - ww * 1.05, 16, 2.8], [wx + ww * 0.75, 12, 2.4]]) {
      shape(front, (c) => { const b = wy + 1 * u, t = b - h * u; c.moveTo(x - w * u * 0.5, b); c.bezierCurveTo(x - w * u * 0.9, b - h * u * 0.45, x - w * u * 0.2, t + h * u * 0.15, x, t); c.bezierCurveTo(x + w * u * 0.2, t + h * u * 0.15, x + w * u * 0.9, b - h * u * 0.45, x + w * u * 0.5, b); c.closePath(); }, (c) => lin(c, x - w * u, 0, x + w * u, 0, [[0, grey(0.12)], [0.7, grey(0.24)], [1, grey(0.36)]]), '#0f8a5a');
    }
    // an umbrella pine on the right, its flat crown framing the sky
    const tx = W * (por ? 0.94 : 0.9), cy = H * (por ? 0.4 : 0.16), cr = W * (por ? 0.3 : 0.17);
    shape(front, (c) => { c.moveTo(tx + 2 * u, H); c.bezierCurveTo(tx + 1 * u, H * 0.7, tx - 1 * u, H * 0.42, tx - 4 * u, cy + 4 * u); c.lineTo(tx - 1.5 * u, cy + 4 * u); c.bezierCurveTo(tx + 1.5 * u, H * 0.42, tx + 4 * u, H * 0.7, tx + 5.5 * u, H); c.closePath(); if (por) return; c.moveTo(tx - 1 * u, H * 0.34); c.quadraticCurveTo(tx - 6 * u, H * 0.26, tx - cr * 0.6, cy + 6 * u); c.lineTo(tx - cr * 0.6 + 1.2 * u, cy + 6 * u); c.quadraticCurveTo(tx - 5 * u, H * 0.27, tx, H * 0.31); c.closePath(); }, (c) => lin(c, tx - 4 * u, 0, tx + 5 * u, 0, [[0, grey(0.1)], [1, grey(0.3)]]), '#8a3a2a');
    for (let k = 0; k < 90; k++) {
      const a = R() * Math.PI * 2, rr = Math.sqrt(R()), x = tx - cr * 0.15 + Math.cos(a) * rr * cr, y = cy + Math.sin(a) * rr * cr * 0.28, r = (2.2 + R() * 3.8) * u;
      const lit = (x - (tx - cr)) / (2 * cr);
      shape(front, (c) => c.arc(x, y, r, 0, 7), (c) => rad(c, x + r * 0.3, y - r * 0.5, r * 1.1, [[0, grey(0.3 + lit * 0.25)], [1, grey(0.1)]]), k % 4 ? '#0f8a4a' : '#7ac83a');
    }
    // low shrubs and tall grass in front
    const bush = (x0, y0, size) => {
      for (let k = 0; k < 14; k++) {
        const a = -Math.PI * R(), rr = Math.sqrt(R()), x = x0 + Math.cos(a) * rr * size * 1.6, y = y0 + Math.sin(a) * rr * size * 0.9, r = size * (0.25 + R() * 0.3);
        shape(front, (c) => c.arc(x, y, r, 0, 7), (c) => rad(c, x + r * 0.35, y - r * 0.45, r * 1.15, [[0, grey(0.44)], [1, grey(0.1)]]), k % 3 ? '#0e9a52' : '#5cc83a');
      }
    };
    bush(W * 0.04, H * 1.0, 16 * u); bush(W * 0.16, H * 1.02, 11 * u); bush(W * (por ? 0.86 : 0.74), H * 1.01, 12 * u); bush(W * 0.98, H * 0.98, 15 * u);
    bush(wx + ww * 0.6, wy + 2 * u, 5 * u); bush(wx - ww * 0.3, wy + 1.5 * u, 4 * u);
    for (let k = 0; k < 160; k++) {
      const x = W * R(), y = H * (0.95 + R() * 0.06), h = (1.5 + R() * 4.5) * u, lean = (R() - 0.5) * 3 * u;
      shape(front, (c) => { c.moveTo(x - 0.5, y); c.quadraticCurveTo(x + lean * 0.3, y - h * 0.6, x + lean, y - h); c.quadraticCurveTo(x + lean * 0.3 + 0.8, y - h * 0.6, x + 1, y); c.closePath(); }, grey(0.15 + R() * 0.25), null);
    }

    // paint texture: soft unevenness, like brushwork, so no area is flat
    const n1 = P.noise(Math.max(8, W / 22)), n2 = P.noise(Math.max(4, W / 70), 2);
    const ivy = [];
    for (const [x, h] of cols) {
      const X = cx + x * u, n = h > 20 ? 3 : 2;
      for (let k = 0; k < n; k++) ivy.push({ x: X + (R() - 0.5) * cw, y: base - 1.5 * u, len: (h * u * (0.7 + R() * 0.5)) / 1.3, hug: [X, cw * 0.45, R() * 6], top: top - h * u, t0: R() * 0.3 });
    }
    for (let k = 0; k < 7; k++) ivy.push({ x: wx + (R() - 0.5) * ww, y: wy, len: wh * (0.6 + R() * 0.7) / 1.3, t0: R() * 0.3 });
    for (let k = 0; k < 3; k++) ivy.push({ x: cx + (R() - 0.5) * 44 * u, y: base, a: -Math.PI / 2 + (R() - 0.5), len: 6 * u, t0: 0.3 + R() * 0.4 });
    return {
      texture(b, f) { for (let i = 0; i < b.length; i++) { b[i] += n1[i] * 0.09 + n2[i] * 0.05; f[i] += n2[i] * 0.06; } },
      ivy,
      birds: [{ hx: 0.6, hy: 0.24, rx: 0.07, ry: 0.05, spin: 0.35 }, { hx: 0.68, hy: 0.3, rx: 0.05, ry: 0.04, spin: -0.28 }, { hx: 0.5, hy: 0.33, rx: 0.06, ry: 0.03, spin: 0.22 }],
    };
  },
};
