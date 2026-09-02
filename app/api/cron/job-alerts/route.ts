import { NextRequest, NextResponse } from "next/server";
import { sendJobAlerts } from "@/lib/job-alerts";

export const maxDuration = 300;

/**
 * Tuesdays 14:00 UTC (vercel.json). Cadence is enforced per designer inside
 * sendJobAlerts, so a weekly run serves weekly, biweekly and monthly alike.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendJobAlerts();
  return NextResponse.json({ ok: true, ...result, samples: undefined });
}
