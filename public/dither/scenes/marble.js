// A marble group in a dim gallery. The plate is a photograph of the Laocoön group (Vatican
// Museums, public domain), set into a darkened room with window light from the right.
// The light leans toward your cursor, and dust turns slowly in the beam.
(window.SCENES = window.SCENES || {}).marble = {
  src: (window.ART_BASE || '../img/art/') + 'laocoon.jpg',
  ink: '#17151b', paper: '#f2eadb', sat: 1.35, midLight: 0.5, colourBlur: 30, dark: true,
  grade: { shadow: '#2c3b58', light: '#ffd6a6', mix: 0.32 },
  levels: { lo: 0.16, hi: 0.93, gamma: 1.12, contrast: 1.08 }, sharpen: 0.85, clarity: 0.35, grain: 0.05,
  clearTo: 0.05, clearStrength: 0.7, lightAmp: 0.75, every: 4,
  paint(P) {
    const { W, H, R } = P, por = P.portrait;
    // the gallery wall, in the photograph's own browns, so the group sits in the room
    for (const c of [P.back, P.colour]) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3a2c20'); g.addColorStop(0.55, '#5b524a'); g.addColorStop(1, '#45403c'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    // on wide screens the group stands right of the name, never under it
    const z = 0.7, dw = 1503 / 1600 * H * z, at = Math.min(0.85, (0.6 * W + dw / 2) / W);
    const map = P.image(por
      ? { fit: 'height', zoom: 0.6, at: 0.5, focus: [0.5, 1], feather: [0.05, 0.05, 0.03, 0.14] }
      : { fit: 'height', zoom: z, at, focus: [0.5, 0.25], feather: [0.1, 0.07, 0.04, 0.1] });
    // a shaft of window light from the upper right, falling across the group onto the wall
    const sh = { x0: W * (por ? 1.05 : 0.98), y0: -H * 0.1, a: por ? 2.2 : 2.35, w: (por ? 0.55 : 0.32) * W };
    for (const c of [P.back, P.colour]) {
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(sh.x0, sh.y0); c.rotate(sh.a);
      const g = c.createLinearGradient(0, -sh.w / 2, 0, sh.w / 2); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(70,58,42,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, -sh.w / 2, Math.hypot(W, H) * 1.3, sh.w); c.restore();
    }
    // the marble is relit by the moving light; the wall is not
    const d = P.back.getImageData(0, 0, W, H).data, relight = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) { const l = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255, k = Math.max(0, Math.min(1, (l - 0.42) / 0.25)); relight[i] = k * k * (3 - 2 * k) * 0.09; }
    const keepClear = relight.map((v) => Math.min(1, v / 0.09));
    // dust motes turning slowly in the beam
    const ca = Math.cos(sh.a), sa = Math.sin(sh.a);
    const motes = Array.from({ length: Math.round(W * H / 16000) + 10 }, () => ({ s: R() * Math.hypot(W, H), o: (R() - 0.5) * sh.w * 0.8, ph: R() * 6.28, v: 2 + R() * 4, b: R() }));
    const draw = (o, t, dt) => {
      const z = Math.max(1, Math.round(W / 1100));
      o.fillStyle = '#f2eadb';
      for (const m of motes) {
        m.s -= m.v * dt; m.o += Math.sin(t * 0.4 + m.ph) * 3 * dt; if (m.s < 0) m.s += Math.hypot(W, H);
        const x = sh.x0 + ca * m.s - sa * m.o, y = sh.y0 + sa * m.s + ca * m.o;
        if (x < 0 || y < 0 || x > W || y > H * 0.9) continue;
        o.globalAlpha = (0.35 + 0.65 * m.b) * (0.6 + 0.4 * Math.sin(t * 0.7 + m.ph)) * (1 - Math.abs(m.o) / (sh.w * 0.45));
        o.fillRect(Math.round(x), Math.round(y), m.b > 0.8 ? 2 * z : z, m.b > 0.8 ? 2 * z : z);
      }
      o.globalAlpha = 1;
    };
    return { relight, draw, keepClear };
  },
};
