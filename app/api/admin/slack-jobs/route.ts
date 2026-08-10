import { NextRequest, NextResponse } from "next/server";
import { sendJobsDigest, suppressBacklog } from "@/lib/slack-jobs";

/**
 * POST /api/admin/slack-jobs — manual control over the #hiring digest.
 * Auth: x-admin-secret.
 *
 * Body: { mode, dryRun?, limit? }
 *   "preview"  (default) render the digest and return the Block Kit payload
 *              without posting — paste into Slack's Block Kit Builder to check
 *              how it will look
 *   "kickoff"  send the one-off introductory digest
 *   "digest"   send a normal digest now, same as the weekly cron
 *   "suppress" mark every unposted job as already posted, so the backlog can
 *              never land in the channel at once
 */
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    mode?: string; dryRun?: boolean; limit?: number;
  };
  const mode = body.mode ?? "preview";

  try {
    if (mode === "preview") {
      return NextResponse.json(await sendJobsDigest({ dryRun: true, limit: body.limit }));
    }
    if (mode === "preview-kickoff") {
      return NextResponse.json(await sendJobsDigest({ dryRun: true, kickoff: true, limit: body.limit }));
    }
    if (mode === "kickoff") {
      return NextResponse.json(await sendJobsDigest({ kickoff: true, limit: body.limit ?? 10 }));
    }
    if (mode === "digest") {
      return NextResponse.json(await sendJobsDigest({ limit: body.limit }));
    }
    if (mode === "suppress") {
      const count = await suppressBacklog();
      return NextResponse.json({ ok: true, mode, suppressed: count });
    }
    return NextResponse.json({ error: `Unknown mode "${mode}"` }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err).slice(0, 300) }, { status: 500 });
  }
}
