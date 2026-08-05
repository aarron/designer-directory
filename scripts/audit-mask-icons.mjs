/**
 * Finds stored logos that are Safari pinned-tab "mask-icon" artwork. Those are
 * monochrome silhouettes meant to be masked with a colour by the browser; used
 * standalone they render as a solid block or as nothing at all.
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const jobs = await db.job.findMany({
  where: { active: true, companyLogoUrl: { not: null } },
  select: { company: true, companyLogoUrl: true },
});

const uniq = new Map();
for (const j of jobs) if (!uniq.has(j.companyLogoUrl)) uniq.set(j.companyLogoUrl, j.company);

const bad = [];
await Promise.all([...uniq.entries()].map(async ([url, company]) => {
  if (!/\.svg($|\?)/i.test(url)) return;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) return;
    const svg = await r.text();
    const reasons = [];
    // Signature of Safari pinned-tab exports.
    if (/baseProfile=["']tiny-ps["']/i.test(svg)) reasons.push("tiny-ps");
    // Root fill:none with no per-path fill = nothing visible renders.
    const root = svg.slice(0, svg.indexOf(">") + 1);
    const hasRootFillNone = /fill=["']none["']/i.test(root);
    const anyPathFill = /<(path|g|circle|rect|polygon)[^>]*\bfill=["'](?!none)[^"']+["']/i.test(svg);
    if (hasRootFillNone && !anyPathFill) reasons.push("fill:none, no path fills");
    // A single full-bleed opaque rect and nothing else visible.
    if (/<path[^>]*d=["']M0 0h(\d+)v\1H0z["']/i.test(svg) && !/<path[^>]*fill=["'](?!#000)/i.test(svg)) {
      reasons.push("solid full-bleed block");
    }
    if (reasons.length) bad.push({ company, url, reasons, bytes: svg.length });
  } catch {}
}));

console.log(`\nChecked ${[...uniq.keys()].filter((u) => /\.svg/i.test(u)).length} stored SVG logos`);
console.log(`Suspect (mask-icon style): ${bad.length}\n`);
for (const b of bad.sort((a, c) => a.company.localeCompare(c.company))) {
  console.log(`  ${b.company.padEnd(24)} ${b.reasons.join(", ")}`);
}
console.log(`\nCompanies: ${JSON.stringify(bad.map((b) => b.company))}`);
await db.$disconnect();
