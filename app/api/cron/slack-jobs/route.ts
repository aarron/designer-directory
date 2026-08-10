import { NextRequest, NextResponse } from "next/server";
import { sendJobsDigest } from "@/lib/slack-jobs";

/**
 * GET /api/cron/slack-jobs — weekly digest of new design roles to #hiring.
 * Schedule lives in vercel.json (Mondays). One message per run; see
 * lib/slack-jobs.ts for the anti-flood design.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Missing config shouldn't look like a successful quiet week.
  if (!process.env.SLACK_JOBS_BOT_TOKEN || !process.env.SLACK_JOBS_CHANNEL_ID) {
    return NextResponse.json(
      { ok: false, error: "SLACK_JOBS_BOT_TOKEN / SLACK_JOBS_CHANNEL_ID not configured" },
      { status: 503 },
    );
  }

  try {
    return NextResponse.json(await sendJobsDigest());
  } catch (err) {
    console.error("[cron/slack-jobs] failed:", err);
    return NextResponse.json({ ok: false, error: String(err).slice(0, 300) }, { status: 500 });
  }
}
