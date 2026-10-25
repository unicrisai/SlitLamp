// Pixel-art eye with a slit-lamp beam across the cornea, generated at build
// time as an SVG grid of 1×1 cells.

const W = 30;
const H = 20;
const CX = 14.5;
const CY = 10.5;

// Almond shape: the overlap of two circles, half-width 13 and half-height 7.
const HALF_W = 13;
const HALF_H = 7;
const D = (HALF_W * HALF_W - HALF_H * HALF_H) / (2 * HALF_H);
const R = D + HALF_H;

const COLORS = {
  outline: "#13232b",
  sclera: "#ffffff",
  scleraShade: "#e4ecee",
  irisDark: "#0a4f52",
  iris: "#0e6e72",
  irisLight: "#3fa3a0",
  pupil: "#0b1a20",
  highlight: "#ffffff",
  beam: "#ffe9a8",
} as const;

type Color = keyof typeof COLORS;

function insideEye(x: number, y: number): boolean {
  const dx = x - CX;
  const dy = y - CY;
  return dx * dx + (dy - D) ** 2 <= R * R && dx * dx + (dy + D) ** 2 <= R * R;
}

const NEIGHBOURS = [-1, 0, 1].flatMap((ox) => [-1, 0, 1].map((oy) => [ox, oy] as const));

function cellColor(x: number, y: number): Color | null {
  if (!insideEye(x, y)) return null;
  // 8-neighbour edge gives an unbroken outline; the upper lid is two cells thick.
  if (NEIGHBOURS.some(([ox, oy]) => !insideEye(x + ox, y + oy))) return "outline";
  if (y < CY && !insideEye(x, y - 2)) return "outline";

  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.hypot(dx, dy);

  if ((x === 12 || x === 13) && (y === 7 || y === 8)) return "highlight";
  if (dist <= 2.4) return "pupil";
  if (dist <= 5.2) {
    if (dist > 4.4 || dy < -3) return "irisDark";
    if (dy > 1.5) return "irisLight";
    return "iris";
  }
  return Math.abs(dx) > 10 ? "scleraShade" : "sclera";
}

// One lash cell above the upper lid at a few columns, slanting outwards.
const LASHES: [number, number][] = [5, 9, 14, 15, 20, 24].map((x) => {
  let top = 0;
  while (top < H && !insideEye(x, top)) top++;
  const dir = x < CX - 1 ? -1 : x > CX + 1 ? 1 : 0;
  return [x + dir, top - 1];
});

// Slit beam: a thin vertical band of light across the cornea, with a fainter
// parallel band for the optical section.
const BEAM: Record<number, number> = { 17: 0.85, 18: 0.3 };

export function PixelEye({ className }: { className?: string }) {
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = cellColor(x, y);
      if (!c) continue;
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[c]} />);
      const beam = BEAM[x];
      if (beam && c !== "outline")
        cells.push(<rect key={`b${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS.beam} opacity={beam} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Pixel-art eye with a slit-lamp light beam"
    >
      {cells}
      {LASHES.map(([x, y]) => (
        <rect key={`l${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS.outline} />
      ))}
    </svg>
  );
}
