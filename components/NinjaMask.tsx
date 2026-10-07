// Pixel-art ninja outfit drawn over the profile picture (easter egg).
// Drawn on a 32x32 grid that lines up with the 1024x1024 profile image.

type Pixel = { x: number; y: number; fill: string; clip?: boolean };

const CELL = 32;
const CLOTH = '#25253a';
const CLOTH_DARK = '#17172a';
const CLOTH_LIGHT = '#34344f';
const BAND = '#c0392b';
const BAND_DARK = '#8e2a20';

// The avatar is a circle centered in the image; the gi is clipped to it.
const CIRCLE_CENTER = 512;
const CIRCLE_RADIUS = 438;

// Rows of [start, end] column spans (inclusive) covered by the hood and mask.
const HOOD_ROWS: Record<number, [number, number][]> = {
  3: [[13, 18]],
  4: [[11, 20]],
  5: [[9, 22]],
  6: [[8, 23]],
  7: [[8, 24]],
  8: [[8, 24]],
  9: [[8, 24]],
  10: [[8, 24]],
  11: [[8, 24]],
  13: [[8, 24]],
  // Eye slit
  14: [[8, 10], [21, 24]],
  15: [[8, 10], [21, 24]],
  16: [[8, 10], [21, 24]],
  17: [[8, 24]],
  18: [[8, 23]],
  19: [[8, 23]],
  20: [[9, 22]],
  21: [[9, 22]],
  22: [[10, 21]],
  23: [[11, 20]],
  24: [[12, 19]],
};

// Headband knot and tails trailing off to the right.
const BAND_EXTRAS: [number, number][] = [
  [25, 11], [25, 12], [25, 13],
  [26, 11], [26, 10], [27, 10], [27, 9], [28, 9],
  [26, 13], [26, 14], [27, 14], [27, 15], [28, 15],
];

function buildPixels(): Pixel[] {
  const pixels = new Map<string, Pixel>();
  const put = (x: number, y: number, fill: string, clip = false) =>
    pixels.set(`${x}-${y}`, { x, y, fill, clip });

  // Gi covering the shoulders and torso, with a wrapped collar.
  for (let y = 23; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (y === 23 && x > 9 && x < 22) continue;
      const collar = y > 24 && (x === y - 13 || x === 44 - y);
      put(x, y, collar ? CLOTH_LIGHT : y === 23 ? CLOTH_DARK : CLOTH, true);
    }
  }

  for (const [row, spans] of Object.entries(HOOD_ROWS)) {
    const y = Number(row);
    for (const [start, end] of spans) {
      for (let x = start; x <= end; x++) {
        let fill = CLOTH;
        if (x === start || x === end || y === 13 || y === 24) fill = CLOTH_DARK;
        else if (y <= 5 || (y === 6 && x > 10 && x < 15)) fill = CLOTH_LIGHT;
        put(x, y, fill);
      }
    }
  }

  for (let x = 8; x <= 24; x++) {
    put(x, 12, x % 4 === 0 ? BAND_DARK : BAND);
  }
  for (const [x, y] of BAND_EXTRAS) {
    put(x, y, y === 12 ? BAND_DARK : BAND);
  }

  return [...pixels.values()];
}

const PIXELS = buildPixels();

export function NinjaMask() {
  return (
    <svg
      viewBox="0 0 1024 1024"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full pointer-events-none"
    >
      <defs>
        <clipPath id="ninja-avatar-circle">
          <circle cx={CIRCLE_CENTER} cy={CIRCLE_CENTER} r={CIRCLE_RADIUS} />
        </clipPath>
      </defs>
      {PIXELS.map(({ x, y, fill, clip }) => (
        <rect
          key={`${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={fill}
          clipPath={clip ? 'url(#ninja-avatar-circle)' : undefined}
        />
      ))}
    </svg>
  );
}
