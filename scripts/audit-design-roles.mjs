/**
 * Re-scores active jobs against the current design-role and leadership rules,
 * and reports rows that no longer qualify.
 *
 * Broadening isDesignRole() to catch leadership titles ("Head of UX", "Creative
 * Director") also let a handful of non-design roles onto the board — facilities
 * directors, brand marketing managers, compensation design. This finds them.
 *
 *   node scripts/audit-design-roles.mjs             # report only
 *   node scripts/audit-design-roles.mjs --apply     # deactivate non-design rows
 */
import { PrismaClient } from "@prisma/client";

const DESIGN_KEYWORDS = [
  "product designer", "ux designer", "ui designer", "visual designer",
  "motion designer", "brand designer", "graphic designer",
  "design lead", "design director", "design manager", "head of design",
  "vp of design", "vp, design", "chief design officer",
  "design engineer", "design technologist", "design systems engineer",
  "ux engineer", "ux researcher", "user researcher",
  "content designer", "ux writer", "industrial designer", "icon designer", "illustrat",
];
const DESIGN_ROLE_PATTERNS = [
  /\bdesigner\b/,
  /\bdesign\s+(lead|director|manager|engineer|technologist|systems|ops|operations)\b/,
  /\bhead\s+of\s+design\b/,
  /\b(ux|ui|product|visual|motion|brand|graphic|content)\s+design/,
  /\buser\s+(experience|research)\s+design/,
  /\binteraction\s+design(er)?\b/,
  /\bdesign\s+researcher\b/,
  /\bindustrial design\b/,
  /\b(creative|brand|art)\s+(?:and\s+\w+\s+)?lead\b/,
];
const DESIGN_EXCLUSIONS = [
  /engineer.*experience\s+platform/i, /sales\s+compensation\s+design/i, /channel\s+sales/i,
  /linux.*engineer/i, /security\s+engineer/i, /software\s+engineer.*new\s+grad/i,
  /full\s+stack\s+engineer/i, /\bdata\s+cent(er|re)\b/i, /\bmechanical\s+engineer\b/i,
  /\bdesign\s+verification\b/i,
  // shared with LEADERSHIP: these match a design keyword but aren't design work
  /\bdesign\s*(?:&|and)\s*construction\b/i, /\bfacilities\b/i, /\bincentive design\b/i,
  /\bcompensation\s+(?:strategy|manager|analyst|partner)\b/i, /\bpolicy design\b/i,
  /\bcourse director\b/i, /\bcurriculum\b/i,
  /\b(?<!design\s)(?<!creative\s)brand\s+manager\b/i, /\btalent brand\b/i,
  /\b(precast|civil|structural|hvac|mechanical|electrical|plumbing)\s+design\b/i, /\bprecast\b/i,
  /\b(instructor|teacher|tutor|professor|lecturer)\b/i,
  /\b(learning|instructional)\s+(experience\s+)?design/i, /\bchip\s+design\b/i,
  /\b(asic|rtl|fpga|vlsi|soc|silicon|analog|mixed[- ]signal|circuit|dft|synthesis|semiconductor|firmware|pcb)\b/i,
  /\bphysical design\b/i, /\bsystems?\s+design\s*(?:\/|engineer|architect)/i,
  /\b(apparel|fashion|footwear|textile|garment|jewel)/i, /\b(landscape|interior|architectural)\s+design/i,
];

const D =
  "(?:product\\s+design|experience\\s+design|design\\s+systems|design\\s+operations|" +
  "user\\s+experience|user\\s+research|content\\s+design|design|ux|ui|brand|creative|art|visual|motion|graphic)";
const R = "(?:head|vp|vice\\s+president|svp|evp|chief|director|manager)";
const Q = "(?:[a-z]+\\s*[-–—,]?\\s+){0,3}";
const LEAD = [
  new RegExp(`\\b${R}\\b[^,]{0,18}\\bof\\b\\s+${Q}${D}\\b`, "i"),
  new RegExp(`\\b${R}\\b\\s*,?\\s+${Q}${D}\\b`, "i"),
  new RegExp(`\\b${D}\\s+${Q}${R}\\b`, "i"),
  /\bcreative director\b/i, /\bart director\b/i, /\bchief design officer\b/i,
  /\bdesign\s+lead(?:er)?\b/i, // "Product Design Lead" is a team lead; "Lead Product Designer" (no match) is a senior IC
];
const NOT_LEAD = [
  /\b(customer|employee|candidate|patient|client|partner|developer|seller|merchant)\s+experience\b/i,
  /\bsoftware engineering\b/i, /\bengineering manager\b/i,
  /\b(product|program|project|technical|account|marketing|community|sales|engineering)\s+manager\b/i,
  /\bpolicy design\b/i, /\baccount director\b/i, /\bmarketing director\b/i, /\bsales\b/i,
  /\bconstruction\b/i, /\bfacilities\b/i, /\breal estate\b/i,
  /\b(?<!design\s)(?<!creative\s)brand\s+manager\b/i, /\btalent brand\b/i,
  /\bcompensation\b/i, /\bincentive design\b/i,
  /\bcourse director\b/i, /\bcurriculum\b/i, /\btechnical game design\b/i, /\bindividual contributor\b/i,
];

const isLeadership = (t) => {
  const s = (t ?? "").toLowerCase();
  // Mirrors the lib: a title that isn't design work can't be design leadership.
  if (DESIGN_EXCLUSIONS.some((r) => r.test(s))) return false;
  if (NOT_LEAD.some((r) => r.test(s))) return false;
  return LEAD.some((r) => r.test(s));
};
const isDesign = (t) => {
  const s = (t ?? "").toLowerCase();
  if (DESIGN_EXCLUSIONS.some((r) => r.test(s))) return false;
  if (DESIGN_KEYWORDS.some((k) => s.includes(k))) return true;
  if (DESIGN_ROLE_PATTERNS.some((r) => r.test(s))) return true;
  return isLeadership(t);
};

// Fixtures guard this copy against drifting from the library.
const FIXTURES = [
  ["Head of UX", true, true], ["Creative Director", true, true],
  ["Product Design Lead", true, true], ["Design Leader, Software Design", true, true],
  ["Lead Product Designer", true, false],
  ["Director, Global Design & Construction", false, false],
  ["Associate Brand Manager", false, false],
  ["Talent Brand Manager", false, false],
  ["GTM Compensation Strategy & Incentive Design Manager", false, false],
  ["Course Director UX UI and AI", false, false],
  ["Brand Design Manager", true, true],
  ["Precast Design Engineer", false, false], ["Graphic Design instructor - Project Base", false, false],
  ["Design Engineer", true, false],
  ["Principal Associate, Learning Experience Designer", false, false],
  ["Chip Design Manager", false, false],
  ["Senior Manager, Individual Contributor - Product Design", true, false],
  ["Senior Manager, People Leader - Product Design", true, true],
  ["Senior Product Designer", true, false],
  ["Staff Product Designer", true, false],
];
const bad = FIXTURES.filter(([t, wd, wl]) => isDesign(t) !== wd || isLeadership(t) !== wl);
if (bad.length) {
  console.error("Fixture mismatch — matcher drifted:", bad.map(([t]) => t));
  process.exit(1);
}
console.log(`fixtures: ${FIXTURES.length}/${FIXTURES.length} pass\n`);

const APPLY = process.argv.includes("--apply");
const db = new PrismaClient();

const jobs = await db.job.findMany({
  where: { active: true },
  select: { id: true, company: true, title: true, leadership: true, posterEmail: true },
});

const notDesign = jobs.filter((j) => !isDesign(j.title));
const leadWrong = jobs.filter((j) => isDesign(j.title) && isLeadership(j.title) !== j.leadership);

console.log(`${jobs.length} active jobs`);
console.log(`${notDesign.length} no longer qualify as design roles:`);
for (const j of notDesign) console.log(`  ✗ ${j.company.slice(0, 20).padEnd(21)} ${j.title.slice(0, 56)}`);
console.log(`\n${leadWrong.length} rows with a stale leadership flag`);

if (APPLY) {
  if (notDesign.length) {
    await db.job.updateMany({ where: { id: { in: notDesign.map((j) => j.id) } }, data: { active: false } });
    console.log(`\ndeactivated ${notDesign.length}`);
  }
  for (const j of leadWrong) {
    await db.job.update({ where: { id: j.id }, data: { leadership: isLeadership(j.title) } });
  }
  if (leadWrong.length) console.log(`corrected leadership on ${leadWrong.length}`);
  console.log(`\nactive: ${await db.job.count({ where: { active: true } })}`);
  console.log(`active leadership: ${await db.job.count({ where: { active: true, leadership: true } })}`);
} else {
  console.log("\n[report only — pass --apply to change anything]");
}

await db.$disconnect();
