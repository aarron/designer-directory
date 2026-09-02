// Dry run for designer job alerts: how many designers would get a worthwhile
// alert today, using the existing matching engine inverted (designer → jobs)?
//
//   DATABASE_URL=… node --experimental-strip-types scripts/dry-run-job-alerts.mjs
//
// Sends nothing. Prints distributions per lookback window plus a few samples.

import { PrismaClient } from "@prisma/client";
import { scoreDesigner, MATCH_THRESHOLD } from "../lib/matching.ts";

const db = new PrismaClient();
const DAY = 864e5;
const WINDOWS = [7, 14, 30];
const MIN_TO_SEND = 3;
const MAX_PER_ALERT = 10;

const designers = await db.designer.findMany({
  select: {
    id: true, firstName: true, lastName: true, title: true, primaryRole: true, otherRoles: true,
    experienceLevel: true, typeOfRole: true, location: true, remotePreference: true,
    openToWork: true, companySize: true, photoUrl: true, hidden: true,
  },
});
const jobs = await db.job.findMany({
  where: { active: true },
  select: {
    id: true, title: true, company: true, role: true, experienceLevel: true, typeOfRole: true,
    remote: true, location: true, companySize: true, createdAt: true, leadership: true,
  },
});
const now = Date.now();

/** Top matches for one designer within a lookback, one per employer, capped. */
function alertFor(d, days) {
  const since = now - days * DAY;
  const scored = jobs
    .filter((j) => j.createdAt.getTime() >= since)
    .map((j) => ({ job: j, score: scoreDesigner(d, j) }))
    .filter((m) => m.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
  const seen = new Set();
  const out = [];
  for (const m of scored) {
    const k = m.job.company.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
    if (out.length >= MAX_PER_ALERT) break;
  }
  return { matches: out, eligibleBeforeCap: scored.length };
}

const cohorts = {
  "visible + looking": designers.filter((d) => !d.hidden && d.openToWork !== "NOT_LOOKING"),
  "hidden (reactivation)": designers.filter((d) => d.hidden),
};

console.log(`Active jobs: ${jobs.length}. Added in last 7d: ${jobs.filter((j) => now - j.createdAt.getTime() < 7 * DAY).length}, 14d: ${jobs.filter((j) => now - j.createdAt.getTime() < 14 * DAY).length}, 30d: ${jobs.filter((j) => now - j.createdAt.getTime() < 30 * DAY).length}\n`);

for (const [name, cohort] of Object.entries(cohorts)) {
  console.log(`== ${name}: ${cohort.length} designers`);
  for (const days of WINDOWS) {
    const counts = cohort.map((d) => alertFor(d, days).matches.length).sort((a, b) => a - b);
    const n = counts.length;
    const ge = (k) => counts.filter((c) => c >= k).length;
    const median = counts[Math.floor(n / 2)];
    console.log(
      `  ${String(days).padStart(2)}d window: would send ${ge(MIN_TO_SEND)}/${n} (≥${MIN_TO_SEND} matches) · ≥1: ${ge(1)} · zero: ${n - ge(1)} · median ${median} · full ${MAX_PER_ALERT}: ${ge(MAX_PER_ALERT)}`,
    );
  }
}

// Why do people miss? Score anatomy on the 14d window for the visible cohort.
console.log("\n== Why designers fall short (visible cohort, 14d, threshold %d)", MATCH_THRESHOLD);
const vis = cohorts["visible + looking"];
const byRole = {};
for (const d of vis) {
  const n = alertFor(d, 14).matches.length;
  const r = d.primaryRole;
  byRole[r] ??= { designers: 0, wouldSend: 0 };
  byRole[r].designers++;
  if (n >= MIN_TO_SEND) byRole[r].wouldSend++;
}
for (const [r, v] of Object.entries(byRole).sort((a, b) => b[1].designers - a[1].designers)) {
  console.log(`  ${r.padEnd(22)} ${String(v.wouldSend).padStart(3)}/${String(v.designers).padEnd(3)} would get an alert`);
}
const remoteOnlyMiss = vis.filter((d) => d.remotePreference === "Remote only" && alertFor(d, 14).matches.length < MIN_TO_SEND).length;
console.log(`  "Remote only" designers below the minimum: ${remoteOnlyMiss} (non-remote jobs score 0 on location for them)`);

// Samples: eyeball match quality.
console.log("\n== Samples (14d window)");
const samples = vis.filter((d) => alertFor(d, 14).matches.length >= MIN_TO_SEND).slice(0, 3);
for (const d of samples) {
  const { matches } = alertFor(d, 14);
  console.log(`\n  ${d.firstName} — ${d.primaryRole} · ${d.experienceLevel} · ${d.location} · ${d.remotePreference ?? "no remote pref"}`);
  for (const m of matches.slice(0, 5)) {
    console.log(`    ${String(m.score).padStart(3)}  ${m.job.title} @ ${m.job.company} · ${m.job.experienceLevel} · ${m.job.remote ? "Remote" : m.job.location}`);
  }
}
const miss = vis.find((d) => alertFor(d, 14).matches.length === 0);
if (miss) {
  const top = jobs.map((j) => ({ j, s: scoreDesigner(miss, j) })).sort((a, b) => b.s - a.s).slice(0, 3);
  console.log(`\n  ZERO-MATCH example: ${miss.firstName} — ${miss.primaryRole} · ${miss.experienceLevel} · ${miss.location} · ${miss.remotePreference ?? "no pref"}; best scores anywhere: ${top.map((t) => `${t.s} (${t.j.title} @ ${t.j.company})`).join("; ")}`);
}

await db.$disconnect();
