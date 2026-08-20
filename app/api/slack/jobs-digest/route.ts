import { NextRequest, NextResponse } from "next/server";
import { buildDigestPayload } from "@/lib/slack-jobs";

/**
 * GET /api/slack/jobs-digest
 *
 * Returns a ready-to-post Slack digest of new design roles for the community
 * app (db-community) to send into #hiring. This service owns the job data and
 * the de-duplication; db-community owns the Slack transport.
 *
 * Auth: Authorization: Bearer $JOBS_DIGEST_SECRET
 *
 * Query:
 *   dryRun=1   render without claiming any rows — use while developing, so
 *              test calls don't consume roles
 *   kickoff=1  render the one-off introductory wording
 *   limit=N    cap the batch (default/max 30)
 *
 * Response: { batchId, count, shown, inThread, totalOnBoard, text, blocks,
 *             threadBlocks, jobIds, claimed }
 *
 * A successful GET *claims* the rows; it does not mark them posted. POST the
 * batchId to /api/slack/jobs-digest/ack once Slack accepts the message. An
 * unacked claim lapses after 4 hours so a failed run retries next time rather
 * than losing the roles.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.JOBS_DIGEST_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "JOBS_DIGEST_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const limitRaw = Number(params.get("limit"));

  try {
    const payload = await buildDigestPayload({
      claim: params.get("dryRun") !== "1",
      kickoff: params.get("kickoff") === "1",
      limit: Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined,
    });
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[jobs-digest] failed:", err);
    return NextResponse.json({ error: String(err).slice(0, 300) }, { status: 500 });
  }
}
