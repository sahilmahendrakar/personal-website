// Overgrown ruins at dusk. The plate is Thomas Cole's "Desolation" (1836, public domain),
// mirrored, cropped in on the ruins and softened into brush patches, so it reads as a
// place in that painting's world rather than the painting itself. New ivy grows over it.
(window.SCENES = window.SCENES || {}).ruins = {
  src: (window.ART_BASE || '../img/art/') + 'desolation.jpg',
  ink: '#1e2230', paper: '#f4eddc', leaf: '#6c8752', sat: 1.85, midLight: 0.56,
  grade: { shadow: '#2f6f7a', light: '#ffb98a', mix: 0.36, sky: '#7d9be0', skyMix: 0.7, skyTo: 0.55 }, ivyTone: 0.22, ivyStart: 0.3, ivySeconds: 160, sway: 0.5, sharpen: 0.9, grain: 0.06,
  levels: { lo: 0.02, hi: 0.96, gamma: 0.74, contrast: 1.14 },
  paint(P) {
    const { W, H, R } = P, por = P.portrait;
    const map = P.image({ focus: por ? [0.4, 0.5] : [0.36, 0.42], zoom: por ? 1 : 1.12, mirror: true });
    const px = (u, v) => map(u, v), [, , sc] = map(0, 0), iw = 2000, ih = 1244, du = (d) => d * iw * sc, dv = (d) => d * ih * sc;
    const ivy = [];
    // the great column: fresh shoots climb from the old ivy toward the capital
    const [cx0, ] = px(0.272, 0.5), [, top] = px(0.272, 0.19);
    for (let k = 0; k < 6; k++) { const [, y] = px(0.272, 0.5 + R() * 0.14); ivy.push({ x: cx0 + (R() - 0.5) * du(0.05), y, len: (y - top) * (0.6 + R() * 0.5) / 1.3, hug: [cx0, du(0.026), R() * 6], top, t0: R() * 0.35 }); }
    // the colonnade behind, and the two arches
    for (let k = 0; k < 9; k++) { const [x, y] = px(0.09 + R() * 0.35, 0.6); ivy.push({ x, y, len: dv(0.05 + R() * 0.05) / 1.3, t0: R() * 0.5 }); }
    for (let k = 0; k < 5; k++) { const [x, y] = px(0.06 + R() * 0.14, 0.76); ivy.push({ x, y, len: dv(0.06 + R() * 0.06) / 1.3, t0: R() * 0.5 }); }
    for (let k = 0; k < 3; k++) { const [x, y] = px(0.73 + R() * 0.07, 0.72); ivy.push({ x, y, len: dv(0.05 + R() * 0.04) / 1.3, t0: R() * 0.5 }); }
    // the lake glints a little
    const [lx0, ly0] = px(0.76, 0.6), [lx1, ly1] = px(0.36, 0.9), xa = Math.min(lx0, lx1), xb = Math.max(lx0, lx1);
    const soft = (v, a, b, e) => Math.max(0, Math.min(1, (v - a) / e, (b - v) / e));
    const water = (x, y) => soft(x, xa, xb, 10) * soft(y, ly0, ly1, 6);
    // swallows around the nest on the capital
    const [bx, by] = px(0.27, 0.07);
    const birds = [{ hx: bx / W, hy: by / H, rx: 0.05, ry: 0.04, spin: 0.3 }, { hx: bx / W - 0.04, hy: by / H + 0.05, rx: 0.06, ry: 0.03, spin: -0.24 }, { hx: bx / W - 0.12, hy: by / H + 0.02, rx: 0.05, ry: 0.03, spin: 0.2 }];
    return { ivy, water, birds };
  },
};
