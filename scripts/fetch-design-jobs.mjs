#!/usr/bin/env node
/**
 * fetch-design-jobs.mjs — CLI for the job board's ingest/enrichment pipeline.
 *
 * This is a thin driver only. All of the actual logic (which boards to scan,
 * how descriptions and pay are parsed, how logos are resolved) lives in
 * lib/job-enrichment.ts and runs server-side, so this script and the daily
 * Vercel cron can never drift apart.
 *
 * Usage:
 *   node scripts/fetch-design-jobs.mjs ingest       # add newly posted roles
 *   node scripts/fetch-design-jobs.mjs prune        # retire dead listings
 *   node scripts/fetch-design-jobs.mjs data         # backfill missing fields
 *   node scripts/fetch-design-jobs.mjs data --dry-run
 *   node scripts/fetch-design-jobs.mjs logos        # re-resolve poor logos
 *   node scripts/fetch-design-jobs.mjs logos --companies="Figma,Asana"
 *   node scripts/fetch-design-jobs.mjs all          # ingest, then data, then logos
 *
 * Requires Node 18+ (global fetch). Override the target with
 * BOARD_URL / ADMIN_SECRET env vars.
 */

const BASE = process.env.BOARD_URL ?? "https://designbetter.careers";
const SECRET = process.env.ADMIN_SECRET ?? "careers";
const ENDPOINT = `${BASE}/api/admin/enrich-jobs`;

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("-")) ?? "help";
const dryRun = args.includes("--dry-run");
const companies = args
  .find((a) => a.startsWith("--companies="))
  ?.split("=")[1]
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function call(payload) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-secret": SECRET },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 400) }; }
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(json)}`);
  return json;
}

function line(label, value) {
  console.log(`  ${String(label).padEnd(20)} ${value}`);
}

async function runIngest() {
  console.log("\n▸ Ingesting new design jobs…");
  const r = await call({ mode: "ingest" });
  line("added", r.added);
  line("already known", r.skipped);
  line("with description", r.withDescription);
  line("with compensation", r.withCompensation);
  line("with logo", r.withLogo);
  if (r.errorCount || r.errors?.length) {
    console.log(`  errors: ${r.errors.length}`);
    r.errors.forEach((e) => console.log(`    ✗ ${e}`));
  }
}

async function runPrune() {
  console.log("\n▸ Pruning listings that are gone…");
  const r = await call({ mode: "prune" });
  line("checked", r.checked);
  line("retired", r.pruned);
}

async function runData() {
  console.log(`\n▸ Backfilling missing fields${dryRun ? " [dry run]" : ""}…`);
  const r = await call({ mode: "data", dryRun });
  line("jobs examined", r.total);
  line("matched to source", r.matched);
  line("no longer listed", r.unmatched);
  line("descriptions", r.description);
  line("compensation", r.compensation);
  line("company URLs", r.companyUrl);
  line("roles corrected", r.role);
  for (const s of r.samples ?? []) {
    console.log(`\n    ${s.company} — ${s.title}`);
    console.log(`      fields: ${s.fields.join(", ")}`);
    if (s.compensation) console.log(`      pay:    ${s.compensation}`);
    if (s.descriptionPreview) console.log(`      text:   ${s.descriptionPreview.slice(0, 120)}`);
  }
}

async function runLogos() {
  console.log(`\n▸ Upgrading logos${companies ? ` for ${companies.join(", ")}` : ""}${dryRun ? " [dry run]" : ""}…`);
  const totals = {};
  let offset = 0;
  for (;;) {
    const r = await call({ mode: "logos", offset, limit: 10, dryRun, companies });
    for (const [k, v] of Object.entries(r.tally ?? {})) totals[k] = (totals[k] ?? 0) + v;
    const pct = r.total ? Math.round((r.nextOffset / r.total) * 100) : 100;
    process.stdout.write(`\r  ${r.nextOffset}/${r.total} (${pct}%)   `);
    if (r.done || r.nextOffset === offset) break;
    offset = r.nextOffset;
  }
  console.log("\n");
  for (const [k, v] of Object.entries(totals)) line(k, v);
}

const COMMANDS = {
  ingest: runIngest,
  prune: runPrune,
  data: runData,
  logos: runLogos,
  async all() {
    await runIngest();
    await runData();
    await runLogos();
    await runPrune();
  },
};

const fn = COMMANDS[command];
if (!fn) {
  console.log(`\nUsage: node scripts/fetch-design-jobs.mjs <${Object.keys(COMMANDS).join("|")}> [--dry-run] [--companies=A,B]\n`);
  process.exit(command === "help" ? 0 : 1);
}

try {
  await fn();
  console.log("\n✓ Done\n");
} catch (err) {
  console.error(`\n✗ ${err.message}\n`);
  process.exit(1);
}
