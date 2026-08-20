import { NextRequest, NextResponse } from "next/server";
import { ackDigest } from "@/lib/slack-jobs";

/**
 * POST /api/slack/jobs-digest/ack
 *
 * Confirms a digest batch reached Slack, which is what actually marks those
 * roles as posted so they never appear again.
 *
 * Auth: Authorization: Bearer $JOBS_DIGEST_SECRET
 * Body: { batchId: string }
 *
 * Call this only after chat.postMessage succeeded. Skipping it is not
 * catastrophic — the claim lapses and the roles are offered again next run —
 * but calling it *before* posting would silently drop them.
 *
 * Status codes are meaningful, because a consumer that only checks the status
 * shouldn't be able to mistake a no-op for success:
 *   200  marked > 0            the batch is now recorded as posted
 *   200  alreadyAcked: true    a safe, idempotent repeat of a previous ack
 *   404  unknown batchId       nothing carries that id — the ack did nothing,
 *                              so treat it as a failure and investigate
 *
 * Acking a batch whose id begins `dgk_` (the kickoff) also retires the
 * remaining backlog; `backlogRetired` reports how many.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.JOBS_DIGEST_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "JOBS_DIGEST_SECRET not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as { batchId?: string };
  if (!body.batchId) {
    return NextResponse.json({ error: "batchId required" }, { status: 400 });
  }

  try {
    const result = await ackDigest(body.batchId);

    if (!result.known) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unknown batchId — nothing was marked",
          hint: "The id must come from a non-dryRun GET /api/slack/jobs-digest. A dry run returns batchId: null.",
          batchId: body.batchId,
          ...result,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, batchId: body.batchId, ...result });
  } catch (err) {
    console.error("[jobs-digest/ack] failed:", err);
    return NextResponse.json({ error: String(err).slice(0, 300) }, { status: 500 });
  }
}
