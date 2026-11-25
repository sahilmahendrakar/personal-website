// Living dithered hero scenes.
// Each scene is a public-domain artwork redrawn every frame at a small grid
// resolution: a plate (the painting with its moving parts cut out), sprites
// for those parts, a displacement field for water/wind, and small procedural
// creatures. The result is palette-dithered with blue noise, so anything that
// moves stays perfectly in the same visual language as the still parts.
// Motion is deliberately faint: most of it should only be noticed on a second look.
(function () {
  'use strict';
  const D = window.Dither, BN = D.BN, TAU = Math.PI * 2;
  const HERE = ((document.currentScript && document.currentScript.src) || location.href).replace(/[^/]*$/, '');
  const ART = HERE + '../img/art/', AS = HERE + 'assets/';
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mix = (a, b, t) => a + (b - a) * t;

  // ------------------------------------------------------------------ helpers

  // A feathered rectangle of the image (u0,v0,u1,v1), rasterised on the grid.
  function region(S, r, f = 0.3) {
    const [a, b] = S.toGrid(r[0], r[1]), [c, d] = S.toGrid(r[2], r[3]);
    const x0 = Math.max(0, Math.floor(a)), y0 = Math.max(0, Math.floor(b)), x1 = Math.min(S.W, Math.ceil(c)), y1 = Math.min(S.H, Math.ceil(d));
    if (x1 <= x0 || y1 <= y0) return null;
    const fw = Math.max(1, Math.min(c - a, d - b) * f), rw = x1 - x0, w = new Float32Array(rw * (y1 - y0));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) w[(y - y0) * rw + (x - x0)] = smooth(0, fw, Math.min(x - a, c - x, y - b, d - y));
    return { x0, y0, x1, y1, rw, w, a, b, c, d };
  }

  // Horizontal shimmer on water, stronger toward the viewer.
  function water(S, R, amp, t) {
    if (!R) return;
    const { DX, DY, W } = S;
    for (let y = R.y0; y < R.y1; y++) {
      const depth = clamp((y - R.b) / (R.d - R.b)), A = amp * (0.35 + 0.65 * depth), s1 = Math.sin(y * 0.83 + t * 1.25);
      for (let x = R.x0; x < R.x1; x++) {
        const w = R.w[(y - R.y0) * R.rw + (x - R.x0)]; if (!w) continue;
        const i = y * W + x;
        DX[i] += A * w * (0.62 * s1 + 0.38 * Math.sin(y * 0.29 - t * 0.85 + x * 0.045));
        DY[i] += A * w * 0.16 * Math.sin(x * 0.21 + t * 1.7 + y * 0.6);
      }
    }
  }

  // Wind through foliage, grass or drapery: slow travelling waves with gusts.
  function sway(S, R, amp, speed, t) {
    if (!R) return;
    const { DX, DY, W } = S;
    for (let y = R.y0; y < R.y1; y++) for (let x = R.x0; x < R.x1; x++) {
      const w = R.w[(y - R.y0) * R.rw + (x - R.x0)]; if (!w) continue;
      const i = y * W + x, g = 0.6 + 0.4 * Math.sin(t * 0.21 - x * 0.012);
      DX[i] += amp * w * g * (0.7 * Math.sin(t * speed - x * 0.06 + y * 0.035) + 0.3 * Math.sin(t * speed * 2.1 + x * 0.13 + y * 0.05));
      DY[i] += amp * w * g * 0.3 * Math.sin(t * speed * 1.3 + x * 0.05 - y * 0.02);
    }
  }

  // Expanding rings (perspective-squashed), used for the cursor's wake on water.
  function ripples(S, list, t, mask) {
    const { DX, DY, W, H } = S;
    for (let k = list.length - 1; k >= 0; k--) {
      const R = list[k], age = t - R.t0; if (age > R.life) { list.splice(k, 1); continue; }
      const rad = age * R.speed, band = 3 + age * 1.2, fade = R.amp * (1 - age / R.life) ** 2, sq = 0.42;
      const x0 = Math.max(0, (R.x - rad - band) | 0), x1 = Math.min(W, Math.ceil(R.x + rad + band)), y0 = Math.max(0, (R.y - (rad + band) * sq) | 0), y1 = Math.min(H, Math.ceil(R.y + (rad + band) * sq));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const dx = x - R.x, dy = (y - R.y) / sq, d = Math.hypot(dx, dy) || 1, e = d - rad; if (Math.abs(e) > band) continue;
        const i = y * W + x, m = mask ? mask(x, y) : 1, s = fade * m * Math.sin(e / band * Math.PI) * (1 - Math.abs(e) / band);
        DX[i] += s * dx / d; DY[i] += s * dy / d * sq;
      }
    }
  }

  // Bird silhouettes. Seen from below/behind at distance they are just an "m".
  function bird(ctx, x, y, s, flap, col) {
    const up = Math.sin(flap);
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1, s * 0.24); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - s, y - s * (0.15 + 0.55 * up));
    ctx.quadraticCurveTo(x - s * 0.45, y - s * (0.3 + 0.25 * up), x, y);
    ctx.quadraticCurveTo(x + s * 0.45, y - s * (0.3 + 0.25 * up), x + s, y - s * (0.15 + 0.55 * up));
    ctx.stroke();
  }
  function perched(ctx, x, y, s, col, look) {
    // a tiny two-pixel body and a one-pixel head
    ctx.fillStyle = col;
    const X = Math.round(x), Y = Math.round(y);
    ctx.fillRect(X, Y - 2, 1, 2);
    ctx.fillRect(X + (look > 0 ? 1 : -1), Y - 2, 1, 1);
  }

  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const lum = (c) => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const darkest = (P) => P.reduce((a, b) => (lum(b) < lum(a) ? b : a));

  // Draw a sprite (full-res image + its normalised rect) into grid space,
  // optionally rotated about a pivot (image uv) and shifted (grid px).
  function sprite(S, ctx, sp, o = {}) {
    if (!sp.img) return;
    const k = S.k, ox = -S.win.x * k, oy = -S.win.y * k;
    ctx.setTransform(k * (o.scale || 1), 0, 0, k * (o.scale || 1), ox + (o.dx || 0), oy + (o.dy || 0));
    const px = (o.pivot ? o.pivot[0] : sp.x + sp.w / 2) * S.iw, py = (o.pivot ? o.pivot[1] : sp.y + sp.h / 2) * S.ih;
    if (o.rot) { ctx.translate(px, py); ctx.rotate(o.rot); ctx.translate(-px, -py); }
    ctx.drawImage(sp.img, sp.x * S.iw, sp.y * S.ih, sp.w * S.iw, sp.h * S.ih);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // ------------------------------------------------------------------ scenes

  const SCENES = {};

  // The Parthenon: swallows wheel around the temple and settle on the cornice.
  // They drift away from the cursor and leave when you scroll down.
  SCENES.parthenon = {
    title: 'The Parthenon', artist: 'Frederic Edwin Church', year: '1871', where: 'Metropolitan Museum of Art',
    plate: ART + 'parthenon.jpg', crop: [0.008, 0.012, 0.992, 0.985],
    center: { land: [0.5, 0.42], port: [0.57, 0.45] }, K: 18, spread: 30, sat: 1.12,
    setup(S) {
      S.grass = region(S, [0, 0.5, 0.36, 0.66]);
      S.grass2 = region(S, [0.6, 0.55, 0.82, 0.64]);
      const perch = [[0.495, 0.256], [0.535, 0.252], [0.575, 0.254], [0.66, 0.302], [0.405, 0.372], [0.826, 0.046], [0.858, 0.044]];
      S.perches = perch.map((p) => ({ p: S.toGrid(p[0], p[1]), busy: null }));
      const c = S.toGrid(0.55, 0.3), sc = S.k * S.iw;
      S.orbit = { cx: c[0], cy: c[1], rx: 0.2 * sc, ry: 0.07 * sc };
      S.size = Math.max(2.4, S.H * 0.011);
      S.birds = [];
      for (let i = 0; i < 7; i++) {
        const b = { x: 0, y: 0, vx: 0, vy: 0, mode: 'fly', flap: rnd(0, TAU), rate: rnd(15, 19), th: rnd(0, TAU), w: rnd(0.18, 0.32) * (Math.random() < 0.5 ? -1 : 1), off: rnd(-0.25, 0.25), timer: rnd(6, 20), look: 1 };
        if (i < 4) { const p = S.perches[i]; b.mode = 'perch'; b.perch = p; p.busy = b; b.x = p.p[0]; b.y = p.p[1]; b.timer = rnd(8, 30); }
        else { const t = orbitAt(S, b); b.x = t[0]; b.y = t[1]; }
        S.birds.push(b);
      }
      S.away = false;
    },
    field(S, t) { sway(S, S.grass, 0.35, 1.1, t); sway(S, S.grass2, 0.25, 0.9, t + 3); },
    draw(S, ctx, t, dt) {
      const col = rgb(darkest(S.palette).map((v, i) => v * 0.8 + [32, 24, 18][i] * 0.2));
      if (!S.away && S.scroll > 0.32) { S.away = true; S.birds.forEach((b) => { b.mode = 'leave'; b.delay = rnd(0, 0.5); if (b.perch) { b.perch.busy = null; b.perch = null; } }); }
      if (S.away && S.scroll < 0.08) { S.away = false; S.birds.forEach((b, i) => { if (b.mode === 'away' || b.mode === 'leave') { b.mode = 'return'; b.delay = 0.4 + i * rnd(0.5, 1.2); } }); }
      const sc = S.H / 300, m = S.mouse;
      for (const b of S.birds) {
        if (b.delay > 0) { b.delay -= dt; if (b.mode === 'perch' || b.mode === 'away') continue; }
        if (b.mode === 'return') {
          if (b.delay > 0) continue;
          b.x = Math.random() < 0.5 ? -8 : S.W + 8; b.y = rnd(0.05, 0.35) * S.H; b.vx = (b.x < 0 ? 1 : -1) * 30 * sc; b.vy = 0; b.mode = 'fly'; b.timer = rnd(8, 18);
        }
        if (b.mode === 'away') continue;
        if (b.mode === 'perch') {
          b.timer -= dt; if (Math.random() < dt * 0.25) b.look = -b.look;
          const near = m.active && Math.hypot(m.x - b.x, m.y - b.y) < 16 * sc;
          if (b.timer < 0 || near) { b.mode = 'fly'; b.perch.busy = null; b.perch = null; b.vy = -22 * sc; b.vx = rnd(-14, 14) * sc; b.timer = rnd(10, 24); }
          else { perched(ctx, b.x, b.y, S.size, col, b.look); continue; }
        }
        let tx, ty;
        if (b.mode === 'leave') {
          b.vy -= 26 * sc * dt; b.vx += Math.sign(b.vx || (b.x - S.W / 2)) * 16 * sc * dt;
          tx = null;
          if (b.y < -12 || b.x < -12 || b.x > S.W + 12) { b.mode = 'away'; continue; }
        } else if (b.mode === 'land') {
          [tx, ty] = b.perch.p;
          if (Math.hypot(tx - b.x, ty - b.y) < 1.2) { b.mode = 'perch'; b.x = tx; b.y = ty; b.vx = b.vy = 0; b.timer = rnd(10, 40); continue; }
        } else {
          b.th += b.w * dt; [tx, ty] = orbitAt(S, b);
          b.timer -= dt;
          if (b.timer < 0) { const free = S.perches.filter((p) => !p.busy); if (free.length && Math.random() < 0.7) { b.perch = free[(Math.random() * free.length) | 0]; b.perch.busy = b; b.mode = 'land'; } else b.timer = rnd(6, 14); }
        }
        if (tx !== null) {
          const k = b.mode === 'land' ? 2.2 : 0.9;
          b.vx += ((tx - b.x) * k - b.vx * 0.9) * dt * 2.2; b.vy += ((ty - b.y) * k - b.vy * 0.9) * dt * 2.2;
        }
        if (m.active && b.mode !== 'leave') {
          const dx = b.x - m.x, dy = b.y - m.y, d = Math.hypot(dx, dy) || 1, R = 34 * sc;
          if (d < R) { const f = (1 - d / R) * 70 * sc * dt; b.vx += dx / d * f; b.vy += dy / d * f; }
        }
        b.x += b.vx * dt; b.y += b.vy * dt;
        const glide = Math.sin(t * 0.9 + b.rate) > 0.35 && b.mode !== 'leave';
        b.flap += dt * (glide ? 0 : b.rate);
        bird(ctx, b.x, b.y, S.size * (b.mode === 'land' ? 0.9 : 1), glide ? 0.55 : b.flap, col);
      }
    },
  };
  function orbitAt(S, b) {
    const o = S.orbit, th = b.th;
    return [o.cx + o.rx * (1 + b.off) * Math.cos(th), o.cy + o.ry * (1 + b.off) * Math.sin(th) + o.ry * 0.35 * Math.sin(th * 2.3 + b.off * 9)];
  }

  // Impression, Sunrise: the water breathes, the boats bob, the sun climbs as you scroll,
  // and the cursor leaves a faint wake on the harbour.
  SCENES.sunrise = {
    title: 'Impression, Sunrise', artist: 'Claude Monet', year: '1872', where: 'Musée Marmottan Monet',
    plate: AS + 'sunrise-plate.jpg', palSrc: ART + 'sunrise.jpg',
    sprites: {
      boat1: { src: 'sunrise-boat1.png', x: 0.42375, y: 0.653, w: 0.118125, h: 0.18394 },
      boat2: { src: 'sunrise-boat2.png', x: 0.241875, y: 0.58313, w: 0.103125, h: 0.06426 },
      boat3: { src: 'sunrise-boat3.png', x: 0.135625, y: 0.53012, w: 0.085625, h: 0.05703 },
      sun: { src: 'sunrise-sun.png', x: 0.5925, y: 0.28514, w: 0.035, h: 0.04659 },
    },
    center: { land: [0.5, 0.52], port: [0.53, 0.56] }, K: 16, spread: 26, sat: 1.2,
    setup(S) {
      S.sea = region(S, [-0.05, 0.47, 1.05, 1.05], 0.08);
      S.sky = region(S, [-0.05, -0.05, 1.05, 0.3], 0.2);
      S.smoke = region(S, [0.16, 0.17, 0.28, 0.36]);
      S.rings = []; S.lastRing = 0; S.seaY = S.toGrid(0, 0.49)[1];
      S.gulls = [0, 1].map((i) => newGull(S, i * 9 + rnd(2, 6)));
    },
    field(S, t) {
      water(S, S.sea, 0.55, t);
      sway(S, S.sky, 0.35, 0.25, t);
      sway(S, S.smoke, 0.6, 0.5, t);
      const m = S.mouse;
      if (m.active && m.y > S.seaY && m.speed > 40 && t - S.lastRing > 0.22) { S.lastRing = t; S.rings.push({ x: m.x, y: m.y, t0: t, life: 2.6, speed: 7 * S.H / 300, amp: 0.7 }); }
      ripples(S, S.rings, t);
    },
    draw(S, ctx, t, dt) {
      const sp = S.sprites, rise = smooth(0, 1, S.scroll);
      sprite(S, ctx, sp.sun, { dy: -rise * S.H * 0.09, scale: 1 });
      const bob = (ph, a, per, drift) => ({ dy: a * Math.sin(TAU * t / per + ph), dx: drift * Math.sin(TAU * t / (per * 9) + ph), rot: 0.006 * Math.sin(TAU * t / (per * 1.3) + ph + 1) });
      sprite(S, ctx, sp.boat3, bob(2.1, 0.35, 3.4, 0.8));
      sprite(S, ctx, sp.boat2, bob(0.9, 0.4, 3.9, 1.1));
      sprite(S, ctx, sp.boat1, bob(0, 0.5, 4.6, 1.6));
      const col = rgb([62, 74, 84]);
      for (const g of S.gulls) {
        g.wait -= dt; if (g.wait > 0) continue;
        g.x += g.vx * dt; g.y = g.y0 + Math.sin(t * 0.6 + g.ph) * 2;
        const glide = Math.sin(t * 0.8 + g.ph) > -0.2; g.flap += dt * (glide ? 0 : 9);
        bird(ctx, g.x, g.y, g.s, glide ? 0.35 : g.flap, col);
        if (g.x < -20 || g.x > S.W + 20) Object.assign(g, newGull(S, rnd(6, 16)));
      }
    },
    post(S, d, t) {
      // the sky warms a little as the sun climbs
      const r = smooth(0, 1, S.scroll) * 0.08; if (r < 0.002) return;
      const H2 = (S.H * 0.55) | 0;
      for (let y = 0; y < H2; y++) { const f = r * (1 - y / H2); for (let x = 0; x < S.W; x++) { const j = (y * S.W + x) * 4; d[j] = Math.min(255, d[j] * (1 + f * 1.6)); d[j + 1] *= 1 + f * 0.35; d[j + 2] *= 1 - f * 0.5; } }
    },
  };
  function newGull(S, wait) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    return { wait, x: dir > 0 ? -16 : S.W + 16, y0: rnd(0.08, 0.3) * S.H, y: 0, vx: dir * rnd(9, 14) * S.H / 300, flap: 0, ph: rnd(0, TAU), s: Math.max(2.2, S.H * rnd(0.008, 0.012)) };
  }

  // The Swing: she swings, barely. Moving the cursor across her gives a small push,
  // scrolling sends the slipper further on its flight, and a few petals fall.
  SCENES.swing = {
    title: 'The Swing', artist: 'Jean-Honoré Fragonard', year: 'c. 1767', where: 'Wallace Collection',
    plate: AS + 'swing-plate.jpg', palSrc: ART + 'swing.jpg',
    sprites: {
      woman: { src: 'swing-woman.png', x: 0.261381, y: 0.28, w: 0.485871, h: 0.49375 },
      slipper: { src: 'swing-slipper.png', x: 0.203297, y: 0.51875, w: 0.048666, h: 0.043125 },
    },
    center: { land: [0.5, 0.55], port: [0.5, 0.55] }, K: 24, spread: 26, sat: 1.2, lift: 8, palBoost: [0.3, 0.5, 0.72, 0.76], palBoostWeight: 2,
    setup(S) {
      S.crown = region(S, [-0.05, -0.05, 1.05, 0.46], 0.15);
      S.bush = region(S, [-0.05, 0.74, 1.05, 1.05], 0.15);
      S.pivot = [0.648, 0.272]; S.phase = 0; S.amp = 0.012; S.push = 0;
      S.her = S.toGrid(0.55, 0.6);
      S.petals = Array.from({ length: 4 }, () => newPetal(S, true));
      const pinks = S.palette.filter((c) => c[0] > c[1] + 25 && lum(c) > 120);
      S.petal = pinks.length ? pinks.sort((a, b) => lum(b) - lum(a))[0] : [236, 190, 186];
    },
    field(S, t) { sway(S, S.crown, 0.4, 0.55, t); sway(S, S.bush, 0.3, 0.8, t + 2); },
    draw(S, ctx, t, dt) {
      const m = S.mouse;
      if (m.active && Math.abs(m.y - S.her[1]) < S.H * 0.2 && Math.abs(m.x - S.her[0]) < S.W * 0.25) S.push = Math.min(0.016, S.push + Math.abs(m.vx) * 0.0000025 * 300 / S.H);
      S.push *= Math.exp(-dt * 0.35);
      const target = 0.012 + S.scroll * 0.012 + S.push;
      S.amp += (target - S.amp) * Math.min(1, dt * 0.6);
      S.phase += dt * TAU / 5.2;
      const sp = S.sprites, a = S.amp * Math.sin(S.phase);
      sprite(S, ctx, sp.woman, { pivot: S.pivot, rot: a });
      const f = smooth(0, 1, S.scroll), k = S.k * S.iw;
      sprite(S, ctx, sp.slipper, { dx: -f * 0.16 * k, dy: (-f * 0.11 + f * f * 0.05) * k, rot: -f * 5, pivot: [sp.slipper.x + sp.slipper.w / 2, sp.slipper.y + sp.slipper.h / 2] });
      const col = rgb(S.petal);
      for (const p of S.petals) {
        p.y += p.vy * dt; p.x += Math.sin(t * p.f + p.ph) * p.vx * dt; p.r += dt * p.spin;
        if (m.active) { const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy) || 1; if (d < 26) { p.x += dx / d * 12 * dt; p.y += dy / d * 6 * dt; } }
        if (p.y > S.H + 4) Object.assign(p, newPetal(S, false));
        ctx.fillStyle = col; const w = Math.max(1, Math.abs(Math.cos(p.r)) * p.s);
        ctx.fillRect(Math.round(p.x - w / 2), Math.round(p.y), Math.round(w), Math.max(1, Math.round(p.s * 0.7)));
      }
    },
    post(S, d, t) {
      // dappled light drifting through the canopy
      const H2 = (S.H * 0.5) | 0;
      for (let y = 0; y < H2; y++) for (let x = 0; x < S.W; x++) {
        const j = (y * S.W + x) * 4, f = 1 + 0.07 * Math.sin(x * 0.045 + t * 0.23) * Math.sin(y * 0.06 - t * 0.17 + x * 0.01) * (1 - y / H2);
        d[j] *= f; d[j + 1] *= f; d[j + 2] *= f;
      }
    },
  };
  function newPetal(S, first) {
    return { x: rnd(0.05, 0.95) * S.W, y: first ? rnd(0, 1) * S.H : -4, vy: rnd(4, 7) * S.H / 300, vx: rnd(3, 6), f: rnd(0.5, 1.1), ph: rnd(0, TAU), r: rnd(0, TAU), spin: rnd(1, 2.5), s: Math.max(1.5, S.H * 0.007) };
  }

  // Laocoön: the marble is relit by a lamp that follows the cursor, faintly flickering;
  // the serpents' coils tighten almost imperceptibly and the room darkens as you scroll.
  SCENES.laocoon = {
    title: 'Laocoön and His Sons', artist: 'Three sculptors of Rhodes', year: '1st century BC', where: 'Vatican Museums',
    plate: ART + 'laocoon.jpg', crop: [0, 0, 1, 0.97],
    center: { land: [0.5, 0.33], port: [0.44, 0.36] }, K: 10, spread: 34, sat: 1.0,
    setup(S) {
      S.coils = [[0.03, 0.33, 0.3, 0.56], [0.53, 0.3, 0.74, 0.52], [0.15, 0.58, 0.72, 0.8], [0.66, 0.6, 0.92, 0.76]].map((r) => region(S, r, 0.35));
      // pseudo-normals from blurred luminance, so the lamp can rake across the muscles
      const { W, H, base } = S, L = new Float32Array(W * H);
      for (let i = 0; i < W * H; i++) { const j = i * 4; L[i] = (0.3 * base[j] + 0.59 * base[j + 1] + 0.11 * base[j + 2]) / 255; }
      const B = blur(blur(L, W, H, 2), W, H, 2);
      S.NX = new Float32Array(W * H); S.NY = new Float32Array(W * H); S.ALB = L;
      const st = 3.2 * Math.max(1, 300 / H);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x, nx = -(B[i + 1] - B[i - 1]) * st * 4, ny = -(B[i + W] - B[i - W]) * st * 4, n = Math.hypot(nx, ny, 1);
        S.NX[i] = nx / n; S.NY[i] = ny / n;
      }
      S.lamp = [S.W * 0.3, S.H * 0.2];
      S.motes = Array.from({ length: 8 }, () => ({ x: rnd(0, S.W), y: rnd(0, S.H), vx: rnd(-1, 1), vy: rnd(-1.4, -0.3), ph: rnd(0, TAU) }));
    },
    field(S, t) { const a = 0.28 + S.scroll * 0.25; S.coils.forEach((R, i) => sway(S, R, a, 0.45 + i * 0.07, t + i * 1.7)); },
    draw(S, ctx, t, dt) {
      const m = S.mouse, auto = [S.W * (0.5 + 0.3 * Math.sin(t * 0.07)), S.H * (0.18 + 0.08 * Math.sin(t * 0.05))];
      const tgt = m.active ? [m.x, m.y] : auto;
      S.lamp[0] += (tgt[0] - S.lamp[0]) * Math.min(1, dt * 1.2); S.lamp[1] += (tgt[1] - S.lamp[1]) * Math.min(1, dt * 1.2);
      ctx.fillStyle = 'rgba(255,240,215,0.55)';
      for (const p of S.motes) {
        p.x += (p.vx + Math.sin(t * 0.3 + p.ph) * 0.6) * dt; p.y += p.vy * dt;
        if (p.y < -2 || p.x < -2 || p.x > S.W + 2) { p.y = S.H + 2; p.x = rnd(0, S.W); }
        const d = Math.hypot(p.x - S.lamp[0], p.y - S.lamp[1]); if (d < S.H * 0.35 && Math.sin(t * 1.3 + p.ph) > -0.3) ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
      }
    },
    post(S, d, t) {
      const { W, H, NX, NY } = S, [lx, ly] = S.lamp, hz = H * 0.45, flick = 1 + 0.018 * Math.sin(t * 7.1) * Math.sin(t * 3.3 + 1);
      const amb = 0.9 - S.scroll * 0.32, R2 = (H * 0.95) ** 2;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, j = i * 4, dx = lx - x, dy = ly - y, dist = Math.hypot(dx, dy, hz);
        const nd = (NX[i] * dx + NY[i] * dy + hz) / dist, fall = Math.max(0, 1 - (dx * dx + dy * dy) / R2);
        const f = (amb + 0.16 * (nd - 0.7) + (0.12 + S.scroll * 0.25) * fall) * flick;
        d[j] = Math.min(255, d[j] * f); d[j + 1] = Math.min(255, d[j + 1] * f * 0.985); d[j + 2] = Math.min(255, d[j + 2] * f * 0.96);
      }
    },
  };
  function blur(A, W, H, r) {
    const T = new Float32Array(A.length), O = new Float32Array(A.length);
    for (let y = 0; y < H; y++) { let s = 0, n = 0; for (let x = -r; x < W; x++) { if (x + r < W) { s += A[y * W + x + r]; n++; } if (x - r - 1 >= 0) { s -= A[y * W + x - r - 1]; n--; } if (x >= 0) T[y * W + x] = s / n; } }
    for (let x = 0; x < W; x++) { let s = 0, n = 0; for (let y = -r; y < H; y++) { if (y + r < H) { s += T[(y + r) * W + x]; n++; } if (y - r - 1 >= 0) { s -= T[(y - r - 1) * W + x]; n--; } if (y >= 0) O[y * W + x] = s / n; } }
    return O;
  }

  // The Starry Night: the sky keeps flowing along its own brushstrokes, the stars breathe,
  // the cursor stirs a small eddy, and the sky turns a little faster as you scroll.
  SCENES.starry = {
    title: 'The Starry Night', artist: 'Vincent van Gogh', year: '1889', where: 'Museum of Modern Art',
    plate: ART + 'starry.jpg',
    center: { land: [0.5, 0.5], port: [0.34, 0.5] }, K: 18, spread: 28, sat: 1.05, flow: true,
    setup(S) {
      const { W, H } = S, FX = new Float32Array(W * H), FY = new Float32Array(W * H);
      const vort = [[0.42, 0.3, 0.2, 1], [0.67, 0.47, 0.11, 0.8], [0.93, 0.13, 0.11, -0.4], [0.33, 0.55, 0.08, 0.35], [0.72, 0.15, 0.06, 0.4], [0.22, 0.07, 0.06, 0.4]];
      const V = vort.map(([u, v, r, s]) => { const [x, y] = S.toGrid(u, v); return [x, y, r * S.k * S.iw, s]; });
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const [u, v] = S.toUV(x, y), i = y * W + x;
        const sky = 1 - smooth(0.58, 0.72, v + 0.12 * Math.sin(u * 5));
        const cypress = u > 0.1 && u < 0.37 && v > 0.03 ? smooth(0.42, 0.2, S.base[i * 4 + 2] / 255 - 0.1) : 0;
        const m = sky * (1 - cypress);
        let fx = 0.35 * Math.sin(v * 9 + u * 3) + 0.25, fy = 0.15 * Math.cos(u * 7 - v * 4);
        for (const [cx, cy, r, s] of V) { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) / r, g = s * d * Math.exp(-d * d) * 2.2; fx += -dy / (Math.hypot(dx, dy) || 1) * g; fy += dx / (Math.hypot(dx, dy) || 1) * g; }
        FX[i] = fx * m; FY[i] = fy * m;
      }
      S.FX = FX; S.FY = FY;
      S.cyp = region(S, [0.1, -0.02, 0.38, 1.02], 0.2);
      S.stars = [[0.22, 0.07], [0.32, 0.28], [0.71, 0.15], [0.03, 0.44], [0.11, 0.48], [0.345, 0.55], [0.92, 0.12, 1.6]].map(([u, v, s]) => [...S.toGrid(u, v), (s || 1) * S.k * S.iw * 0.045, rnd(0.6, 1.4), rnd(0, TAU)]);
      S.eddy = 0;
    },
    field(S, t) {
      sway(S, S.cyp, 0.4, 0.7, t);
      const m = S.mouse; S.eddy = Math.min(1, S.eddy * 0.97 + (m.active ? m.speed / 4000 : 0));
      if (m.active && S.eddy > 0.02) {
        const R = S.H * 0.16, a = S.eddy * 1.4, x0 = Math.max(0, (m.x - R) | 0), x1 = Math.min(S.W, Math.ceil(m.x + R)), y0 = Math.max(0, (m.y - R) | 0), y1 = Math.min(S.H, Math.ceil(m.y + R));
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const dx = x - m.x, dy = y - m.y, d = Math.hypot(dx, dy) / R; if (d >= 1) continue;
          const i = y * S.W + x, g = a * Math.sin(d * Math.PI) * (1 - d);
          S.DX[i] += -dy / (d * R || 1) * g; S.DY[i] += dx / (d * R || 1) * g;
        }
      }
      S.flowSpeed = 0.045 * (1 + S.scroll * 1.2); S.flowLen = 4.5 * S.H / 300;
    },
    post(S, d, t) {
      for (const [sx, sy, r, w, ph] of S.stars) {
        const a = 0.07 * Math.sin(t * w + ph) + 0.03 * Math.sin(t * w * 2.7 + ph), x0 = Math.max(0, (sx - r) | 0), x1 = Math.min(S.W, Math.ceil(sx + r)), y0 = Math.max(0, (sy - r) | 0), y1 = Math.min(S.H, Math.ceil(sy + r));
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const dd = Math.hypot(x - sx, y - sy) / r; if (dd >= 1) continue; const j = (y * S.W + x) * 4, f = 1 + a * (1 - dd); d[j] = Math.min(255, d[j] * f); d[j + 1] = Math.min(255, d[j + 1] * f); d[j + 2] = Math.min(255, d[j + 2] * f); }
      }
    },
  };

  // ------------------------------------------------------------------ engine

  const ORDER = ['parthenon', 'sunrise', 'swing', 'laocoon', 'starry'];

  function pick() {
    const q = new URLSearchParams(location.search).get('scene');
    if (q && SCENES[q]) return q;
    let last = null; try { last = localStorage.getItem('live-scene'); } catch (e) {}
    const pool = ORDER.filter((k) => k !== last), k = pool[(Math.random() * pool.length) | 0];
    try { localStorage.setItem('live-scene', k); } catch (e) {}
    return k;
  }

  const palCache = {};
  async function palette(def) {
    const key = def.palSrc || def.plate;
    if (!palCache[key]) {
      const img = await D.loadImage(key), id = D.sample(img, 220, 160, { fit: 'contain', bg: '#000' });
      // ignore the letterbox when extracting
      const s = def.sat || 1, pts = [];
      const add = (src, rep = 1) => { for (let r = 0; r < rep; r++) for (let i = 0; i < src.length; i += 4) { if (src[i] + src[i + 1] + src[i + 2] === 0) continue; const l = 0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2]; pts.push(l + (src[i] - l) * s, l + (src[i + 1] - l) * s, l + (src[i + 2] - l) * s); } };
      add(id.data);
      if (def.palBoost) {
        // give the figure a bigger say in the palette than its area would
        const [u0, v0, u1, v1] = def.palBoost, c = document.createElement('canvas'); c.width = 120; c.height = 90;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, u0 * img.naturalWidth, v0 * img.naturalHeight, (u1 - u0) * img.naturalWidth, (v1 - v0) * img.naturalHeight, 0, 0, 120, 90);
        add(x.getImageData(0, 0, 120, 90).data, def.palBoostWeight || 2);
      }
      const n = pts.length / 3, w = Math.ceil(Math.sqrt(n * 1.4)), h = Math.ceil(n / w), id2 = new ImageData(w, h);
      for (let i = 0; i < n; i++) { id2.data[i * 4] = pts[i * 3]; id2.data[i * 4 + 1] = pts[i * 3 + 1]; id2.data[i * 4 + 2] = pts[i * 3 + 2]; id2.data[i * 4 + 3] = 255; }
      for (let i = n; i < w * h; i++) { id2.data[i * 4] = pts[0]; id2.data[i * 4 + 1] = pts[1]; id2.data[i * 4 + 2] = pts[2]; id2.data[i * 4 + 3] = 255; }
      palCache[key] = D.extract(id2, def.K || 16, 10);
    }
    return palCache[key];
  }

  function mount(canvas, opts = {}) {
    const ctl = { key: null, def: null, palette: null, ready: false };
    const sctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const out = canvas.getContext('2d');
    let S = null, lut = null, prev = null, trans = 1, t0 = performance.now(), last = 0, raf = 0, intro = 0;
    const mouse = { x: -1e3, y: -1e3, vx: 0, vy: 0, speed: 0, active: false, px: 0, py: 0, pt: 0 };
    const paper = D.hex(opts.paperColor || '#f4efe4');

    function cellSize() { return clamp(Math.round(innerWidth / 480), 2, 5); }

    async function build(key) {
      const def = SCENES[key], cell = cellSize(), vw = innerWidth, vh = opts.height ? opts.height() : innerHeight;
      const W = Math.ceil(vw / cell), H = Math.ceil(vh / cell), m = 8;
      const img = await D.loadImage(def.plate);
      const iw = img.naturalWidth, ih = img.naturalHeight, cr = def.crop || [0, 0, 1, 1];
      const cw = (cr[2] - cr[0]) * iw, ch = (cr[3] - cr[1]) * ih, portrait = vw / vh < 1;
      let ww, wh; if (W / H > cw / ch) { ww = cw; wh = cw * H / W; } else { wh = ch; ww = ch * W / H; }
      const [cu, cv] = def.center[portrait ? 'port' : 'land'];
      const wx = clamp(cu * iw - ww / 2, cr[0] * iw, cr[2] * iw - ww), wy = clamp(cv * ih - wh / 2, cr[1] * ih, cr[3] * ih - wh);
      const k = W / ww;
      const pal = await palette(def);
      // plate at grid resolution with a margin for displacement
      const pc = document.createElement('canvas'); pc.width = W + 2 * m; pc.height = H + 2 * m;
      const px = pc.getContext('2d', { willReadFrequently: true }); px.imageSmoothingQuality = 'high';
      px.drawImage(img, wx - m / k, wy - m / k, ww + 2 * m / k, wh + 2 * m / k, 0, 0, W + 2 * m, H + 2 * m);
      const plate = px.getImageData(0, 0, W + 2 * m, H + 2 * m).data;
      if (def.sat && def.sat !== 1 || def.lift) for (let i = 0; i < plate.length; i += 4) { const l = 0.3 * plate[i] + 0.59 * plate[i + 1] + 0.11 * plate[i + 2]; for (let c = 0; c < 3; c++) plate[i + c] = l + (plate[i + c] - l) * (def.sat || 1) + (def.lift || 0); }
      const base = new Uint8ClampedArray(W * H * 4);
      for (let y = 0; y < H; y++) base.set(plate.subarray(((y + m) * (W + 2 * m) + m) * 4, ((y + m) * (W + 2 * m) + m + W) * 4), y * W * 4);
      const s = {
        key, def, W, H, m, cell, iw, ih, k, win: { x: wx, y: wy, w: ww, h: wh }, plate, PW: W + 2 * m, base, palette: pal,
        DX: new Float32Array(W * H), DY: new Float32Array(W * H), mouse, scroll: 0, sprites: {},
        toGrid: (u, v) => [(u * iw - wx) * k, (v * ih - wy) * k], toUV: (x, y) => [(x / k + wx) / iw, (y / k + wy) / ih],
      };
      if (def.sprites) await Promise.all(Object.entries(def.sprites).map(async ([id, sp]) => { s.sprites[id] = Object.assign({}, sp, { img: await D.loadImage(AS + sp.src) }); }));
      def.setup && def.setup(s);
      sctx.canvas.width = W; sctx.canvas.height = H;
      canvas.width = W; canvas.height = H; canvas.style.width = W * cell + 'px'; canvas.style.height = H * cell + 'px';
      return s;
    }

    function makeLut(P) {
      const L = new Int16Array(32768).fill(-1);
      return (r, g, b) => {
        const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3); let v = L[key];
        if (v < 0) { let bd = 1e9; for (let p = 0; p < P.length; p++) { const dr = r - P[p][0], dg = g - P[p][1], db = b - P[p][2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < bd) { bd = dd; v = p; } } L[key] = v; }
        return v;
      };
    }

    // clear field: where the page wants paper (text panels, scroll dissolve)
    function field(W, H, cell) {
      const F = new Float32Array(W * H), p = clamp(opts.paperAmount ? opts.paperAmount() : 0), pin = Math.max(p, intro);
      if (pin > 0) for (let y = 0; y < H; y++) { const g = pin * 1.7 - (1 - y / H) * 0.7; if (g <= 0) continue; for (let x = 0; x < W; x++) F[y * W + x] = g; }
      const rects = opts.clear ? opts.clear() : [];
      for (const r of rects) {
        const pad = (r.pad ?? 14) / cell, fe = (r.feather ?? 30) / cell, snap = (r.snap ?? 48) / cell, str = r.strength ?? 1;
        let a = r.x / cell - pad, b = r.y / cell - pad, c = (r.x + r.w) / cell + pad, d = (r.y + r.h) / cell + pad;
        if (a < snap) a = -fe; if (b < snap) b = -fe; if (c > W - snap) c = W + fe; if (d > H - snap) d = H + fe;
        const x0 = Math.max(0, (a - fe) | 0), x1 = Math.min(W, Math.ceil(c + fe)), y0 = Math.max(0, (b - fe) | 0), y1 = Math.min(H, Math.ceil(d + fe));
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const dx = Math.max(a - x, 0, x - c), dy = Math.max(b - y, 0, y - d), v = (1 - Math.hypot(dx, dy) / fe) * str, i = y * W + x;
          if (v > F[i]) F[i] = v;
        }
      }
      return F;
    }

    function frame(now) {
      raf = 0;
      if (!S) return;
      const t = (now - t0) / 1000, dt = Math.min(0.1, (now - (last || now)) / 1000); last = now;
      const { W, H, m, PW, plate, DX, DY, def } = S;
      S.scroll = opts.scroll ? opts.scroll() : 0;
      mouse.speed *= Math.exp(-dt * 6); mouse.vx *= Math.exp(-dt * 6);
      DX.fill(0); DY.fill(0);
      def.field && def.field(S, t);
      // warp the plate
      const src = sctx.createImageData(W, H), d = src.data;
      const flow = def.flow, ph1 = flow ? (t * S.flowSpeed) % 1 : 0, ph2 = (ph1 + 0.5) % 1, bl = Math.abs(1 - 2 * ph1), L = S.flowLen || 0;
      const samp = (x, y, j) => {
        x = clamp(x, 0, PW - 1.001); y = clamp(y, 0, S.H + 2 * m - 1.001);
        const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi, i00 = (yi * PW + xi) * 4, i10 = i00 + 4, i01 = i00 + PW * 4, i11 = i01 + 4;
        for (let c = 0; c < 3; c++) j[c] = (plate[i00 + c] * (1 - fx) + plate[i10 + c] * fx) * (1 - fy) + (plate[i01 + c] * (1 - fx) + plate[i11 + c] * fx) * fy;
      };
      const A = [0, 0, 0], B = [0, 0, 0];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, o = i * 4, dx = DX[i], dy = DY[i];
        if (flow && (S.FX[i] || S.FY[i])) {
          const fx = S.FX[i] * L, fy = S.FY[i] * L;
          samp(x + m - dx - fx * (ph1 - 0.5), y + m - dy - fy * (ph1 - 0.5), A);
          samp(x + m - dx - fx * (ph2 - 0.5), y + m - dy - fy * (ph2 - 0.5), B);
          d[o] = A[0] * (1 - bl) + B[0] * bl; d[o + 1] = A[1] * (1 - bl) + B[1] * bl; d[o + 2] = A[2] * (1 - bl) + B[2] * bl;
        } else if (dx || dy) { samp(x + m - dx, y + m - dy, A); d[o] = A[0]; d[o + 1] = A[1]; d[o + 2] = A[2]; }
        else { const p = ((y + m) * PW + x + m) * 4; d[o] = plate[p]; d[o + 1] = plate[p + 1]; d[o + 2] = plate[p + 2]; }
        d[o + 3] = 255;
      }
      sctx.putImageData(src, 0, 0);
      def.draw && def.draw(S, sctx, t, dt);
      const img = sctx.getImageData(0, 0, W, H), q = img.data;
      def.post && def.post(S, q, t);
      // dither
      const P = S.palette, spread = def.spread || 28, F = field(W, H, S.cell), res = out.createImageData(W, H), r = res.data;
      const tp = trans < 1 && prev && prev.width === W && prev.height === H ? prev.data : null;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, o = i * 4, n = BN[(y & 63) * 64 + (x & 63)], th = (n - 0.5) * spread;
        if (F[i] > n * 0.98 + 0.01) { r[o] = paper[0]; r[o + 1] = paper[1]; r[o + 2] = paper[2]; r[o + 3] = 255; continue; }
        if (tp && n * 0.75 + (x / W) * 0.25 > trans) { r[o] = tp[o]; r[o + 1] = tp[o + 1]; r[o + 2] = tp[o + 2]; r[o + 3] = 255; continue; }
        const c = P[lut(clamp(q[o] + th, 0, 255) | 0, clamp(q[o + 1] + th, 0, 255) | 0, clamp(q[o + 2] + th, 0, 255) | 0)];
        r[o] = c[0]; r[o + 1] = c[1]; r[o + 2] = c[2]; r[o + 3] = 255;
      }
      out.putImageData(res, 0, 0);
      if (trans < 1) trans = Math.min(1, trans + dt / 1.3);
      if (intro > 0) intro = Math.max(0, intro - dt / 1.6);
      ctl.lastFrame = res;
      if (!D.reduced() && !document.hidden) schedule();
    }
    let lastT = 0;
    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame((now) => {
        const busy = opts.paperAmount && opts.paperAmount() >= 1 && !(opts.clear && opts.clear().length);
        const gap = busy ? 1000 / 8 : 1000 / 30;
        if (now - lastT < gap - 2) { raf = 0; schedule(); return; }
        lastT = now; frame(now);
      });
    }

    async function show(key, { fade = true } = {}) {
      const s = await build(key);
      prev = fade && ctl.lastFrame ? ctl.lastFrame : null; trans = prev ? 0 : 1;
      S = s; lut = makeLut(s.palette); ctl.key = key; ctl.def = s.def; ctl.palette = s.palette; ctl.ready = true;
      opts.onScene && opts.onScene(ctl);
      last = 0; frame(performance.now());
    }

    ctl.next = () => { const i = ORDER.indexOf(ctl.key); return show(ORDER[(i + 1) % ORDER.length]); };
    ctl.show = show;
    ctl.poke = () => schedule();
    ctl.state = () => S;

    addEventListener('pointermove', (e) => {
      if (!S) return;
      const now = performance.now(), x = e.clientX / S.cell, y = e.clientY / S.cell, dt = Math.max(0.008, (now - mouse.pt) / 1000);
      if (mouse.active) { const vx = (x - mouse.x) / dt, vy = (y - mouse.y) / dt; mouse.vx = mouse.vx * 0.6 + vx * 0.4; mouse.vy = mouse.vy * 0.6 + vy * 0.4; mouse.speed = Math.hypot(mouse.vx, mouse.vy); }
      mouse.x = x; mouse.y = y; mouse.pt = now; mouse.active = true;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { mouse.active = false; });
    addEventListener('blur', () => { mouse.active = false; });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = 0; schedule(); } });
    addEventListener('scroll', () => schedule(), { passive: true });
    let rt, lw = innerWidth;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(innerWidth - lw) > 40) { lw = innerWidth; show(ctl.key, { fade: false }); } }, 250); });

    const first = opts.scene || pick();
    intro = opts.intro === false ? 0 : 1;
    show(first, { fade: false });
    return ctl;
  }

  window.LiveScene = { mount, SCENES, ORDER, pick };
})();
