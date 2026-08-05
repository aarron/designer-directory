import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const names = ["Dropbox", "Airtable", "Intercom", "Asana", "LinkedIn", "Panthalassa", "Marmend", "Google"];
for (const n of names) {
  const jobs = await db.job.findMany({
    where: { active: true, company: n },
    select: { id: true, company: true, companyUrl: true, companyLogoUrl: true },
    take: 2,
  });
  for (const j of jobs) {
    console.log(`\n${j.company}`);
    console.log(`  companyUrl: ${j.companyUrl ?? "(null)"}`);
    console.log(`  logo:       ${j.companyLogoUrl ?? "(null)"}`);
    if (j.companyLogoUrl) {
      try {
        const r = await fetch(j.companyLogoUrl, { signal: AbortSignal.timeout(12000) });
        const ct = r.headers.get("content-type");
        const buf = await r.arrayBuffer();
        console.log(`  fetch:      ${r.status} ${ct} ${buf.byteLength}b`);
      } catch (e) { console.log(`  fetch:      ERR ${String(e).slice(0, 60)}`); }
    }
  }
}
await db.$disconnect();
