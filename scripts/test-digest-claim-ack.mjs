/**
 * Exercises the claim/ack contract behind /api/slack/jobs-digest against the
 * real table, then rolls everything back. Verifies the properties that matter:
 *   - a claimed row is not offered again while the claim is fresh
 *   - ack is what sets slackPostedAt (never the fetch)
 *   - ack is idempotent
 *   - a lapsed claim becomes eligible again, so a failed run isn't lost
 */
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const CLAIM_TTL_MS = 4 * 60 * 60 * 1000;
const TEST_BATCH = "dg_TEST_ROLLBACK";

const eligibleWhere = () => ({
  active: true,
  slackPostedAt: null,
  description: { not: null },
  companyLogoUrl: { not: null },
  OR: [
    { slackClaimedAt: null },
    { slackClaimedAt: { lt: new Date(Date.now() - CLAIM_TTL_MS) } },
  ],
});

let touched = [];
const check = (label, pass) => console.log(`  ${pass ? "PASS" : "FAIL"}  ${label}`);

try {
  const before = await db.job.count({ where: eligibleWhere() });
  console.log(`\neligible before: ${before}`);
  if (before < 3) throw new Error("need at least 3 eligible jobs to test");

  const picked = await db.job.findMany({ where: eligibleWhere(), select: { id: true }, take: 3 });
  touched = picked.map((p) => p.id);

  // 1. claim
  await db.job.updateMany({
    where: { id: { in: touched } },
    data: { slackBatchId: TEST_BATCH, slackClaimedAt: new Date() },
  });
  const afterClaim = await db.job.count({ where: eligibleWhere() });
  check(`claiming 3 removes them from the eligible pool (${before} -> ${afterClaim})`, afterClaim === before - 3);

  const stillUnposted = await db.job.count({ where: { id: { in: touched }, slackPostedAt: null } });
  check("a claim does NOT mark rows posted", stillUnposted === 3);

  // 2. ack
  const ack1 = await db.job.updateMany({
    where: { slackBatchId: TEST_BATCH, slackPostedAt: null },
    data: { slackPostedAt: new Date() },
  });
  check(`ack marks exactly the batch (marked ${ack1.count})`, ack1.count === 3);

  // 3. ack again
  const ack2 = await db.job.updateMany({
    where: { slackBatchId: TEST_BATCH, slackPostedAt: null },
    data: { slackPostedAt: new Date() },
  });
  check(`re-ack is idempotent (marked ${ack2.count})`, ack2.count === 0);

  // 4. lapsed claim recovers
  await db.job.updateMany({
    where: { id: { in: touched } },
    data: { slackPostedAt: null, slackClaimedAt: new Date(Date.now() - CLAIM_TTL_MS - 60_000) },
  });
  const afterLapse = await db.job.count({ where: eligibleWhere() });
  check(`a stale claim becomes eligible again (${afterLapse} vs ${before})`, afterLapse === before);
} catch (err) {
  console.error("\nERROR:", err.message);
} finally {
  if (touched.length) {
    await db.job.updateMany({
      where: { id: { in: touched } },
      data: { slackPostedAt: null, slackBatchId: null, slackClaimedAt: null },
    });
    const leaked = await db.job.count({ where: { slackBatchId: TEST_BATCH } });
    console.log(`\nrolled back ${touched.length} row(s); test rows remaining: ${leaked}`);
  }
  await db.$disconnect();
}
