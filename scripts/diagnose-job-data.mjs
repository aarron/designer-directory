import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const jobs = await db.job.findMany({
  where: { active: true },
  select: {
    id: true, company: true, title: true, role: true, description: true,
    compensation: true, companyLogoUrl: true, companyUrl: true, jobUrl: true,
    createdAt: true, posterEmail: true,
  },
  orderBy: { createdAt: "desc" },
});

const missing = (f) => jobs.filter(f).length;
console.log(`\nTotal active jobs: ${jobs.length}\n`);
console.log(`Missing description:    ${missing(j => !j.description)}`);
console.log(`Missing compensation:   ${missing(j => !j.compensation)}`);
console.log(`Missing companyLogoUrl: ${missing(j => !j.companyLogoUrl)}`);
console.log(`Missing companyUrl:     ${missing(j => !j.companyUrl)}`);
console.log(`Missing jobUrl:         ${missing(j => !j.jobUrl)}`);
console.log(`Missing role:           ${missing(j => !j.role)}`);

// Logo host breakdown
const hosts = {};
for (const j of jobs) {
  if (!j.companyLogoUrl) { hosts["(none)"] = (hosts["(none)"] || 0) + 1; continue; }
  let h = "(unparseable)";
  try { h = new URL(j.companyLogoUrl).hostname; } catch {}
  hosts[h] = (hosts[h] || 0) + 1;
}
console.log(`\nLogo hosts:`);
for (const [h, n] of Object.entries(hosts).sort((a,b) => b[1]-a[1])) console.log(`  ${n.toString().padStart(4)}  ${h}`);

// Role distribution
const roles = {};
for (const j of jobs) roles[j.role || "(none)"] = (roles[j.role || "(none)"] || 0) + 1;
console.log(`\nRole distribution:`);
for (const [r, n] of Object.entries(roles).sort((a,b) => b[1]-a[1])) console.log(`  ${n.toString().padStart(4)}  ${r}`);

// Jobs with no description, grouped by jobUrl host (= which fetcher created them)
const noDesc = jobs.filter(j => !j.description);
const descHosts = {};
for (const j of noDesc) {
  let h = "(no url)";
  try { h = new URL(j.jobUrl).hostname; } catch {}
  descHosts[h] = (descHosts[h] || 0) + 1;
}
console.log(`\nJobs missing description, by source host:`);
for (const [h, n] of Object.entries(descHosts).sort((a,b) => b[1]-a[1])) console.log(`  ${n.toString().padStart(4)}  ${h}`);

console.log(`\nSample of 5 jobs missing data:`);
for (const j of noDesc.slice(0, 5)) {
  console.log(`  ${j.company} — ${j.title}`);
  console.log(`     logo: ${j.companyLogoUrl || "(none)"}`);
  console.log(`     url:  ${j.jobUrl}`);
}

await db.$disconnect();
