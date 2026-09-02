import { NextRequest, NextResponse } from "next/server";
import { sendAlertReport } from "@/lib/alert-report";

export const maxDuration = 60;

/** Fridays 13:00 UTC (vercel.json): emails the job-alerts funnel report to Aarron. */
export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { to, subject } = await sendAlertReport();
  return NextResponse.json({ ok: true, to, subject });
}
