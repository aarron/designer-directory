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
 * Idempotent: re-acking the same batch marks nothing further and returns 0.
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
    const { marked } = await ackDigest(body.batchId);
    return NextResponse.json({ ok: true, batchId: body.batchId, marked });
  } catch (err) {
    console.error("[jobs-digest/ack] failed:", err);
    return NextResponse.json({ error: String(err).slice(0, 300) }, { status: 500 });
  }
}
