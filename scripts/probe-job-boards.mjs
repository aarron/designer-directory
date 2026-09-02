#!/usr/bin/env node
/**
 * probe-job-boards.mjs — find new employers worth adding to the ingest.
 *
 * The daily cron only sees the boards listed in SOURCES (lib/job-enrichment.ts),
 * so board coverage is the ceiling on how many jobs we can list. This probes
 * candidate company slugs against Greenhouse, Lever and Ashby and reports which
 * have live design roles, so that list grows on evidence rather than guesswork.
 *
 * Usage:
 *   node scripts/probe-job-boards.mjs discord spotify pinterest ...
 *   node scripts/probe-job-boards.mjs --file candidates.txt
 *
 * Slugs are usually the company name lowercased with punctuation removed. A slug
 * is worth adding when it reports at least one design role; copy the CSV at the
 * end into SOURCES with the company's real name and domain.
 */

// Reuses the ingest's design-role test so counts reflect what would actually
// be listed, not every opening a company has.

const DESIGN_KEYWORDS = [
  "product designer","ux designer","ui designer","visual designer","motion designer",
  "brand designer","graphic designer","design lead","design director","design manager",
  "head of design","vp of design","design engineer","design technologist","ux engineer",
  "ux researcher","user researcher","content designer","ux writer","industrial designer","illustrat",
];
const PATTERNS = [
  /\bdesigner\b/, /\bdesign\s+(lead|director|manager|engineer|technologist|systems|ops)\b/,
  /\bhead\s+of\s+design\b/, /\b(ux|ui|product|visual|motion|brand|graphic|content)\s+design/,
  /\binteraction\s+design(er)?\b/,
];
const EXCLUDE = [
  /engineer.*experience\s+platform/i, /sales\s+compensation\s+design/i, /channel\s+sales/i,
  /linux.*engineer/i, /security\s+engineer/i, /full\s+stack\s+engineer/i,
  /\bdata\s+cent(er|re)\b/i, /\bmechanical\s+engineer\b/i, /\bdesign\s+verification\b/i,
];

// Mirrors isLeadershipRole() in lib/job-enrichment.ts, so the probe can report
// which boards carry design *leadership* openings — those are ~8% of listings,
// so expanding coverage for them needs targeting rather than luck.
const LD='(?:product\\s+design|experience\\s+design|design\\s+systems|design\\s+operations|user\\s+experience|user\\s+research|content\\s+design|design|ux|ui|brand|creative|art|visual|motion|graphic)';
const LR='(?:head|vp|vice\\s+president|svp|evp|chief|director|manager)';
const LQ='(?:[a-z]+\\s+){0,2}';
const LEAD=[
  new RegExp('\\b'+LR+'\\b[^,]{0,18}\\bof\\b\\s+'+LQ+LD+'\\b','i'),
  new RegExp('\\b'+LR+'\\b\\s*,?\\s+'+LQ+LD+'\\b','i'),
  new RegExp('\\b'+LD+'\\s+'+LQ+LR+'\\b','i'),
  /\bcreative director\b/i, /\bart director\b/i, /\bchief design officer\b/i,
  /\bdesign\s+lead(?:er)?\b/i, // "Product Design Lead" is a team lead; "Lead Product Designer" (no match) is a senior IC
];
const NOT_LEAD=[
  /\b(customer|employee|candidate|patient|client|partner|developer|seller|merchant)\s+experience\b/i,
  /\bsoftware engineering\b/i, /\bengineering manager\b/i,
  /\b(product|program|project|technical|account|marketing|community|sales|engineering)\s+manager\b/i,
  /\bpolicy design\b/i, /\baccount director\b/i, /\bmarketing director\b/i, /\bsales\b/i,
];
const isLeadership=t=>{const s=(t||'').toLowerCase();if(NOT_LEAD.some(r=>r.test(s)))return false;return LEAD.some(r=>r.test(s));};

const isDesign = (t) => {
  const s = (t || "").toLowerCase();
  if (EXCLUDE.some((r) => r.test(s))) return false;
  return DESIGN_KEYWORDS.some((k) => s.includes(k)) || PATTERNS.some((r) => r.test(s));
};

async function greenhouse(slug) {
  const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) return null;
  const d = await r.json();
  return (d.jobs || []).map((j) => j.title);
}
async function lever(slug) {
  const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) return null;
  const d = await r.json();
  if (!Array.isArray(d)) return null;
  return d.map((j) => j.text);
}
async function ashby(slug) {
  const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`, { signal: AbortSignal.timeout(15000) });
  if (!r.ok) return null;
  const d = await r.json().catch(() => null);
  if (!d?.jobs) return null;
  return d.jobs.filter((j) => j.isListed !== false).map((j) => j.title);
}

const ATS = { greenhouse, lever, ashby };

// name|slug candidates, probed across all three ATSes
const args = process.argv.slice(2);
const fileArg = args.find((a) => a.startsWith("--file"));
let CANDIDATES = args.filter((a) => !a.startsWith("--"));
if (fileArg) {
  const { readFileSync } = await import("node:fs");
  const path = fileArg.includes("=") ? fileArg.split("=")[1] : args[args.indexOf(fileArg) + 1];
  CANDIDATES = readFileSync(path, "utf8").split(/\s+/).map((s) => s.trim()).filter(Boolean);
}
if (!CANDIDATES.length) {
  console.error("Pass company slugs, or --file <path>. See header for details.");
  process.exit(1);
}

async function probe(slug) {
  const results = [];
  for (const [ats, fn] of Object.entries(ATS)) {
    try {
      const titles = await fn(slug);
      if (!titles) continue;
      const design = titles.filter(isDesign);
      const lead = design.filter(isLeadership);
      if (titles.length) results.push({ ats, total: titles.length, design: design.length, lead: lead.length, sample: (lead.length ? lead : design).slice(0, 2) });
    } catch {}
  }
  return results;
}

const found = [];
const CONC = 8;
let i = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < CANDIDATES.length) {
    const slug = CANDIDATES[i++];
    const res = await probe(slug);
    for (const r of res) {
      if (r.design > 0) {
        found.push({ slug, ...r });
        const badge = r.lead ? `${String(r.lead).padStart(2)} LEAD` : "      ";
        console.log(`  ✦ ${slug.padEnd(20)} ${r.ats.padEnd(11)} ${String(r.design).padStart(3)} design ${badge}  ${r.sample.join(" | ").slice(0, 52)}`);
      }
    }
  }
}));

console.log(`\n${found.length} board(s) with live design roles; ${found.reduce((a, b) => a + b.design, 0)} design roles, ${found.reduce((a, b) => a + (b.lead || 0), 0)} of them leadership`);
console.log("\nslug,ats,design");
for (const f of found.sort((a, b) => b.design - a.design)) console.log(`${f.slug},${f.ats},${f.design}`);
