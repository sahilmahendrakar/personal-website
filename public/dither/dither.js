// Shared dithering engine for the classical dither studies.
// Everything runs on a small offscreen grid, then is drawn 1 cell = N css px
// with image-rendering: pixelated, so the dots stay crisp at any DPR.
(function () {
  'use strict';
  const BN_B64 = '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';
  const BN = (() => { const s = atob(BN_B64), a = new Float32Array(4096); for (let i = 0; i < 4096; i++) a[i] = (s.charCodeAt(i) + 0.5) / 256; return a; })();

  function bayer(n) {
    let m = [[0]];
    while (m.length < n) {
      const s = m.length, o = [];
      for (let y = 0; y < s * 2; y++) { o[y] = []; for (let x = 0; x < s * 2; x++) { const q = (y < s ? 0 : 2) + (x < s ? 0 : 1); o[y][x] = 4 * m[y % s][x % s] + [0, 2, 3, 1][q]; } }
      m = o;
    }
    const a = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) a[y * n + x] = (m[y][x] + 0.5) / (n * n);
    return a;
  }
  const MATS = { bayer2: [bayer(2), 2], bayer4: [bayer(4), 4], bayer8: [bayer(8), 8], blue: [BN, 64] };
  // engraving line screen: threshold varies across rows, so tone becomes line weight
  const lineScreen = (n) => { const a = new Float32Array(n * n); for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const t = Math.abs(((y + 0.5) / n) - 0.5) * 2; a[y * n + x] = Math.min(0.999, 0.04 + t * 0.86 + BN[(y * 64 + x * 7) % 4096] * 0.1); } return a; };
  MATS.lines = [lineScreen(4), 4];
  MATS.lines8 = [lineScreen(8), 8];

  const cache = new Map();
  function loadImage(src) {
    if (!cache.has(src)) cache.set(src, new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; }));
    return cache.get(src);
  }

  // Draw an image into a w×h grid. fit: cover|contain. focus: [fx, fy] 0..1 for cover crop.
  function sample(img, w, h, opt = {}) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const fit = opt.fit || 'cover', [fx, fy] = opt.focus || [0.5, 0.5];
    const s = fit === 'cover' ? Math.max(w / iw, h / ih) * (opt.zoom || 1) : Math.min(w / iw, h / ih) * (opt.zoom || 1);
    const dw = iw * s, dh = ih * s;
    if (opt.bg) { x.fillStyle = opt.bg; x.fillRect(0, 0, w, h); }
    x.imageSmoothingQuality = 'high';
    x.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
    return x.getImageData(0, 0, w, h);
  }

  function luminance(id) {
    const d = id.data, n = id.width * id.height, L = new Float32Array(n);
    for (let i = 0; i < n; i++) { const r = d[i * 4] / 255, g = d[i * 4 + 1] / 255, b = d[i * 4 + 2] / 255; L[i] = 0.2126 * r * r + 0.7152 * g * g + 0.0722 * b * b; L[i] = Math.sqrt(L[i]); }
    return L;
  }

  // Auto-levels by percentile, then gamma and contrast.
  function levels(L, o = {}) {
    const lo = o.lo ?? 0.01, hi = o.hi ?? 0.99, gamma = o.gamma ?? 1, contrast = o.contrast ?? 1, lift = o.lift ?? 0;
    const hist = new Uint32Array(256); for (let i = 0; i < L.length; i++) hist[Math.min(255, L[i] * 255 | 0)]++;
    let acc = 0, a = 0, b = 255; for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= L.length * lo) { a = i; break; } }
    acc = 0; for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc >= L.length * (1 - hi)) { b = i; break; } }
    const A = a / 255, B = Math.max(A + 0.02, b / 255), out = new Float32Array(L.length);
    for (let i = 0; i < L.length; i++) { let v = (L[i] - A) / (B - A); v = Math.min(1, Math.max(0, v)); v = Math.pow(v, gamma); v = (v - 0.5) * contrast + 0.5 + lift; out[i] = Math.min(1, Math.max(0, v)); }
    return out;
  }

  // Unsharp mask on luminance, helps sculpture edges survive the dither.
  function sharpen(L, w, h, amt = 0.6) {
    const o = new Float32Array(L.length);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; let s = 0, n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w) { s += L[yy * w + xx]; n++; } }
      o[i] = Math.min(1, Math.max(0, L[i] + (L[i] - s / n) * amt));
    }
    return o;
  }

  // Ordered threshold -> bits (1 = light). bias shifts the threshold, field optional per-pixel add.
  function ordered(L, w, h, o = {}) {
    const [M, n] = MATS[o.matrix || 'bayer8'], bias = o.bias || 0, F = o.field, ox = o.ox | 0, oy = o.oy | 0, bits = new Uint8Array(L.length);
    for (let y = 0; y < h; y++) { const my = ((y + oy) % n + n) % n * n; for (let x = 0; x < w; x++) { const i = y * w + x; bits[i] = (L[i] + bias + (F ? F[i] : 0)) > M[my + (((x + ox) % n) + n) % n] ? 1 : 0; } }
    return bits;
  }

  const KERNELS = {
    atkinson: [[1, 0, 1 / 8], [2, 0, 1 / 8], [-1, 1, 1 / 8], [0, 1, 1 / 8], [1, 1, 1 / 8], [0, 2, 1 / 8]],
    floyd: [[1, 0, 7 / 16], [-1, 1, 3 / 16], [0, 1, 5 / 16], [1, 1, 1 / 16]],
    stucki: [[1, 0, 8 / 42], [2, 0, 4 / 42], [-2, 1, 2 / 42], [-1, 1, 4 / 42], [0, 1, 8 / 42], [1, 1, 4 / 42], [2, 1, 2 / 42], [-2, 2, 1 / 42], [-1, 2, 2 / 42], [0, 2, 4 / 42], [1, 2, 2 / 42], [2, 2, 1 / 42]],
  };
  function diffuse(L, w, h, o = {}) {
    const K = KERNELS[o.kernel || 'atkinson'], e = Float32Array.from(L), bits = new Uint8Array(L.length), t = 0.5 + (o.bias ? -o.bias : 0);
    for (let y = 0; y < h; y++) {
      const rtl = o.serpentine && (y & 1);
      for (let k = 0; k < w; k++) {
        const x = rtl ? w - 1 - k : k, i = y * w + x, v = e[i], b = v > t ? 1 : 0, err = v - b; bits[i] = b;
        for (const [dx0, dy, f] of K) { const dx = rtl ? -dx0 : dx0, xx = x + dx, yy = y + dy; if (xx >= 0 && xx < w && yy < h) e[yy * w + xx] += err * f; }
      }
    }
    return bits;
  }

  function hex(c) { if (Array.isArray(c)) return c; const n = parseInt(c.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }

  // Paint bits with ink/paper colors (paper may be null for transparent).
  function paint(ctx, bits, w, h, ink, paper, alphaMask) {
    const id = ctx.createImageData(w, h), d = id.data, I = hex(ink), P = paper ? hex(paper) : null;
    for (let i = 0; i < bits.length; i++) {
      const c = bits[i] ? P : I, j = i * 4;
      if (!c || (alphaMask && !alphaMask[i])) { d[j + 3] = 0; continue; }
      d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    return id;
  }

  // Multi-tone: map L through ordered dither into N ramp colors (dark -> light).
  function ramp(L, w, h, colors, o = {}) {
    const C = colors.map(hex), k = C.length - 1, [M, n] = MATS[o.matrix || 'bayer8'], out = new Uint8ClampedArray(L.length * 4), bias = o.bias || 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, v = Math.min(0.9999, Math.max(0, L[i] + bias)) * k, base = v | 0, f = v - base, t = M[(y % n) * n + (x % n)];
      const c = C[Math.min(k, base + (f > t ? 1 : 0))], j = i * 4; out[j] = c[0]; out[j + 1] = c[1]; out[j + 2] = c[2]; out[j + 3] = 255;
    }
    return new ImageData(out, w, h);
  }

  // Color palette dither (ordered): add matrix offset per channel, pick nearest palette color.
  function palette(id, colors, o = {}) {
    const P = colors.map(hex), w = id.width, h = id.height, s = id.data, [M, n] = MATS[o.matrix || 'bayer8'], spread = o.spread ?? 48, sat = o.saturate ?? 1, out = new Uint8ClampedArray(s.length);
    const memo = new Map();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const j = (y * w + x) * 4, t = (M[(y % n) * n + (x % n)] - 0.5) * spread;
      let r = s[j], g = s[j + 1], b = s[j + 2];
      if (sat !== 1) { const l = 0.3 * r + 0.59 * g + 0.11 * b; r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat; }
      r += t; g += t; b += t;
      const key = ((r >> 3) & 63) << 12 | ((g >> 3) & 63) << 6 | ((b >> 3) & 63);
      let best = memo.get(key);
      if (best === undefined) { let bd = 1e9; for (let p = 0; p < P.length; p++) { const dr = r - P[p][0], dg = g - P[p][1], db = b - P[p][2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < bd) { bd = dd; best = p; } } memo.set(key, best); }
      const c = P[best]; out[j] = c[0]; out[j + 1] = c[1]; out[j + 2] = c[2]; out[j + 3] = 255;
    }
    return new ImageData(out, w, h);
  }

  // Simple k-means palette extraction (for paintings).
  function extract(id, k = 12, iters = 8) {
    const d = id.data, n = id.width * id.height, step = Math.max(1, (n / 6000) | 0), pts = [];
    for (let i = 0; i < n; i += step) pts.push([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]);
    pts.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
    let C = Array.from({ length: k }, (_, i) => pts[Math.floor((i + 0.5) / k * pts.length)].slice());
    for (let it = 0; it < iters; it++) {
      const S = C.map(() => [0, 0, 0, 0]);
      for (const p of pts) { let bi = 0, bd = 1e9; for (let c = 0; c < k; c++) { const dd = (p[0] - C[c][0]) ** 2 + (p[1] - C[c][1]) ** 2 + (p[2] - C[c][2]) ** 2; if (dd < bd) { bd = dd; bi = c; } } const s = S[bi]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++; }
      C = C.map((c, i) => S[i][3] ? [S[i][0] / S[i][3], S[i][1] / S[i][3], S[i][2] / S[i][3]] : c);
    }
    return C.map(c => c.map(Math.round));
  }

  // Make a pixelated canvas that fills its parent; returns {canvas, ctx, w, h, cell}.
  function grid(el, cell, aspect) {
    const c = el.tagName === 'CANVAS' ? el : el.appendChild(document.createElement('canvas'));
    const r = el.tagName === 'CANVAS' ? c.getBoundingClientRect() : el.getBoundingClientRect();
    const w = Math.max(8, Math.round(r.width / cell)), h = Math.max(8, Math.round((aspect ? r.width / aspect : r.height) / cell));
    c.width = w; c.height = h; c.style.imageRendering = 'pixelated';
    return { canvas: c, ctx: c.getContext('2d'), w, h, cell };
  }

  function reduced() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }

  window.Dither = { loadImage, sample, luminance, levels, sharpen, ordered, diffuse, paint, ramp, palette, extract, grid, hex, reduced, BN, MATS };
})();
