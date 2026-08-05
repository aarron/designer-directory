import { NextRequest, NextResponse } from "next/server";
import { ingestNewJobs, pruneExpiredJobs } from "@/lib/job-enrichment";

// Logo resolution scrapes company sites and probes several image URLs, so give
// the ingest room to breathe.
export const maxDuration = 300;

/**
 * GET /api/cron/fetch-jobs — daily ingest (see vercel.json crons).
 * Adds newly posted design roles and retires listings that have gone away.
 * The work itself lives in lib/job-enrichment so the admin trigger
 * (/api/admin/enrich-jobs, mode=ingest) runs exactly the same code.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ingest = await ingestNewJobs();
  const prune = await pruneExpiredJobs();

  return NextResponse.json({
    ok: true,
    added: ingest.added,
    skipped: ingest.skipped,
    withDescription: ingest.withDescription,
    withCompensation: ingest.withCompensation,
    withLogo: ingest.withLogo,
    pruned: prune.pruned,
    prunedByStatus: prune.byStatus,
    prunedByCopy: prune.byCopy,
    checked: prune.checked,
    errorCount: ingest.errors.length,
    errors: ingest.errors.slice(0, 10),
  });
}
