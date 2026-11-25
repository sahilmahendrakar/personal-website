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
    let W, H, back, front, frontA, colour, G, L, Lused, out, errOut, e, dirty, rowDirty, mid, vine, ivy, inkC, paperC, R, state, ready = false;
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
      state = scene.paint(P) || {};
      const gb = P.back.getImageData(0, 0, W, H).data, gf = P.front.getImageData(0, 0, W, H).data;
      back = new Float32Array(W * H); front = new Float32Array(W * H); frontA = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) { back[i] = gb[i * 4] / 255; front[i] = gf[i * 4] / 255; frontA[i] = gf[i * 4 + 3] / 255; }
      if (state.texture) state.texture(back, front);
      // the colour layer is blurred heavily: the middle ink drifts, it never outlines shapes
      const cd = P.colour.getImageData(0, 0, W, H).data, br = Math.max(3, Math.round(Math.min(W, H) / 30));
      colour = new Float32Array(W * H * 3);
      for (let q = 0; q < 3; q++) { let A = new Float32Array(W * H); for (let i = 0; i < W * H; i++) A[i] = cd[i * 4 + q]; A = blur(blur(A, W, H, br), W, H, br); for (let i = 0; i < W * H; i++) colour[i * 3 + q] = A[i]; }
      // a soft swirly grain so flat areas break into eddies instead of a regular weave
      G = new Float32Array(W * H); for (let i = 0; i < G.length; i++) G[i] = R() * 2 - 1;
      G = blur(blur(G, W, H, 3), W, H, 2); let mx = 0; for (const v of G) mx = Math.max(mx, Math.abs(v)); for (let i = 0; i < G.length; i++) G[i] /= mx || 1;
      L = new Float32Array(W * H); Lused = new Float32Array(W * H).fill(-9); out = new Uint8Array(W * H); errOut = new Float32Array(W * H); e = new Float32Array(W * H);
      dirty = new Uint8Array(W * H); rowDirty = new Uint8Array(H + 3); mid = new Uint8ClampedArray(W * H * 3);
      vine = { dens: new Float32Array(W * H), stem: new Uint8Array(W * H) };
      ivy = state.ivy ? growIvy(state.ivy, W, H, R) : null;
      if (state.birds) state.birds.forEach((b) => Object.assign(b, { x: b.hx * W, y: b.hy * H, vx: 0, vy: 0, ph: R() * 6.28, a: R() * 6.28 }));
      lastVine = -1; tintMid(); ready = true;
    }
    // middle ink: the local colour, re-lit to sit halfway between ink and paper
    function tintMid() {
      const li = lum(inkC), lp = lum(paperC), target = li + (lp - li) * 0.5, sat = scene.sat || 1.5;
      let vd = null; if (ivy) vd = blur(vine.dens, W, H, 3);
      const leaf = scene.leaf ? hex(scene.leaf) : null;
      for (let i = 0; i < W * H; i++) {
        let r = colour[i * 3], g = colour[i * 3 + 1], b = colour[i * 3 + 2];
        if (vd && leaf) { const k = clamp(vd[i] * 2.2); r += (leaf[0] - r) * k; g += (leaf[1] - g) * k; b += (leaf[2] - b) * k; }
        const l = 0.3 * r + 0.59 * g + 0.11 * b;
        mid[i * 3] = target + (r - l) * sat; mid[i * 3 + 1] = target + (g - l) * sat; mid[i * 3 + 2] = target + (b - l) * sat;
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

    function compose(t) {
      const sway = reduced ? 0 : 1, amp = (scene.sway ?? 0.55) * sway, px = pointer.x, py = pointer.y, near = Math.max(18, W * 0.06);
      const step = Math.floor(t * 7) / 7; // the front moves in small steps, like leaves catching the wind
      const ws = scene.wind || ((x, y) => 1);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const i = y * W + x; let v = back[i];
          if (frontA[i] > 0.001 || amp) {
            let dx = 0;
            if (amp) {
              const w = ws(x / W, y / H);
              dx = amp * w * (0.6 * Math.sin(step * 0.9 + y * 0.045 + x * 0.012) + 0.4 * Math.sin(step * 1.7 - y * 0.11 + x * 0.03));
              const dd = Math.hypot(x - px, y - py); if (dd < near) dx += w * (1 - dd / near) * 1.4 * Math.sin(step * 5 + y * 0.35) * Math.min(1, pointer.energy);
            }
            const sx = x - dx, xi = Math.floor(sx), f = sx - xi, x0 = clamp(xi, 0, W - 1), x1 = clamp(xi + 1, 0, W - 1);
            const a = frontA[y * W + x0] * (1 - f) + frontA[y * W + x1] * f;
            if (a > 0.001) { const fv = (front[y * W + x0] * frontA[y * W + x0] * (1 - f) + front[y * W + x1] * frontA[y * W + x1] * f) / a; v = v * (1 - a) + fv * a; }
          }
          if (ivy) { const d = vine.dens[i]; if (d > 0.06) { const k = Math.min(1, d * 1.5); v = v * (1 - k) + (0.2 + 0.32 * Math.max(0, d - 0.7)) * k; } else if (vine.stem[i]) v = 0.08; }
          L[i] = clamp(v + G[i] * (scene.grain ?? 0.08), -0.2, 1.2);
        }
      }
    }
    // dither only the dots whose tone changed (plus a small margin), freezing the rest
    function dither(full) {
      dirty.fill(0); rowDirty.fill(0); let any = false;
      for (let i = 0; i < W * H; i++) if (full || Math.abs(L[i] - Lused[i]) > 0.004) { dirty[i] = 1; any = true; }
      if (!any) return false;
      if (!full) { // grow the dirty area by two dots so changed patches re-weave as a whole
        for (let pass = 0; pass < 2; pass++) { const d2 = Uint8Array.from(dirty); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d2[y * W + x]) { if (x > 0) dirty[y * W + x - 1] = 1; if (x < W - 1) dirty[y * W + x + 1] = 1; if (y > 0) dirty[(y - 1) * W + x] = 1; if (y < H - 1) dirty[(y + 1) * W + x] = 1; } }
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (dirty[y * W + x]) { rowDirty[y] = 1; break; }
      for (let i = 0; i < W * H; i++) if (dirty[i]) e[i] = L[i];
      for (let y = 0; y < H; y++) {
        const rtl = y & 1, near = rowDirty[y] || rowDirty[y + 1] || rowDirty[y + 2];
        if (!near) continue;
        for (let k = 0; k < W; k++) {
          const x = rtl ? W - 1 - k : k, i = y * W + x;
          let er;
          if (dirty[i]) { const v = e[i], b = v < 0.25 ? 0 : v < 0.75 ? 1 : 2; out[i] = b; er = errOut[i] = v - b * 0.5; Lused[i] = L[i]; }
          else er = errOut[i];
          for (let q = 0; q < 12; q++) { const K = STUCKI[q], xx = x + (rtl ? -K[0] : K[0]), yy = y + K[1]; if (xx >= 0 && xx < W && yy < H) { const j = yy * W + xx; if (dirty[j]) e[j] += er * K[2]; } }
        }
      }
      return true;
    }
    let img = null;
    function paintOut(t) {
      if (!img || img.width !== W) img = ctx.createImageData(W, H);
      const d = img.data;
      for (let i = 0; i < W * H; i++) {
        const b = out[i], j = i * 4;
        if (b === 0) { d[j] = inkC[0]; d[j + 1] = inkC[1]; d[j + 2] = inkC[2]; }
        else if (b === 2) { d[j] = paperC[0]; d[j + 1] = paperC[1]; d[j + 2] = paperC[2]; }
        else { d[j] = mid[i * 3]; d[j + 1] = mid[i * 3 + 1]; d[j + 2] = mid[i * 3 + 2]; }
        d[j + 3] = 255;
      }
      if (state.birds) drawBirds(d, t);
      ctx.putImageData(img, 0, 0);
    }
    // swallows: a few ink marks that wheel slowly, keep away from the cursor, and leave when you scroll
    const BIRD = [[[-2, 0], [-1, -1], [0, 0], [1, -1], [2, 0]], [[-2, -1], [-1, 0], [0, 0], [1, 0], [2, -1]], [[-2, 1], [-1, 0], [0, 0], [1, 0], [2, 1]]];
    function stepBirds(dt, t) {
      const leave = scrollP > 0.12;
      for (const b of state.birds) {
        let ax, ay;
        if (leave) { ax = (b.x > W / 2 ? 1 : -1) * 14; ay = -10; }
        else {
          b.a += dt * b.spin; const tx = b.hx * W + Math.cos(b.a) * b.rx * W, ty = b.hy * H + Math.sin(b.a * 1.3) * b.ry * H;
          ax = (tx - b.x) * 0.5; ay = (ty - b.y) * 0.5;
          const dx = b.x - pointer.x, dy = b.y - pointer.y, d = Math.hypot(dx, dy), rr = W * 0.09;
          if (d < rr) { ax += dx / (d || 1) * 90 * (1 - d / rr); ay += dy / (d || 1) * 90 * (1 - d / rr); }
        }
        b.vx = (b.vx + ax * dt) * 0.97; b.vy = (b.vy + ay * dt) * 0.97;
        const sp = Math.hypot(b.vx, b.vy), mx = leave ? 60 : 16; if (sp > mx) { b.vx *= mx / sp; b.vy *= mx / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt; b.ph += dt * (3 + sp * 0.25);
      }
    }
    function drawBirds(d) {
      for (const b of state.birds) {
        const f = BIRD[(Math.floor(b.ph) % 3 + 3) % 3], bx = Math.round(b.x), by = Math.round(b.y);
        for (const [ox, oy] of f) { const x = bx + ox, y = by + oy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const j = (y * W + x) * 4; d[j] = inkC[0]; d[j + 1] = inkC[1]; d[j + 2] = inkC[2]; }
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
        if (target > lastVine + 0.0025) { lastVine = Math.max(lastVine, target); renderIvy(lastVine); if (t - lastTint > 1.5) { tintMid(); lastTint = t; } }
      }
      if (state.birds) stepBirds(dt, t);
      compose(t);
      dither(frameNo === 1);
      paintOut(t);
    }
    function start() {
      build();
      if (reduced) { if (ivy) { lastVine = 0.75; renderIvy(lastVine); tintMid(); } compose(0); dither(true); paintOut(0); return; }
      raf = requestAnimationFrame(tick);
    }
    addEventListener('pointermove', (ev) => {
      const r = canvas.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H;
      pointer.energy = Math.min(1, (pointer.energy || 0) + Math.hypot(x - pointer.x, y - pointer.y) * 0.02 || 0);
      pointer.x = x; pointer.y = y;
    }, { passive: true });
    addEventListener('scroll', () => { scrollP = clamp(scrollY / innerHeight); }, { passive: true });
    let rs = 0; addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => { const w0 = W; build(); frameNo = 0; if (reduced) { compose(0); dither(true); paintOut(0); } }, 200); });
    start();
    return { get size() { return [W, H]; } };
  };
})();
