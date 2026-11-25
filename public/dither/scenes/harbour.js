// A harbour at sunrise. The plate is Monet's "Impression, soleil levant" (1872, public domain),
// cropped toward the open water with the signature painted out. The water ripples, the
// rowing boats bob, and gulls wheel over the haze.
(window.SCENES = window.SCENES || {}).harbour = {
  src: (window.ART_BASE || '../img/art/') + 'harbour.jpg',
  images: { masks: (window.ART_BASE || '../img/art/') + 'harbour-masks.png' }, // R water, G boats, B the sun and its path
  ink: '#222b3c', paper: '#f3ecdf', sat: 1.45, every: 5, midLight: 0.55, colourBlur: 80,
  grade: { shadow: '#35577e', light: '#ffc8a0', mix: 0.16 },
  levels: { lo: 0.27, hi: 0.8, gamma: 0.95, contrast: 1.06 }, sharpen: 0.85, clarity: 0.3, grain: 0.07,
  paint(P) {
    const { W, H } = P, por = P.portrait;
    const map = P.image({ focus: por ? [0.6, 0] : [0.3, 0.45], zoom: por ? 1.6 : 1.08 });
    const water = P.layer('masks', 0), bob = P.layer('masks', 1), sun = P.layer('masks', 2);
    // the sun and its broken path on the water keep their orange in the middle ink
    const d = P.colour.getImageData(0, 0, W, H), c = d.data;
    for (let i = 0; i < W * H; i++) { const k = Math.min(0.75, sun[i] * 0.6); if (k > 0.01) { c[i * 4] += (255 - c[i * 4]) * k; c[i * 4 + 1] += (98 - c[i * 4 + 1]) * k; c[i * 4 + 2] += (44 - c[i * 4 + 2]) * k; } }
    P.colour.putImageData(d, 0, 0);
    // gulls over the haze, right of the sun
    const [sx, sy] = map(976 / 1600, 384 / 1245), hx = Math.min(0.8, sx / W + 0.12), hy = Math.max(0.1, sy / H - 0.14), wide = por ? 0.6 : 1;
    const birds = [
      { hx, hy, rx: 0.13 * wide, ry: 0.05, spin: 0.11 },
      { hx: hx - 0.06, hy: hy + 0.05, rx: 0.18 * wide, ry: 0.04, spin: -0.09 },
    ];
    return { water, bob, birds };
  },
};
