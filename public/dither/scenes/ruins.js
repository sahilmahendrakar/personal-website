// Overgrown ruins at dusk. The plate is Thomas Cole's "Desolation" (1836, public domain),
// mirrored, cropped in on the ruins and softened into brush patches, so it reads as a
// place in that painting's world rather than the painting itself. New ivy grows over it.
(window.SCENES = window.SCENES || {}).ruins = {
  src: (window.ART_BASE || '../img/art/') + 'desolation.jpg',
  images: { water: (window.ART_BASE || '../img/art/') + 'desolation-water.png' }, // the lake and its reflections, traced from the plate
  ink: '#1e2230', paper: '#f4eddc', leaf: '#717a5c', leafMix: 1.1, leafDesat: 0.45, sat: 1.85, midLight: 0.56,
  grade: { shadow: '#2f6f7a', light: '#ffb98a', mix: 0.36, sky: '#7d9be0', skyMix: 0.7, skyTo: 0.55 }, ivyTone: 0.27, ivyStart: 0.3, ivySeconds: 160, sway: 0.5, sharpen: 1.05, clarity: 0.4, grain: 0.06,
  levels: { lo: 0.02, hi: 0.96, gamma: 0.74, contrast: 1.14 },
  paint(P) {
    const { W, H, R } = P, por = P.portrait;
    const map = P.image({ focus: por ? [0.37, 0.5] : [0.5, 0.42], zoom: por ? 1 : 1.12, mirror: true });
    const px = (u, v) => map(u, v), [, , sc] = map(0, 0), iw = 2000, ih = 1244, du = (d) => d * iw * sc, dv = (d) => d * ih * sc;
    const ivy = [];
    // the great column: fresh shoots climb from the old ivy toward the capital
    const [cx0, ] = px(0.272, 0.5), [, top] = px(0.272, 0.19);
    for (let k = 0; k < 6; k++) { const [, y] = px(0.272, 0.5 + R() * 0.14); ivy.push({ x: cx0 + (R() - 0.5) * du(0.05), y, len: (y - top) * (0.6 + R() * 0.5) / 1.3, hug: [cx0, du(0.026), R() * 6], top, t0: R() * 0.35 }); }
    // the colonnade behind, and the two arches
    for (let k = 0; k < 9; k++) { const [x, y] = px(0.09 + R() * 0.35, 0.6); ivy.push({ x, y, len: dv(0.05 + R() * 0.05) / 1.3, t0: R() * 0.5 }); }
    for (let k = 0; k < 5; k++) { const [x, y] = px(0.06 + R() * 0.14, 0.76); ivy.push({ x, y, len: dv(0.06 + R() * 0.06) / 1.3, t0: R() * 0.5 }); }
    for (let k = 0; k < 3; k++) { const [x, y] = px(0.73 + R() * 0.07, 0.72); ivy.push({ x, y, len: dv(0.05 + R() * 0.04) / 1.3, t0: R() * 0.5 }); }
    // only the lake and the reflections under the arches move
    const water = P.layer('water');
    // swallows around the nest on the capital
    const [bx, by] = px(0.27, 0.07);
    const hx = bx / W, hy = Math.max(0.08, by / H), wide = por ? 0.6 : 1;
    const birds = [
      { hx: hx - 0.02, hy: hy + 0.02, rx: 0.15 * wide, ry: 0.06, spin: 0.17 },
      { hx: hx - 0.08, hy: hy + 0.08, rx: 0.2 * wide, ry: 0.05, spin: -0.13 },
      { hx: hx + 0.03, hy: hy + 0.04, rx: 0.11 * wide, ry: 0.08, spin: 0.21 },
    ];
    return { ivy, water, birds };
  },
};
