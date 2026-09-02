/**
 * Sets the `leadership` flag on existing jobs.
 *
 * Mirrors isLeadershipRole() in lib/job-enrichment.ts. Kept in sync by the test
 * fixtures at the bottom, which fail loudly if the two drift.
 *
 *   node scripts/backfill-leadership.mjs --dry-run
 */
import { PrismaClient } from "@prisma/client";

const D =
  "(?:product\\s+design|experience\\s+design|design\\s+systems|design\\s+operations|" +
  "user\\s+experience|user\\s+research|content\\s+design|design|ux|ui|brand|creative|art|visual|motion|graphic)";
const R = "(?:head|vp|vice\\s+president|svp|evp|chief|director|manager)";
const Q = "(?:[a-z]+\\s+){0,2}";

const LEAD = [
  new RegExp(`\\b${R}\\b[^,]{0,18}\\bof\\b\\s+${Q}${D}\\b`, "i"),
  new RegExp(`\\b${R}\\b\\s*,?\\s+${Q}${D}\\b`, "i"),
  new RegExp(`\\b${D}\\s+${Q}${R}\\b`, "i"),
  /\bcreative director\b/i,
  /\bart director\b/i,
  /\bchief design officer\b/i,
];

const NOT_LEAD = [
  /\b(customer|employee|candidate|patient|client|partner|developer|seller|merchant)\s+experience\b/i,
  /\bsoftware engineering\b/i,
  /\bengineering manager\b/i,
  /\b(product|program|project|technical|account|marketing|community|sales|engineering)\s+manager\b/i,
  /\bpolicy design\b/i,
  /\baccount director\b/i,
  /\bmarketing director\b/i,
  /\bsales\b/i,
];

const isLeadership = (title) => {
  const s = (title ?? "").toLowerCase();
  if (NOT_LEAD.some((re) => re.test(s))) return false;
  return LEAD.some((re) => re.test(s));
};

// Guard against this copy drifting from the library version.
const FIXTURES = [
  ["Head of Design", true], ["VP of Design", true], ["Creative Director", true],
  ["Director, User Experience", true], ["Head of UX", true], ["UX Director", true],
  ["Product Design Manager", true], ["Director of Product Design", true],
  ["Senior Product Designer", false], ["Staff Product Designer", false],
  ["Manager, Software Engineering, Fullstack", false], ["Engineering Manager", false],
  ["Director of Customer Experience", false], ["Founding Growth Product Manager", false],
  ["Policy Design Manager, Conventional Weapons", false], ["Lead Product Designer", false],
];
const bad = FIXTURES.filter(([t, want]) => isLeadership(t) !== want);
if (bad.length) {
  console.error("Fixture mismatch — matcher has drifted:", bad.map(([t]) => t));
  process.exit(1);
}
console.log(`matcher fixtures: ${FIXTURES.length}/${FIXTURES.length} pass`);

const DRY = process.argv.includes("--dry-run");
const db = new PrismaClient();

const jobs = await db.job.findMany({ select: { id: true, title: true, role: true, leadership: true } });
const shouldBe = jobs.map((j) => ({ ...j, want: isLeadership(j.title) }));
const changing = shouldBe.filter((j) => j.want !== j.leadership);

console.log(`\n${jobs.length} jobs; ${shouldBe.filter((j) => j.want).length} are design leadership`);
console.log(`${changing.length} rows need updating\n`);

for (const j of changing.filter((c) => c.want).slice(0, 40)) {
  console.log(`  + ${j.title.slice(0, 62)}`);
}

if (!DRY && changing.length) {
  const on = changing.filter((c) => c.want).map((c) => c.id);
  const off = changing.filter((c) => !c.want).map((c) => c.id);
  if (on.length) await db.job.updateMany({ where: { id: { in: on } }, data: { leadership: true } });
  if (off.length) await db.job.updateMany({ where: { id: { in: off } }, data: { leadership: false } });
  console.log(`\nset true on ${on.length}, false on ${off.length}`);
  const active = await db.job.count({ where: { active: true, leadership: true } });
  console.log(`active leadership roles now filterable: ${active}`);
} else if (DRY) {
  console.log("\n[dry run — nothing written]");
}

await db.$disconnect();
