// A rococo garden at the end of the afternoon. The plate is Fragonard's "The Swing" (1767,
// public domain), mirrored, with the figures and the ropes painted out: what is left is
// the garden, with an empty swing hanging from the old branch, still moving a little.
(window.SCENES = window.SCENES || {}).garden = {
  src: (window.ART_BASE || '../img/art/') + 'garden.jpg',
  ink: '#15201d', paper: '#f6efe1', sat: 1.85, midLight: 0.5, colourBlur: 40, dark: true,
  grade: { shadow: '#1b5d5a', light: '#ffc7a2', mix: 0.36 },
  levels: { lo: 0.08, hi: 0.7, gamma: 0.8, contrast: 1.05 }, sharpen: 0.9, clarity: 0.3, grain: 0.06,
  clearTo: 0.07, clearStrength: 0.75,
  paint(P) {
    const { W, H, R } = P, por = P.portrait;
    const map = P.image({ focus: por ? [0.36, 0.33] : [0.5, 0.35], zoom: por ? 2 : 1.02, mirror: true });
    const [, , sc] = map(0, 0), px = (x, y) => map(x / 1274, y / 1600);
    // the empty swing hangs from the old branch, two ropes and a seat
    const [ax, ay] = px(435, 556), L = 262 * sc, sw = 96 * sc, hw = sw * 0.44;
    const sw0 = { th: 0.04, om: 0, last: null };
    const dyn = {
      box: [ax - L * 0.35 - sw, ay - 6, ax + L * 0.35 + sw, ay + L + 26 * sc],
      draw(x, t, env) {
        // a damped pendulum, kept going by a faint breeze; the cursor gives it a small push
        const dt = sw0.last == null ? 0 : Math.min(0.1, t - sw0.last); sw0.last = t;
        const g = 1.55 * 1.55, sx = ax + Math.sin(sw0.th) * L, sy = ay + Math.cos(sw0.th) * L;
        let acc = -g * Math.sin(sw0.th) - 0.18 * sw0.om + 0.16 * Math.sin(t * 1.55);
        const p = env.pointer, d = Math.hypot(p.x - sx, p.y - sy);
        if (d < 70 * sc + 30 && p.energy > 0.05) acc += Math.sign(sx - p.x || 1) * 0.9 * p.energy;
        sw0.om += acc * dt; sw0.th = Math.max(-0.3, Math.min(0.3, sw0.th + sw0.om * dt));
        const th = sw0.th, cx = ax + Math.sin(th) * L, cy = ay + Math.cos(th) * L, ux = Math.cos(th), uy = -Math.sin(th);
        const l = [cx - ux * sw / 2, cy - uy * sw / 2], r = [cx + ux * sw / 2, cy + uy * sw / 2];
        x.lineCap = 'round'; x.strokeStyle = 'rgb(78,78,78)'; x.lineWidth = Math.max(1.2, 2 * sc);
        x.beginPath(); x.moveTo(ax - hw, ay); x.lineTo(l[0], l[1]); x.moveTo(ax + hw, ay); x.lineTo(r[0], r[1]); x.stroke();
        // the seat: a dark plank with a soft cushion on it
        x.save(); x.translate(cx, cy); x.rotate(-th);
        x.fillStyle = 'rgb(40,40,40)'; x.fillRect(-sw / 2 - 2 * sc, -2 * sc, sw + 4 * sc, 7 * sc);
        x.fillStyle = 'rgb(150,150,150)'; x.beginPath(); x.ellipse(0, -4 * sc, sw * 0.42, 5 * sc, 0, Math.PI, 0); x.fill();
        x.restore();
      },
    };
    // petals drift down out of the canopy
    const petals = Array.from({ length: Math.round(W * H / 26000) + 8 }, () => ({ x: R() * W, y: R() * H * 0.9, v: 8 + R() * 10, ph: R() * 6.28, k: R() < 0.5 }));
    const draw = (o, t, dt, env) => {
      const z = Math.max(1, Math.round(W / 900));
      for (const p of petals) {
        if (!env.reduced) { p.y += p.v * dt * (W / 1440 + 0.5); p.x += Math.sin(t * 0.9 + p.ph) * 9 * dt + 4 * dt; }
        if (p.y > H * (0.86 - env.scrollP * 0.5) || p.x > W + 4) { p.y = -4; p.x = R() * W * 1.1 - W * 0.1; }
        o.fillStyle = p.k ? '#f2c9c1' : '#f6efe1';
        const flip = Math.sin(t * 2.2 + p.ph) > 0;
        o.fillRect(Math.round(p.x), Math.round(p.y), flip ? 2 * z : z, flip ? z : 2 * z);
      }
    };
    // a pair of small birds in the clearing
    const [bx, by] = px(330, 760);
    const birds = [{ hx: bx / W, hy: by / H, rx: 0.07, ry: 0.05, spin: 0.32 }, { hx: bx / W + 0.03, hy: by / H - 0.04, rx: 0.05, ry: 0.04, spin: -0.27 }];
    return { dyn, draw, birds };
  },
};
