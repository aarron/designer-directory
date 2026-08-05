import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function imageMeta(buf) {
  const b = new Uint8Array(buf);
  const head = new TextDecoder("utf-8", { fatal: false }).decode(b.slice(0, 600));
  if (/<svg[\s>]/i.test(head)) return { type: "svg", w: Infinity, h: Infinity };
  const dv = new DataView(buf);
  if (b[0] === 0x89 && b[1] === 0x50) return { type: "png", w: dv.getUint32(16), h: dv.getUint32(20) };
  if (head.startsWith("GIF8")) return { type: "gif", w: dv.getUint16(6, true), h: dv.getUint16(8, true) };
  if (b[0] === 0x52 && b[8] === 0x57) {
    const f = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (f === "VP8X") return { type: "webp", w: (dv.getUint32(24, true) & 0xffffff) + 1, h: ((dv.getUint32(26, true) >> 8) & 0xffffff) + 1 };
    return { type: "webp", w: dv.getUint16(26, true) & 0x3fff, h: dv.getUint16(28, true) & 0x3fff };
  }
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) {
    const n = b[4] | (b[5] << 8);
    let w = 0, h = 0;
    for (let i = 0; i < n; i++) {
      const o = 6 + i * 16;
      if (o + 1 >= b.length) break;
      const ew = b[o] === 0 ? 256 : b[o], eh = b[o + 1] === 0 ? 256 : b[o + 1];
      if (ew * eh > w * h) { w = ew; h = eh; }
    }
    return { type: "ico", w, h };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { type: "jpeg", h: dv.getUint16(i + 5), w: dv.getUint16(i + 7) };
      const len = (b[i + 2] << 8) | b[i + 3];
      if (len <= 0) break;
      i += 2 + len;
    }
  }
  return null;
}

const jobs = await db.job.findMany({
  where: { active: true },
  select: { company: true, companyLogoUrl: true },
});

console.log(`\nActive jobs: ${jobs.length}`);
console.log(`Missing description:  ${await db.job.count({ where: { active: true, description: null } })}`);
console.log(`Missing compensation: ${await db.job.count({ where: { active: true, compensation: null } })}`);
console.log(`Missing logo:         ${await db.job.count({ where: { active: true, companyLogoUrl: null } })}`);

// unique logos only
const uniq = new Map();
for (const j of jobs) if (j.companyLogoUrl) uniq.set(j.companyLogoUrl, j.company);

console.log(`\nChecking ${uniq.size} distinct logos...\n`);
// "flatArt" = low byte-density but a genuine self-declared asset. A flat logo
// compresses to almost nothing at 512px, so this is informational, not a defect.
const buckets = { vector: [], large: [], medium: [], small: [], flatArt: [], broken: [] };

await Promise.all([...uniq.entries()].map(async ([url, company]) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return buckets.broken.push(`${company} (${res.status})`);
    const buf = await res.arrayBuffer();
    const m = imageMeta(buf);
    if (!m) return buckets.broken.push(`${company} (unparseable)`);
    if (m.type === "svg") return buckets.vector.push(company);
    const long = Math.max(m.w, m.h);
    const density = buf.byteLength / (m.w * m.h);
    const label = `${company} ${m.w}x${m.h} ${density.toFixed(3)}B/px`;
    if (density < 0.045 && long >= 128) buckets.flatArt.push(label);
    else if (long >= 512) buckets.large.push(label);
    else if (long >= 180) buckets.medium.push(label);
    else buckets.small.push(label);
  } catch (e) {
    buckets.broken.push(`${company} (${String(e).slice(0, 40)})`);
  }
}));

for (const [k, v] of Object.entries(buckets)) {
  console.log(`${k.toUpperCase().padEnd(8)} ${String(v.length).padStart(3)}`);
  if ((k === "broken" || k === "small") && v.length) {
    v.slice(0, 12).forEach((x) => console.log(`         - ${x}`));
  }
}
await db.$disconnect();
