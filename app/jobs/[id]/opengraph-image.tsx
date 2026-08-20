import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

/**
 * Per-job social card.
 *
 * Every job page used to inherit the site-wide openGraph block from the root
 * layout, so a channel full of job links unfurled into identical 60 kB "Design
 * Better Careers" cards — no title, no company, no way to tell one from
 * another. This renders the role instead, with the employer's logo.
 *
 * Next's file convention wires the result into og:image / twitter:image for
 * this route automatically.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Design role at Design Better Careers";

const BG = "#F5F2EC";
const INK = "#0A0A0A";
const ACCENT = "#FF4725";
const MUTED = "rgba(10,10,10,0.55)";

const LOGO_TILES = [
  "#F2EDE4", "#A8D3EB", "#C7C3E7", "#F1B7C5",
  "#E7C451", "#8DD8C3", "#D3E749", "#E7833A",
];

/** Same hash the job cards use, so a company's tint matches across surfaces. */
function tileFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return LOGO_TILES[Math.abs(h) % LOGO_TILES.length];
}

async function loadFont(file: string): Promise<ArrayBuffer | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";
  try {
    const res = await fetch(`${base}/fonts/F37Lineca/${file}`, {
      // Fonts are immutable; let the platform cache them between renders.
      next: { revalidate: 86400 },
    });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/**
 * Satori renders raster images from data URIs reliably. Roughly half our logos
 * are SVG, which it handles far less predictably, so those fall back to a
 * lettermark rather than risking an empty box on the card.
 */
async function loadLogo(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!/image\/(png|jpe?g|webp)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 200) return null;
    return `data:${type.split(";")[0]};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Renders text with the brand's trailing accent period.
 *
 * Satori requires an explicit `display` on any element with more than one
 * child, and mixing a wrapping text node with a sibling span puts the period
 * after the whole block rather than after the last word. Emitting one flex item
 * per word keeps the period attached to the final word and lets long titles
 * wrap normally.
 */
function AccentedText({ text, size, color }: { text: string; size: number; color: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", maxWidth: 1040 }}>
      {words.map((word, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            fontSize: size,
            fontWeight: 700,
            color,
            lineHeight: 1.1,
            marginRight: size * 0.24,
          }}
        >
          {word}
          {i === words.length - 1 ? <span style={{ color: ACCENT }}>.</span> : null}
        </div>
      ))}
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await db.job.findUnique({
    where: { id },
    select: {
      title: true, company: true, location: true, role: true, typeOfRole: true,
      remote: true, compensation: true, experienceLevel: true, companyLogoUrl: true,
    },
  });

  const [bold, regular] = await Promise.all([
    loadFont("F37LinecaTest-Bold.otf"),
    loadFont("F37LinecaTest-Regular.otf"),
  ]);
  const fonts = [
    ...(bold ? [{ name: "Lineca", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(regular ? [{ name: "Lineca", data: regular, weight: 400 as const, style: "normal" as const }] : []),
  ];
  const font = fonts.length ? "Lineca" : "sans-serif";

  if (!job) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BG, fontFamily: font }}>
          <AccentedText text="Design Better Careers" size={64} color={INK} />
        </div>
      ),
      { ...size, fonts: fonts.length ? fonts : undefined },
    );
  }

  const logo = await loadLogo(job.companyLogoUrl);
  const tile = tileFor(job.company);
  const initial = job.company.trim()[0]?.toUpperCase() ?? "?";

  // Long titles need to step down a size or they overflow the card.
  const titleSize = job.title.length > 64 ? 52 : job.title.length > 40 ? 62 : 74;

  const chips = [
    job.role,
    job.typeOfRole,
    job.remote ? "Remote OK" : null,
    job.compensation,
  ].filter(Boolean) as string[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", background: BG, fontFamily: font,
          padding: "64px 72px", position: "relative",
        }}
      >
        {/* accent rule */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 12, background: ACCENT, display: "flex" }} />

        {/* header: logo + employer */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 132, height: 132, borderRadius: 20, background: logo ? "#FFFFFF" : tile,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginRight: 32, overflow: "hidden",
              border: "1px solid rgba(10,10,10,0.08)",
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} width={104} height={104} style={{ objectFit: "contain" }} alt="" />
            ) : (
              <div style={{ fontSize: 68, fontWeight: 700, color: "rgba(10,10,10,0.28)", display: "flex" }}>{initial}</div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: INK, display: "flex" }}>{job.company}</div>
            <div style={{ fontSize: 26, color: MUTED, marginTop: 6, display: "flex" }}>{job.location}</div>
          </div>
        </div>

        {/* the role */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
          <AccentedText text={job.title} size={titleSize} color={INK} />

          <div style={{ display: "flex", marginTop: 28 }}>
            {chips.slice(0, 4).map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex", fontSize: 22, color: INK, marginRight: 12,
                  padding: "10px 20px", borderRadius: 999,
                  border: "1px solid rgba(10,10,10,0.18)",
                  background: i === 0 ? ACCENT : "transparent",
                  ...(i === 0 ? { color: "#FFFFFF", border: "1px solid " + ACCENT } : {}),
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <AccentedText text="Design Better Careers" size={26} color={INK} />
          <div style={{ fontSize: 22, color: MUTED, display: "flex" }}>{job.experienceLevel}</div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
