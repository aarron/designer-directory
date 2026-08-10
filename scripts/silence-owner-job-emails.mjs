/**
 * Stops the app mailing us about our own listings.
 *
 * Two separate crons target "the job poster", and because the board is largely
 * seeded by our own ingest both aim at us:
 *   - cron/match        talent digests for active jobs with a matchFrequency
 *   - cron/repost-nudge "repost?" mail for paid jobs that went inactive
 *
 * Both crons now exclude our addresses at query time, so this pass only cleans
 * up the stored state so nothing is queued if that guard is ever relaxed:
 *   matchFrequency    -> null  (opts the job out of matching)
 *   repostNudgeSentAt -> now   (marks the nudge as already handled)
 *
 * Idempotent. Run with --dry-run to preview.
 */
import { PrismaClient } from "@prisma/client";

const OWNER_EMAILS = (process.env.OWNER_EMAILS
  ? process.env.OWNER_EMAILS.split(",")
  : [
      "aarronwalter@gmail.com",
      "aarron@thecuriositydepartment.com",
      "careers@thecuriositydepartment.com",
    ]
).map((e) => e.trim().toLowerCase()).filter(Boolean);

const DRY = process.argv.includes("--dry-run");
const db = new PrismaClient();

const variants = Array.from(new Set(OWNER_EMAILS.flatMap((e) => [e, e.toUpperCase()])));
const owned = { posterEmail: { in: variants } };

const willMatch = await db.job.count({ where: { ...owned, matchFrequency: { not: null } } });
const willNudge = await db.job.count({ where: { ...owned, repostNudgeSentAt: null } });
const total = await db.job.count({ where: owned });

console.log(`\nOwner addresses: ${OWNER_EMAILS.join(", ")}`);
console.log(`Jobs posted by us: ${total}`);
console.log(`  with matching enabled (would email):  ${willMatch}`);
console.log(`  eligible for a future repost nudge:   ${willNudge}`);

if (DRY) {
  const sample = await db.job.findMany({
    where: { ...owned, matchFrequency: { not: null } },
    select: { company: true, title: true, matchFrequency: true },
    take: 5,
  });
  for (const s of sample) {
    console.log(`    e.g. [${s.matchFrequency}] ${s.company} — ${s.title.slice(0, 50)}`);
  }
  console.log("\n[dry run — nothing written]\n");
} else {
  const a = await db.job.updateMany({
    where: { ...owned, matchFrequency: { not: null } },
    data: { matchFrequency: null },
  });
  const b = await db.job.updateMany({
    where: { ...owned, repostNudgeSentAt: null },
    data: { repostNudgeSentAt: new Date() },
  });
  console.log(`\nmatching disabled on ${a.count} job(s)`);
  console.log(`repost nudge suppressed on ${b.count} job(s)\n`);
}

// Anything still able to mail a poster should belong to a real employer.
const remaining = await db.job.groupBy({
  by: ["posterEmail"],
  where: { active: true, matchFrequency: { not: null } },
  _count: { _all: true },
});
console.log("Still opted into talent matching (should be employers only):");
for (const r of remaining) console.log(`  ${String(r._count._all).padStart(3)}  ${r.posterEmail}`);

await db.$disconnect();
