import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withTracking } from "@/lib/apply-url";
import { logAlertEvent } from "@/lib/alert-events";

/**
 * Outbound apply redirect used only for visitors who arrived from a designer
 * email (the job page adds ?d=<designerId>). Logs the click, then sends them
 * to the employer's application page with the usual UTM tags. Everyone else
 * keeps the direct link, so this adds nothing to the normal board.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const d = req.nextUrl.searchParams.get("d");
  const src = req.nextUrl.searchParams.get("src");

  const job = await db.job.findUnique({ where: { id }, select: { id: true, jobUrl: true } });
  if (!job?.jobUrl) return NextResponse.redirect(new URL("/jobs", req.url));

  logAlertEvent({ kind: "apply_click", designerId: d, jobId: job.id, source: src });
  return NextResponse.redirect(withTracking(job.jobUrl) ?? job.jobUrl, { status: 302 });
}
