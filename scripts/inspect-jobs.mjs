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

const ids = process.argv.slice(2);
const jobs = ids.length
  ? await db.job.findMany({ where: { id: { in: ids } } })
  : [];

for (const j of jobs) {
  console.log(`\n━━ ${j.company} — ${j.title}`);
  console.log(`   id:         ${j.id}`);
  console.log(`   createdAt:  ${j.createdAt.toISOString().slice(0, 10)}`);
  console.log(`   poster:     ${j.posterEmail}`);
  console.log(`   companyUrl: ${j.companyUrl ?? "(null)"}`);
  console.log(`   jobUrl:     ${(j.jobUrl ?? "(null)").slice(0, 90)}`);
  console.log(`   logo:       ${j.companyLogoUrl ?? "(NULL)"}`);
  if (j.companyLogoUrl) {
    try {
      const r = await fetch(j.companyLogoUrl, { signal: AbortSignal.timeout(15000) });
      const buf = await r.arrayBuffer();
      const m = imageMeta(buf);
      const dens = m && m.w !== Infinity ? (buf.byteLength / (m.w * m.h)).toFixed(3) : "-";
      console.log(`   fetched:    ${r.status} ${r.headers.get("content-type")} ${buf.byteLength}b -> ${m ? `${m.type} ${m.w}x${m.h} ${dens}B/px` : "UNPARSEABLE"}`);
    } catch (e) { console.log(`   fetched:    ERR ${String(e).slice(0, 60)}`); }
  }
}
await db.$disconnect();
