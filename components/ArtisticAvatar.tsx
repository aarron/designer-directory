// Design Better ArtisticAvatar — v3
// Zone-split compositions: solid fill areas divided by large sweeping arcs.
// Thin strokes (SW=4 on 200px viewBox ≈ 2%). No crosshair patterns.
// Three-color palettes: [background, accent-zone, ink] from brand swatches.

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// [background, accent-zone, ink] — all from brand swatch palette
const PALETTES: [string, string, string][] = [
  ["#E84B2E", "#F1B7C5", "#F2EDE4"],  // vermillion / blush / cream
  ["#5D1E49", "#A8D3EB", "#C9912A"],  // plum / sky / gold
  ["#F2EDE4", "#A8D3EB", "#3A7C8B"],  // cream / sky / teal
  ["#1A1A1A", "#3A7C8B", "#8DD8C3"],  // black / teal / mint
  ["#E7C451", "#E84B2E", "#1C4D3E"],  // gold / vermillion / forest
  ["#C7C3E7", "#5D1E49", "#C72058"],  // lavender / plum / crimson
  ["#1C4D3E", "#F2EDE4", "#E7C451"],  // forest / cream / gold
  ["#A8D3EB", "#F2EDE4", "#1C4D3E"],  // sky / cream / forest
  ["#1A1A1A", "#C9912A", "#F2EDE4"],  // black / gold / cream
  ["#F2EDE4", "#F1B7C5", "#C72058"],  // cream / blush / crimson
  ["#2C6A39", "#E7C451", "#F2EDE4"],  // forest / gold / cream
  ["#E7833A", "#F2EDE4", "#1A1A1A"],  // orange / cream / black
  ["#D3E749", "#F2EDE4", "#1A1A1A"],  // lime / cream / black
  ["#C72058", "#F2EDE4", "#1A1A1A"],  // crimson / cream / black
  ["#A87730", "#F2EDE4", "#1C4D3E"],  // ochre / cream / forest
  ["#3A7C8B", "#F2EDE4", "#1A1A1A"],  // teal / cream / black
];

const SZ = 200;
const C  = 100;
const SW = 4; // thin stroke — ≈2% of viewBox

type CompositionProps = { n: number; zone: string; ink: string };

function Composition({ n, zone, ink }: CompositionProps) {
  const s = {
    stroke: ink,
    strokeWidth: SW,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  switch (n) {
    // 0: Vertical zone split + large sweeping arc from bottom-left to top-right
    case 0:
      return (
        <>
          <rect x={118} y={0} width={82} height={SZ} fill={zone} />
          <path d={`M0,${SZ} A185,185 0 0 1 ${SZ},15`} {...s} />
        </>
      );

    // 1: Horizontal zone split (bottom strip) + large arc from upper-left to bottom-right
    case 1:
      return (
        <>
          <rect x={0} y={115} width={SZ} height={85} fill={zone} />
          <path d={`M0,50 A185,185 0 0 1 ${SZ},${SZ}`} {...s} />
        </>
      );

    // 2: Three concentric arcs radiating from top-left corner
    case 2:
      return (
        <>
          <path d={`M${SZ-10},0 A${SZ-10},${SZ-10} 0 0 1 0,${SZ-10}`} {...s} />
          <path d={`M${C+15},0  A${C+15},${C+15}   0 0 1 0,${C+15}`}   {...s} />
          <path d={`M48,0       A48,48               0 0 1 0,48`}        {...s} />
        </>
      );

    // 3: Top-left corner accent zone + large concave arc + zone border lines
    case 3:
      return (
        <>
          <rect x={0} y={0} width={92} height={92} fill={zone} />
          <line x1={92} y1={0}  x2={92} y2={92}  {...s} />
          <line x1={0}  y1={92} x2={92} y2={92}  {...s} />
          <path d={`M${SZ},0 A${SZ},${SZ} 0 0 1 0,${SZ}`} {...s} />
        </>
      );

    // 4: Large outer convex arc from bottom-left to top-right + horizontal line in lower third
    case 4:
      return (
        <>
          <path d={`M18,${SZ} A188,188 0 0 1 ${SZ},18`} {...s} />
          <line x1={0} y1={138} x2={SZ} y2={138} {...s} />
        </>
      );

    // 5: Horizontal zone split (top half) + S-curve arcs marking the boundary
    case 5:
      return (
        <>
          <rect x={0} y={0} width={SZ} height={C} fill={zone} />
          <path d={`M${C},0 A${C},${C} 0 0 1 ${SZ},${C}`} {...s} />
          <path d={`M0,${C} A${C},${C} 0 0 1 ${C},${SZ}`} {...s} />
        </>
      );

    default:
      return (
        <path
          d={`M0,${SZ} A185,185 0 0 1 ${SZ},15`}
          stroke={ink}
          strokeWidth={SW}
          strokeLinecap="round"
          fill="none"
        />
      );
  }
}

export function ArtisticAvatar({
  seed,
  size = 56,
  rounded = "full",
  className = "",
}: {
  seed: string;
  size?: number;
  rounded?: "full" | "xl" | "lg" | "none";
  className?: string;
}) {
  const h = hash(seed);
  const [bg, zone, ink] = PALETTES[h % PALETTES.length];
  const tpl = (h >> 4) % 6; // different bits than palette selection

  const clipR =
    rounded === "none" ? 0
    : rounded === "full" ? SZ / 2
    : rounded === "xl"   ? SZ * 0.12
    :                      SZ * 0.08;

  const clipId = `ac-${seed.replace(/\W/g, "").slice(0, 16)}`;
  const hasCssDimensions = /\bw-|\bh-/.test(className);

  return (
    <svg
      viewBox={`0 0 ${SZ} ${SZ}`}
      {...(!hasCssDimensions ? { width: size, height: size } : {})}
      className={`flex-shrink-0 ${className}`}
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={SZ} height={SZ} rx={clipR} ry={clipR} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {/* Primary background */}
        <rect x={0} y={0} width={SZ} height={SZ} fill={bg} />
        {/* Zone fills + arc strokes */}
        <Composition n={tpl} zone={zone} ink={ink} />
      </g>
    </svg>
  );
}
