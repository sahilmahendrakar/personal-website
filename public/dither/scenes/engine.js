// Living hero engine. A scene is painted from scratch with canvas shapes into two
// layers (a still back and a gently moving front), then dithered every frame:
// Stucki error diffusion, serpentine, to three levels per dot. The darkest is the ink,
// the lightest the paper, and the middle ink takes the local colour of the scene
// ("drifting middle"). Only dots whose tone changed are re-dithered, so the weave
// stays still where nothing moves.
(function () {
  'use strict';
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const STUCKI = [[1, 0, 8 / 42], [2, 0, 4 / 42], [-2, 1, 2 / 42], [-1, 1, 4 / 42], [0, 1, 8 / 42], [1, 1, 4 / 42], [2, 1, 2 / 42], [-2, 2, 1 / 42], [-1, 2, 2 / 42], [0, 2, 4 / 42], [1, 2, 2 / 42], [2, 2, 1 / 42]];
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909), (s ^= s >>> 16) >>> 0) / 4294967296); }
  function blur(A, W, H, r) {
    const T = new Float32Array(A.length), O = new Float32Array(A.length);
    for (let y = 0; y < H; y++) { let s = 0, n = 0; for (let x = -r; x < W; x++) { if (x + r < W) { s += A[y * W + x + r]; n++; } if (x - r - 1 >= 0) { s -= A[y * W + x - r - 1]; n--; } if (x >= 0) T[y * W + x] = s / n; } }
    for (let x = 0; x < W; x++) { let s = 0, n = 0; for (let y = -r; y < H; y++) { if (y + r < H) { s += T[(y + r) * W + x]; n++; } if (y - r - 1 >= 0) { s -= T[(y - r - 1) * W + x]; n--; } if (y >= 0) O[y * W + x] = s / n; } }
    return O;
  }
  // smooth value noise, for painterly unevenness in flat areas
  function noiseField(W, H, R, scale, oct = 3) {
    const out = new Float32Array(W * H); let amp = 1, tot = 0;
    for (let o = 0; o < oct; o++) {
      const s = scale / (1 << o), gw = Math.ceil(W / s) + 2, gh = Math.ceil(H / s) + 2, g = new Float32Array(gw * gh);
      for (let i = 0; i < g.length; i++) g[i] = R() * 2 - 1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const fx = x / s, fy = y / s, xi = fx | 0, yi = fy | 0, tx = fx - xi, ty = fy - yi, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
        const a = g[yi * gw + xi], b = g[yi * gw + xi + 1], c = g[(yi + 1) * gw + xi], d = g[(yi + 1) * gw + xi + 1];
        out[y * W + x] += amp * ((a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy);
      }
      tot += amp; amp *= 0.5;
    }
    for (let i = 0; i < out.length; i++) out[i] /= tot;
    return out;
  }

  // Kuwahara: flattens texture into soft brush-like patches while keeping edges
  function kuwahara(A, W, H, r) {
    const O = new Float32Array(A.length);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let best = 1e9, bm = 0;
      for (let q = 0; q < 4; q++) {
        const sx = q & 1 ? 1 : -1, sy = q & 2 ? 1 : -1; let n = 0, m = 0, v = 0;
        for (let dy = 0; dy <= r; dy++) for (let dx = 0; dx <= r; dx++) { const xx = clamp(x + dx * sx, 0, W - 1), yy = clamp(y + dy * sy, 0, H - 1), l = A[yy * W + xx]; m += l; v += l * l; n++; }
        m /= n; const va = v / n - m * m; if (va < best) { best = va; bm = m; }
      }
      O[y * W + x] = bm;
    }
    return O;
  }
  // The painting's stroke field: the direction its forms run, from a smoothed structure tensor.
  // Where the painting is flat (open sky, still water) the field falls back to slow, wide swirls.
  function flowField(T, W, H, R) {
    const sm = blur(T, W, H, 1), gx = new Float32Array(W * H), gy = new Float32Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, a = sm[i - W - 1], b = sm[i - W], c = sm[i - W + 1], d = sm[i - 1], f = sm[i + 1], g = sm[i + W - 1], h = sm[i + W], k = sm[i + W + 1];
      gx[i] = (c + 2 * f + k) - (a + 2 * d + g); gy[i] = (g + 2 * h + k) - (a + 2 * b + c);
    }
    let xx = new Float32Array(W * H), yy = new Float32Array(W * H), xy = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) { xx[i] = gx[i] * gx[i]; yy[i] = gy[i] * gy[i]; xy[i] = gx[i] * gy[i]; }
    const r = Math.max(3, Math.round(Math.min(W, H) / 90));
    xx = blur(blur(xx, W, H, r), W, H, r); yy = blur(blur(yy, W, H, r), W, H, r); xy = blur(blur(xy, W, H, r), W, H, r);
    const swirl = noiseField(W, H, R, Math.max(24, W / 6), 2), c2 = new Float32Array(W * H), s2 = new Float32Array(W * H);
    let mxs = 0; for (let i = 0; i < W * H; i++) mxs = Math.max(mxs, xx[i] + yy[i]);
    for (let i = 0; i < W * H; i++) {
      const tr = xx[i] + yy[i], d = Math.sqrt((xx[i] - yy[i]) ** 2 + 4 * xy[i] * xy[i]), coh = tr > 1e-9 ? d / tr : 0;
      const w = clamp(coh * Math.sqrt(tr / (mxs * 0.02 + 1e-9)));
      // doubled-angle form, so opposite tangents agree; gradient angle + 90° is the stroke direction
      const ga = Math.atan2(2 * xy[i], xx[i] - yy[i]) + Math.PI, fa = 2 * (0.25 + swirl[i] * 1.4);
      c2[i] = Math.cos(ga) * w + Math.cos(fa) * (1 - w); s2[i] = Math.sin(ga) * w + Math.sin(fa) * (1 - w);
    }
    const fx = new Float32Array(W * H), fy = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) { const a = Math.atan2(s2[i], c2[i]) / 2; fx[i] = Math.cos(a); fy[i] = Math.sin(a); }
    return { fx, fy };
  }
  // line integral convolution: average a field along the stroke direction
  function lic(F, S, W, H, len) {
    const O = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let sum = S[y * W + x], n = 1;
      for (const dir of [1, -1]) {
        let px = x + 0.5, py = y + 0.5, lx = 0, ly = 0;
        for (let k = 0; k < len; k++) {
          const j = (py | 0) * W + (px | 0); let vx = F.fx[j], vy = F.fy[j];
          if (vx * lx + vy * ly < 0) { vx = -vx; vy = -vy; }
          if (k === 0 && dir < 0) { vx = -vx; vy = -vy; }
          lx = vx; ly = vy; px += vx; py += vy;
          if (px < 0 || py < 0 || px >= W || py >= H) break;
          const w = 1 - k / len; sum += S[(py | 0) * W + (px | 0)] * w; n += w;
        }
      }
      O[y * W + x] = sum / n;
    }
    return O;
  }
  const loadImage = (src) => new Promise((res, rej) => { const im = new Image(); im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });

  // ---------- ivy: seeded random-walk stems with alternating leaves ----------
  function growIvy(seeds, W, H, R) {
    const segs = [], leaves = [];
    const walk = (x, y, a, t0, len, depth, hug, top) => {
      let t = t0, side = 1, curl = (R() - 0.5) * 0.08;
      for (let i = 0; i < len; i++) {
        const nx = x + Math.cos(a) * 1.3, ny = y + Math.sin(a) * 1.3;
        segs.push([x, y, nx, ny, t, depth]); x = nx; y = ny; t += 1 / (len * 1.3 + 50);
        a += curl + (R() - 0.5) * 0.32; curl += (R() - 0.5) * 0.02; curl *= 0.95;
        a += Math.sin(-Math.PI / 2 - a) * 0.05 * (depth ? 0.4 : 1);
        if (hug) { const want = Math.atan2(-1, (hug[0] + Math.sin(y * 0.09 + hug[2]) * hug[1] - x) * 0.5); a += Math.sin(want - a) * 0.45; }
        if (top != null && y < top) { a += Math.sin((hug ? (R() < 0.5 ? 0 : Math.PI) : 0) - a) * 0.4; }
        if (x < -4 || x > W + 4 || y < -4 || y > H + 4) break;
        if (i % 3 === 1) { side = -side; const la = a + side * (1.1 + R() * 0.5), d = 1.4 + R() * 1.0; leaves.push([x + Math.cos(la) * d, y + Math.sin(la) * d, 1.0 + R() * 1.1 * (depth ? 0.8 : 1), t + 0.02, la]); }
        if (depth < 2 && R() < 0.03) walk(x, y, a + (R() < 0.5 ? -1 : 1) * (0.7 + R() * 0.7), t, (len * (0.3 + R() * 0.3)) | 0, depth + 1, null, null);
      }
    };
    seeds.forEach((s) => walk(s.x, s.y, s.a ?? -Math.PI / 2, s.t0 ?? 0, s.len, 0, s.hug || null, s.top ?? null));
    return { segs, leaves };
  }

  window.LivingScene = function (canvas, scene, opts = {}) {
    const ctx = canvas.getContext('2d');
    const cellOf = () => (opts.cell || 2);
    let water = null, hasFront = false, fadeN = null, clearF = null, flowM = null, fxA = null, fyA = null, flowPh = null, bob = null, gW = null, gS = null, gP = null, rM = null, nX = null, nY = null, dyn = null, dynC = null, dynA = null, dynV = null, db = null;
    const light = { x: 0, y: 0 }, lq = { x: 0, y: 0 }; let W, H, back, front, frontA, colour, G, L, Lused, out, errOut, e, dirty, rowDirty, mid, vine, ivy, inkC, paperC, R, state, ready = false;
    const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 };
    let scrollP = 0, t0 = performance.now(), lastVine = -1, lastTint = 0, frameNo = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function layerCanvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
    function build() {
      const cell = cellOf();
      W = Math.max(40, Math.ceil(canvas.clientWidth / cell)); H = Math.max(40, Math.ceil(canvas.clientHeight / cell));
      canvas.width = W; canvas.height = H;
      R = rng(opts.seed || ((Math.random() * 1e9) | 0));
      inkC = hex(scene.ink); paperC = hex(scene.paper);
      // paint: tone layers (grey = tone) and one colour layer
      const cb = layerCanvas(), cf = layerCanvas(), cc = layerCanvas();
      const P = { W, H, R, back: cb.getContext('2d'), front: cf.getContext('2d'), colour: cc.getContext('2d'), noise: (scale, oct) => noiseField(W, H, R, scale, oct), portrait: H > W * 1.05 };
      P.image = (o) => {
        const im = scene._img, iw = im.naturalWidth, ih = im.naturalHeight, f = o.focus || [0.5, 0.5], z = o.zoom || 1;
        let sc, dw, dh, ox, oy;
        if (o.fit === 'height') { sc = H / ih * z; dw = iw * sc; dh = ih * sc; ox = (o.at ?? 0.5) * W - dw / 2; oy = (H - dh) * f[1]; }
        else { sc = Math.max(W / iw, H / ih) * z; dw = iw * sc; dh = ih * sc; ox = clamp(W / 2 - f[0] * dw, W - dw, 0); oy = clamp(H / 2 - f[1] * dh, H - dh, 0); }
        let src = im;
        if (o.feather) { // fade the picture's edges into whatever the scene painted underneath
          const c = document.createElement('canvas'), w = Math.ceil(dw), h = Math.ceil(dh), [fl, fr, ft, fb] = o.feather; c.width = w; c.height = h;
          const x = c.getContext('2d'); x.drawImage(im, 0, 0, w, h); x.globalCompositeOperation = 'destination-in';
          const ramp = (g, a, b) => { g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(Math.max(0.001, a), '#000'); g.addColorStop(Math.min(0.999, 1 - b), '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); return g; };
          x.fillStyle = ramp(x.createLinearGradient(0, 0, w, 0), fl, fr); x.fillRect(0, 0, w, h);
          x.fillStyle = ramp(x.createLinearGradient(0, 0, 0, h), ft, fb); x.fillRect(0, 0, w, h); src = c;
        }
        for (const c of [P.back, P.colour]) { c.save(); if (o.mirror) { c.translate(W, 0); c.scale(-1, 1); } c.drawImage(src, ox, oy, dw, dh); c.restore(); }
        P.layer = (name, ch = 0) => { // another image aligned to the painting (a mask), one channel read back as 0..1
          const c = layerCanvas(), x = c.getContext('2d'); if (o.mirror) { x.translate(W, 0); x.scale(-1, 1); } x.drawImage(scene._imgs[name], ox, oy, dw, dh);
          const d = x.getImageData(0, 0, W, H).data, a = new Float32Array(W * H); for (let i = 0; i < W * H; i++) a[i] = d[i * 4 + ch] / 255; return a;
        };
        // image coordinates (0..1) to dither dots
        return (u, v) => [o.mirror ? W - (ox + u * dw) : ox + u * dw, oy + v * dh, sc];
      };
      state = scene.paint(P) || {};
      const gb = P.back.getImageData(0, 0, W, H).data, gf = P.front.getImageData(0, 0, W, H).data;
      back = new Float32Array(W * H); front = new Float32Array(W * H); frontA = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) {
        if (scene.src) { const r = gb[i * 4] / 255, g = gb[i * 4 + 1] / 255, b = gb[i * 4 + 2] / 255; back[i] = Math.sqrt(0.2126 * r * r + 0.7152 * g * g + 0.0722 * b * b); }
        else back[i] = gb[i * 4] / 255;
        front[i] = gf[i * 4] / 255; frontA[i] = gf[i * 4 + 3] / 255;
      }
      hasFront = frontA.some((a) => a > 0.001);
      if (scene.levels) { const { lo = 0, hi = 1, gamma = 1, contrast = 1 } = scene.levels; for (let i = 0; i < W * H; i++) { let v = clamp((back[i] - lo) / (hi - lo)); v = Math.pow(v, gamma); back[i] = clamp((v - 0.5) * contrast + 0.5); } }
      if (scene.brush) { back = kuwahara(back, W, H, 2); back = kuwahara(back, W, H, 1); }
      // unsharp mask: bring the painting's fine detail forward before dithering
      if (scene.sharpen) { const bl = blur(back, W, H, Math.max(1, Math.round(W / 700))); for (let i = 0; i < W * H; i++) back[i] = clamp(back[i] + (back[i] - bl[i]) * scene.sharpen, -0.1, 1.1); }
      // clarity: a wider, gentler unsharp pass that lifts the forms of stone and foliage
      if (scene.clarity) { const r = Math.max(2, Math.round(W / 160)), bl = blur(blur(back, W, H, r), W, H, r); for (let i = 0; i < W * H; i++) back[i] = clamp(back[i] + (back[i] - bl[i]) * scene.clarity, -0.1, 1.1); }
      const flow = scene.src && scene.flow ? flowField(back, W, H, R) : null;
      // brush: smear the tone a little along the strokes, like paint dragged by a brush
      if (flow) { const sm = lic(flow, back, W, H, scene.smear ?? 4); for (let i = 0; i < W * H; i++) back[i] = back[i] * 0.35 + sm[i] * 0.65; }
      if (state.texture) state.texture(back, front);
      // the colour layer is blurred heavily: the middle ink drifts, it never outlines shapes
      const cd = P.colour.getImageData(0, 0, W, H).data, br = Math.max(3, Math.round(Math.min(W, H) / (scene.colourBlur || 30)));
      colour = new Float32Array(W * H * 3);
      for (let q = 0; q < 3; q++) { let A = new Float32Array(W * H); for (let i = 0; i < W * H; i++) A[i] = cd[i * 4 + q]; A = blur(blur(A, W, H, br), W, H, br); for (let i = 0; i < W * H; i++) colour[i * 3 + q] = A[i]; }
      // a soft swirly grain so flat areas break into eddies instead of a regular weave
      G = new Float32Array(W * H); for (let i = 0; i < G.length; i++) G[i] = R() * 2 - 1;
      // with a stroke field the grain is combed along it, so the weave runs with the painting's forms
      if (flow) { G = lic(flow, G, W, H, scene.comb ?? 9); const m0 = G.reduce((a, v) => a + v, 0) / G.length; let sd = 0; for (const v of G) sd += (v - m0) ** 2; sd = Math.sqrt(sd / G.length) || 1; for (let i = 0; i < G.length; i++) G[i] = clamp((G[i] - m0) / (sd * 2.5), -1, 1); }
      else G = blur(blur(G, W, H, 3), W, H, 2);
      let mx = 0; for (const v of G) mx = Math.max(mx, Math.abs(v)); for (let i = 0; i < G.length; i++) G[i] /= mx || 1;
      L = new Float32Array(W * H); Lused = new Float32Array(W * H).fill(-9); out = new Uint8Array(W * H); errOut = new Float32Array(W * H); e = new Float32Array(W * H);
      dirty = new Uint8Array(W * H); rowDirty = new Uint8Array(H + 3); mid = new Uint8ClampedArray(W * H * 3);
      vine = { dens: new Float32Array(W * H), stem: new Uint8Array(W * H) };
      ivy = state.ivy ? growIvy(state.ivy, W, H, R) : null;
      water = null;
      if (state.water) {
        water = typeof state.water === 'function' ? Float32Array.from({ length: W * H }, (_, i) => state.water(i % W, (i / W) | 0)) : state.water;
        wTop = H; wBot = 0; for (let i = 0; i < W * H; i++) if (water[i] > 0.5) { const y = (i / W) | 0; if (y < wTop) wTop = y; if (y > wBot) wBot = y; }
      }
      // everything else that moves on its own: a sky whose strokes slide, boats that bob, glows that breathe,
      // a statue relit by a moving light, and a small drawn layer (a swing). Only these dots are recomposed.
      flowM = state.flow || null; bob = state.bob || null; rM = state.relight || null; dyn = state.dyn || null; gW = null;
      if (flowM) { const F = flowField(back, W, H, R); fxA = F.fx; fyA = F.fy; flowPh = noiseField(W, H, R, Math.max(16, W / 20), 2); }
      if (rM) {
        const sb = blur(blur(back, W, H, 2), W, H, 2); nX = new Float32Array(W * H); nY = new Float32Array(W * H);
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; nX[i] = (sb[i + 1] - sb[i - 1]) * 6; nY[i] = (sb[i + W] - sb[i - W]) * 6; }
      }
      if (state.glows) {
        gW = new Float32Array(W * H); gS = new Float32Array(W * H); gP = new Float32Array(W * H);
        for (const g of state.glows) {
          const r = g.r, ph = R() * 6.28;
          for (let y = Math.max(0, (g.y - r) | 0); y < Math.min(H, g.y + r + 1); y++) for (let x = Math.max(0, (g.x - r) | 0); x < Math.min(W, g.x + r + 1); x++) {
            const d = Math.hypot(x - g.x, y - g.y) / r; if (d >= 1) continue; const i = y * W + x, w = g.amp * (1 - d) * (1 - d);
            if (Math.abs(w) > Math.abs(gW[i])) { gW[i] = w; gS[i] = g.speed || 1; gP[i] = ph; }
          }
        }
      }
      if (dyn) {
        const [a, b, c, d] = dyn.box; db = [Math.max(0, a | 0), Math.max(0, b | 0), Math.min(W, Math.ceil(c)), Math.min(H, Math.ceil(d))];
        dynC = document.createElement('canvas'); dynC.width = Math.max(1, db[2] - db[0]); dynC.height = Math.max(1, db[3] - db[1]);
        dynA = new Float32Array(dynC.width * dynC.height); dynV = new Float32Array(dynC.width * dynC.height);
      }
      {
        const on = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) if ((water && water[i] > 0.5) || (flowM && flowM[i] > 0.5) || (bob && bob[i] > 0.5) || (gW && gW[i] !== 0) || (rM && rM[i] > 0)) on[i] = 1;
        if (dyn) for (let y = db[1]; y < db[3]; y++) for (let x = db[0]; x < db[2]; x++) on[y * W + x] = 1;
        const wi = []; for (let i = 0; i < W * H; i++) if (on[i]) wi.push(i);
        waterIdx = wi.length ? Int32Array.from(wi) : null;
      }
      // a soft wash of paper behind the name, with a ragged edge, so the title reads cleanly
      clearF = null;
      const rects = opts.clear ? opts.clear() : null;
      if (rects && rects.length) {
        clearF = new Float32Array(W * H); const fe = Math.max(8, H * 0.11), cn = noiseField(W, H, R, Math.max(10, W / 30), 2);
        for (const [a, b, c, d] of rects) {
          const x0 = a * W, y0 = b * H, x1 = c * W, y1 = d * H;
          for (let y = Math.max(0, (y0 - fe * 1.6) | 0); y < Math.min(H, y1 + fe * 1.6); y++) for (let x = Math.max(0, (x0 - fe * 1.6) | 0); x < Math.min(W, x1 + fe * 1.6); x++) {
            const dx = Math.max(x0 - x, 0, x - x1), dy = Math.max(y0 - y, 0, y - y1), dd = Math.hypot(dx, dy * 1.4) / fe, i = y * W + x;
            const v = clamp(1 - dd + cn[i] * 0.35); clearF[i] = Math.max(clearF[i], v * v * (3 - 2 * v));
          }
        }
        // some subjects (a lit statue) keep their light even near the name
        if (state.keepClear) for (let i = 0; i < W * H; i++) clearF[i] *= 1 - state.keepClear[i];
      }
      needFull = true;
      if (state.birds) state.birds.forEach((b) => { const a = R() * 6.28; Object.assign(b, { x: (b.hx + Math.cos(a) * b.rx) * W, y: (b.hy + Math.sin(a * 1.3) * b.ry) * H, vx: 0, vy: 0, ph: R() * 6.28, a }); });
      fadeN = noiseField(W, H, R, Math.max(12, W / 14), 3);
      lastVine = -1; tintMid(); ready = true;
    }
    // middle ink: the local colour, re-lit to sit halfway between ink and paper
    let repaintAll = true;
    function tintMid() {
      repaintAll = true;
      const li = lum(inkC), lp = lum(paperC), target = li + (lp - li) * (scene.midLight ?? 0.5), sat = scene.sat || 1.5;
      // a gentle colour grade: cool shadows, warm light, and a sky that cools toward the top
      const gr = scene.grade, gs = gr && hex(gr.shadow), gl = gr && hex(gr.light), gk = gr && gr.sky && hex(gr.sky);
      let vd = null; if (ivy) vd = blur(vine.dens, W, H, 3);
      const leaf = scene.leaf ? hex(scene.leaf) : null;
      for (let i = 0; i < W * H; i++) {
        let r = colour[i * 3], g = colour[i * 3 + 1], b = colour[i * 3 + 2];
        if (gr) {
          const T = clamp(back[i]), y = ((i / W) | 0) / H, ks = gr.mix * (1 - T) * (1 - T), kl = gr.mix * T, kk = gk ? (gr.skyMix || 0.5) * clamp(1 - y / (gr.skyTo || 0.5)) ** 1.5 : 0;
          r += (gs[0] - r) * ks + (gl[0] - r) * kl; g += (gs[1] - g) * ks + (gl[1] - g) * kl; b += (gs[2] - b) * ks + (gl[2] - b) * kl;
          if (kk) { r += (gk[0] - r) * kk; g += (gk[1] - g) * kk; b += (gk[2] - b) * kk; }
        }
        let s = sat;
        // under the name the middle ink fades toward the wash, so washed-out shapes don't leave coloured ghosts
        if (clearF && clearF[i] > 0) { const c = (scene.clearTo ?? 0.93) > 0.5 ? paperC : inkC, k = clearF[i] * 0.7; r += (c[0] - r) * k; g += (c[1] - g) * k; b += (c[2] - b) * k; }
        if (vd && leaf) { const k = clamp(vd[i] * (scene.leafMix ?? 2.2)); r += (leaf[0] - r) * k; g += (leaf[1] - g) * k; b += (leaf[2] - b) * k; s *= 1 - (scene.leafDesat ?? 0) * k; }
        const l = 0.3 * r + 0.59 * g + 0.11 * b;
        mid[i * 3] = target + (r - l) * s; mid[i * 3 + 1] = target + (g - l) * s; mid[i * 3 + 2] = target + (b - l) * s;
      }
    }
    function renderIvy(p) {
      const { dens, stem } = vine; dens.fill(0); stem.fill(0);
      for (const [x0, y0, x1, y1, t] of ivy.segs) {
        if (t > p) continue;
        for (let k = 0; k <= 2; k++) { const x = (x0 + (x1 - x0) * k / 2) | 0, y = (y0 + (y1 - y0) * k / 2) | 0; if (x >= 0 && x < W && y >= 0 && y < H) stem[y * W + x] = 1; }
      }
      for (const [lx, ly, r0, t, a] of ivy.leaves) {
        if (t > p) continue;
        const r = r0 * 1.1 * Math.min(1, (p - t) / 0.05 + 0.3), Rr = Math.ceil(r + 1.5);
        const lobes = [[0, 0, 1], [Math.cos(a + 1.3) * r * 0.55, Math.sin(a + 1.3) * r * 0.55, 0.72], [Math.cos(a - 1.3) * r * 0.55, Math.sin(a - 1.3) * r * 0.55, 0.72], [Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, 0.7]];
        for (let yy = -Rr - 1; yy <= Rr + 1; yy++) for (let xx = -Rr - 1; xx <= Rr + 1; xx++) {
          const X = (lx + xx) | 0, Y = (ly + yy) | 0; if (X < 0 || X >= W || Y < 0 || Y >= H) continue;
          let v = 0; for (const [ox, oy, s] of lobes) { const d = Math.hypot(xx - ox, yy - oy) / (r * s); if (d < 1) v = Math.max(v, 1 - d * d); }
          const i = Y * W + X; dens[i] = Math.min(1.4, dens[i] + v);
        }
      }
    }

    let lastEdge = null, needFull = true, waterIdx = null, composed = 'none', wTop = 0, wBot = 1;
    function px(x, y, i, t, edge, amp, step) {
      let v = back[i];
      if (water && water[i] > 0.5 && amp) {
        // thin horizontal bands of reflection slide past each other, wider and slower toward the viewer
        const k = 720 / W, yy = y * k, depth = clamp((y - wTop) / Math.max(1, wBot - wTop));
        const wd = (0.25 + 1.1 * depth) * (0.6 * Math.sin(yy * (1.6 - 0.9 * depth) + t * 1.1) + 0.4 * Math.sin(yy * 0.47 - t * 0.7 + x * k * 0.03)) / k;
        const sx = x - wd, xi = clamp(Math.floor(sx), 0, W - 2), f = clamp(sx - xi), ja = y * W + xi;
        if (water[ja] > 0.5 && water[ja + 1] > 0.5) v = back[ja] * (1 - f) + back[ja + 1] * f;
      }
      if (flowM && amp && flowM[i] > 0.5) {
        // the sky's strokes slide a little way along themselves and back, each patch in its own time
        const s = (scene.flowAmp ?? 2) * (W / 1440 + 0.4) * Math.sin(t * (scene.flowSpeed ?? 0.6) + flowPh[i] * 7), sx = clamp(x + fxA[i] * s, 0, W - 1.001), sy = clamp(y + fyA[i] * s, 0, H - 1.001);
        const xi = sx | 0, yi = sy | 0, fx = sx - xi, fy = sy - yi, j = yi * W + xi;
        v = (back[j] * (1 - fx) + back[j + 1] * fx) * (1 - fy) + (back[j + W] * (1 - fx) + back[j + W + 1] * fx) * fy;
      }
      if (bob && amp && bob[i] > 0.5) { const sy = clamp(y - 0.9 * Math.sin(t * 1.25 + x * 0.012), 0, H - 1.001), yi = sy | 0, f = sy - yi; v = back[yi * W + x] * (1 - f) + back[(yi + 1) * W + x] * f; }
      if (gW && gW[i] !== 0) v += gW[i] * (amp ? 0.5 + 0.5 * Math.sin(t * gS[i] + gP[i]) : 0.5);
      if (rM && rM[i] > 0) v += rM[i] * (nX[i] * lq.x + nY[i] * lq.y);
      if (dyn && x >= db[0] && x < db[2] && y >= db[1] && y < db[3]) { const j = (y - db[1]) * dynC.width + (x - db[0]), a = dynA[j]; if (a > 0.004) v = v * (1 - a) + dynV[j] * a; }
      if (hasFront && (frontA[i] > 0.001 || amp)) {
        let dx = 0;
        if (amp) {
          const w = (scene.wind || (() => 1))(x / W, y / H), near = Math.max(18, W * 0.06);
          dx = amp * w * (0.6 * Math.sin(step * 0.9 + y * 0.045 + x * 0.012) + 0.4 * Math.sin(step * 1.7 - y * 0.11 + x * 0.03));
          const dd = Math.hypot(x - pointer.x, y - pointer.y); if (dd < near) dx += w * (1 - dd / near) * 1.4 * Math.sin(step * 5 + y * 0.35) * Math.min(1, pointer.energy);
        }
        const sx = x - dx, xi = Math.floor(sx), f = sx - xi, x0 = clamp(xi, 0, W - 1), x1 = clamp(xi + 1, 0, W - 1);
        const a = frontA[y * W + x0] * (1 - f) + frontA[y * W + x1] * f;
        if (a > 0.001) { const fv = (front[y * W + x0] * frontA[y * W + x0] * (1 - f) + front[y * W + x1] * frontA[y * W + x1] * f) / a; v = v * (1 - a) + fv * a; }
      }
      if (ivy) { const d = vine.dens[i]; if (d > 0.06) { const k = Math.min(1, d * 1.5); v = v * (1 - k) + ((scene.ivyTone ?? 0.2) + 0.3 * Math.max(0, d - 0.7)) * k; } else if (vine.stem[i]) v = 0.1; }
      // the painting dissolves into the paper along a ragged edge at the bottom, rising as you scroll
      const fe = (y / H) - edge + fadeN[i] * 0.07; if (fe > 0) v += Math.min(1.1, fe * 9);
      if (clearF && clearF[i] > 0) { const to = scene.clearTo ?? 0.93; if (to > 0.5 ? v < to : v > to) v += (to - v) * clearF[i] * (scene.clearStrength ?? 0.82); }
      return clamp(v + G[i] * (scene.grain ?? 0.08), -0.2, 1.2);
    }
    function compose(t) {
      const amp = reduced ? 0 : (scene.sway ?? 0.55), step = Math.floor(t * 7) / 7;
      const edge = (scene.fadeAt ?? 0.92) - Math.max(0, scrollP - 0.05) * 0.5;
      if (edge !== lastEdge) needFull = true;
      if (dyn) {
        const x = dynC.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, dynC.width, dynC.height); x.translate(-db[0], -db[1]);
        dyn.draw(x, reduced ? 0 : t, { W, H, pointer, scrollP });
        const d = x.getImageData(0, 0, dynC.width, dynC.height).data; for (let j = 0; j < dynA.length; j++) { dynA[j] = d[j * 4 + 3] / 255; dynV[j] = d[j * 4] / 255; }
      }
      if (needFull || hasFront) {
        for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) L[i] = px(x, y, i, t, edge, amp, step);
        needFull = false; lastEdge = edge; composed = 'all';
      } else if (waterIdx && amp) {
        for (let n = 0; n < waterIdx.length; n++) { const i = waterIdx[n], y = (i / W) | 0; L[i] = px(i - y * W, y, i, t, edge, amp, step); }
        composed = 'water';
      }
    }
    // dither only the dots whose tone changed (plus a small margin), freezing the rest.
    // composed tells us which dots could have changed: all of them, or just the water.
    let dl = new Int32Array(0), dn = 0, y0 = 0, y1 = -1, full = true;
    function mark(i) { if (!dirty[i]) { dirty[i] = 1; dl[dn++] = i; } }
    function dither(all) {
      if (dl.length !== W * H) dl = new Int32Array(W * H);
      dn = 0;
      if (all) { for (let i = 0; i < W * H; i++) { dirty[i] = 1; dl[i] = i; } dn = W * H; }
      else {
        const cand = composed === 'all' ? null : composed === 'water' ? waterIdx : [];
        if (cand) { for (let n = 0; n < cand.length; n++) { const i = cand[n]; if (Math.abs(L[i] - Lused[i]) > 0.004) mark(i); } }
        else for (let i = 0; i < W * H; i++) if (Math.abs(L[i] - Lused[i]) > 0.004) mark(i);
        // grow the dirty area by two dots so changed patches re-weave as a whole
        for (let pass = 0; pass < 2; pass++) { const m = dn; for (let n = 0; n < m; n++) { const i = dl[n], x = i % W; if (x > 0) mark(i - 1); if (x < W - 1) mark(i + 1); if (i >= W) mark(i - W); if (i + W < W * H) mark(i + W); } }
      }
      composed = 'none';
      if (!dn) { y1 = -1; return false; }
      rowDirty.fill(0); y0 = H; y1 = 0;
      for (let n = 0; n < dn; n++) { const i = dl[n], y = (i / W) | 0; rowDirty[y] = 1; if (y < y0) y0 = y; if (y > y1) y1 = y; e[i] = L[i]; }
      for (let y = Math.max(0, y0 - 2); y <= y1; y++) {
        const rtl = y & 1;
        if (!(rowDirty[y] || rowDirty[y + 1] || rowDirty[y + 2])) continue;
        for (let k = 0; k < W; k++) {
          const x = rtl ? W - 1 - k : k, i = y * W + x;
          let er;
          if (dirty[i]) { const v = e[i], b = v < 0.25 ? 0 : v < 0.75 ? 1 : 2; out[i] = b; er = errOut[i] = v - b * 0.5; Lused[i] = L[i]; }
          else er = errOut[i];
          if (er === 0) continue;
          for (let q = 0; q < 12; q++) { const K = STUCKI[q], xx = x + (rtl ? -K[0] : K[0]), yy = y + K[1]; if (xx >= 0 && xx < W && yy < H) { const j = yy * W + xx; if (dirty[j]) e[j] += er * K[2]; } }
        }
      }
      return true;
    }
    let img = null;
    function paintOut(all) {
      if (!img || img.width !== W || img.height !== H) { img = ctx.createImageData(W, H); all = true; }
      if (repaintAll) { all = true; repaintAll = false; }
      const d = img.data;
      const put = (i) => {
        const b = out[i], j = i * 4;
        if (b === 0) { d[j] = inkC[0]; d[j + 1] = inkC[1]; d[j + 2] = inkC[2]; }
        else if (b === 2) { d[j] = paperC[0]; d[j + 1] = paperC[1]; d[j + 2] = paperC[2]; }
        else { d[j] = mid[i * 3]; d[j + 1] = mid[i * 3 + 1]; d[j + 2] = mid[i * 3 + 2]; }
        d[j + 3] = 255;
      };
      if (all) { for (let i = 0; i < W * H; i++) put(i); ctx.putImageData(img, 0, 0); }
      else if (dn && y1 >= y0) { for (let n = 0; n < dn; n++) put(dl[n]); ctx.putImageData(img, 0, 0, 0, y0, W, y1 - y0 + 1); }
      for (let n = 0; n < dn; n++) dirty[dl[n]] = 0;
      dn = 0;
    }
    // birds live on their own transparent layer, so they never touch the dither
    let over = null, octx = null;
    function overlay() {
      if (!over) { over = document.createElement('canvas'); over.setAttribute('aria-hidden', 'true'); over.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none'; canvas.after(over); octx = over.getContext('2d'); }
      if (over.width !== W || over.height !== H) { over.width = W; over.height = H; }
      return octx;
    }
    // swallows: a few ink marks that wheel slowly, keep away from the cursor, and leave when you scroll
    const BIRD = [
      [[-4, -2], [-3, -2], [-2, -1], [-1, 0], [0, 0], [1, 0], [2, -1], [3, -2], [4, -2], [0, 1], [-1, -1], [1, -1]],
      [[-4, 0], [-3, -1], [-2, -1], [-1, 0], [0, 0], [1, 0], [2, -1], [3, -1], [4, 0], [0, 1]],
      [[-4, 2], [-3, 1], [-2, 1], [-1, 0], [0, 0], [1, 0], [2, 1], [3, 1], [4, 2], [0, 1], [0, -1]],
    ];
    function stepBirds(dt, t) {
      const leave = scrollP > 0.12;
      for (const b of state.birds) {
        let ax, ay;
        if (leave) { ax = (b.x > W / 2 ? 1 : -1) * 14 * W / 720; ay = -10 * W / 720; }
        else {
          b.a += dt * b.spin; const tx = b.hx * W + Math.cos(b.a) * b.rx * W, ty = b.hy * H + Math.sin(b.a * 1.3) * b.ry * H;
          ax = (tx - b.x) * 0.5; ay = (ty - b.y) * 0.5;
          const dx = b.x - pointer.x, dy = b.y - pointer.y, d = Math.hypot(dx, dy), rr = W * 0.09;
          if (d < rr) { ax += dx / (d || 1) * 90 * (1 - d / rr); ay += dy / (d || 1) * 90 * (1 - d / rr); }
        }
        b.vx = (b.vx + ax * dt) * 0.97; b.vy = (b.vy + ay * dt) * 0.97;
        const sp = Math.hypot(b.vx, b.vy), mx = (leave ? 60 : 24) * W / 720; if (sp > mx) { b.vx *= mx / sp; b.vy *= mx / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt; b.ph += dt * (3 + sp * 0.25);
      }
    }
    function drawOverlay(t, dt) {
      const o = overlay(); o.clearRect(0, 0, W, H); o.fillStyle = scene.ink;
      if (state.draw) { o.save(); state.draw(o, t, dt, { W, H, pointer, scrollP, R, reduced }); o.restore(); o.fillStyle = scene.ink; }
      for (const b of state.birds || []) {
        const ph = Math.floor(b.ph) % 4, f = BIRD[[0, 1, 2, 1][(ph + 4) % 4]], bx = Math.round(b.x), by = Math.round(b.y), z = Math.max(1, Math.round(W / 900));
        for (const [ox, oy] of f) o.fillRect(bx + ox * z, by + oy * z, z, z);
      }
    }

    let last = performance.now(), raf = 0;
    function tick(now) {
      raf = requestAnimationFrame(tick);
      if (!ready || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = (now - t0) / 1000; frameNo++;
      pointer.energy = Math.max(0, (pointer.energy || 0) * 0.96);
      if (ivy) {
        // the ivy keeps growing: slowly with time, faster as you read down the page; never backwards
        const target = Math.min(1, (scene.ivyStart ?? 0.25) + t / (scene.ivySeconds || 120) + scrollP * 0.5);
        if (target > lastVine + 0.004) { lastVine = Math.max(lastVine, target); renderIvy(lastVine); needFull = true; if (t - lastTint > 1.5) { tintMid(); lastTint = t; } }
      }
      if (state.birds) stepBirds(dt, t);
      if (rM) {
        // the light drifts slowly on its own and leans toward the cursor
        const on = pointer.x > -1e3, tx = on ? clamp((pointer.x / W - 0.5) * 2, -1, 1) : Math.cos(t * 0.05), ty = on ? clamp((pointer.y / H - 0.4) * 2, -1, 1) : Math.sin(t * 0.035) * 0.5;
        light.x += (tx * (scene.lightAmp ?? 0.6) - light.x) * 0.03; light.y += (ty * (scene.lightAmp ?? 0.6) - light.y) * 0.03;
        // the light moves in small steps, so the statue re-weaves only when it has really moved
        lq.x = Math.round(light.x * 14) / 14; lq.y = Math.round(light.y * 14) / 14;
      }
      if (frameNo === 1 || needFull || frameNo % (scene.every || 3) === 0) { compose(t); dither(frameNo === 1); paintOut(frameNo === 1); }
      if (state.birds || state.draw) drawOverlay(t, dt);
    }
    async function start() {
      if (scene.src && !scene._img) scene._img = await loadImage(scene.src);
      if (scene.images && !scene._imgs) { scene._imgs = {}; for (const [k, u] of Object.entries(scene.images)) scene._imgs[k] = await loadImage(u); }
      build();
      if (reduced) { if (ivy) { lastVine = 0.75; renderIvy(lastVine); tintMid(); } compose(0); dither(true); paintOut(true); if (state.birds || state.draw) drawOverlay(0, 0); return; }
      raf = requestAnimationFrame(tick);
    }
    addEventListener('pointermove', (ev) => {
      const r = canvas.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H;
      pointer.energy = Math.min(1, (pointer.energy || 0) + Math.hypot(x - pointer.x, y - pointer.y) * 0.02 || 0);
      pointer.x = x; pointer.y = y;
    }, { passive: true });
    addEventListener('scroll', () => { scrollP = clamp(scrollY / innerHeight); }, { passive: true });
    let rs = 0; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => { const w0 = W; build(); frameNo = 0; if (reduced) { compose(0); dither(true); paintOut(true); } }, 200); });
    start();
    return { get size() { return [W, H]; } };
  };
})();
