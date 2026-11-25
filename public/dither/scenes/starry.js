// A starry night over a village. The plate is van Gogh's "The Starry Night" (1889, public domain).
// The sky's brushstrokes slide a little along themselves, the stars breathe, and the name
// sits in a pool of night instead of paper.
(window.SCENES = window.SCENES || {}).starry = {
  src: (window.ART_BASE || '../img/art/') + 'starry.jpg',
  images: { sky: (window.ART_BASE || '../img/art/') + 'starry-sky.png' },
  ink: '#0d1430', paper: '#f7f0d4', sat: 1.45, midLight: 0.5, colourBlur: 55, dark: true,
  levels: { lo: 0.03, hi: 0.97, gamma: 1.05, contrast: 1.04 }, sharpen: 0.9, clarity: 0.2, grain: 0.05,
  flowAmp: 1.5, flowSpeed: 0.45, every: 6, clearTo: 0.05, clearStrength: 0.78,
  paint(P) {
    const { W, H } = P, por = P.portrait;
    const map = P.image({ focus: por ? [0.42, 0.5] : [0.55, 0.5], zoom: por ? 1 : 1.04 });
    const flow = P.layer('sky'), [, , sc] = map(0, 0);
    // the stars and the moon swell and fade, each in its own time
    const stars = [[230, 45, 42], [322, 180, 30], [112, 303, 36], [28, 285, 24], [352, 350, 58], [722, 96, 42], [950, 62, 78]];
    const glows = stars.map(([u, v, r], k) => { const [x, y] = map(u / 1024, v / 640); return { x, y, r: r * sc * 1.25, amp: 0.1, speed: 0.6 + (k % 3) * 0.25 }; });
    return { flow, glows };
  },
};
