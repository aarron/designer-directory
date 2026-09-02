import { NextRequest, NextResponse } from "next/server";
import { sendJobAlerts, sendAlertsInvite } from "@/lib/job-alerts";
import { alertFunnel } from "@/lib/alert-events";
import { db } from "@/lib/db";

export const maxDuration = 300;

/**
 * POST /api/admin/job-alerts   Auth: x-admin-secret
 *
 * Body: { mode: "alerts" | "invite", dryRun?, limit?, offset?, cohort?, emails? }
 *
 *   alerts — run the weekly alert pass by hand (dryRun previews who'd get what)
 *   invite — the one-off "still looking? choose a cadence" campaign, batched
 *            by offset/limit; `emails` restricts to specific addresses for a
 *            test send; cohort "visible" | "hidden" | "all"
 */
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({})) as {
    mode?: string; dryRun?: boolean; limit?: number; offset?: number;
    cohort?: "all" | "visible" | "hidden"; emails?: string[];
  };
  const dryRun = Boolean(body.dryRun);
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";

  if (body.mode === "alerts") {
    return NextResponse.json({ ok: true, mode: "alerts", dryRun, build, ...(await sendJobAlerts({ dryRun, limit: body.limit })) });
  }
  if (body.mode === "invite") {
    return NextResponse.json({
      ok: true, mode: "invite", dryRun, build,
      ...(await sendAlertsInvite({ dryRun, offset: body.offset, limit: body.limit, cohort: body.cohort, emails: body.emails })),
    });
  }
  // Funnel report: invited → clicked → saved prefs → viewed a job → clicked apply.
  // The owner's preview row is excluded so test clicks don't count.
  if (body.mode === "report") {
    const preview = await db.designer.findMany({ where: { email: { in: ["aarron@aarronwalter.com"] } }, select: { id: true } });
    const exclude = preview.map((p) => p.id);
    const [invited, optedIn, notLooking, stopped, funnel] = await Promise.all([
      db.designer.count({ where: { alertInviteSentAt: { not: null }, id: { notIn: exclude } } }),
      db.designer.groupBy({ by: ["alertFrequency"], where: { alertFrequency: { not: "NONE" }, id: { notIn: exclude } }, _count: { _all: true } }),
      db.designer.count({ where: { alertInviteSentAt: { not: null }, openToWork: "NOT_LOOKING", id: { notIn: exclude } } }),
      // Saved the form since the invitation but chose no emails. Raw SQL because
      // Prisma can't compare two columns of the same row.
      db.$queryRaw<Array<{ n: bigint }>>`SELECT COUNT(*)::bigint AS n FROM designers WHERE "alertInviteSentAt" IS NOT NULL AND "alertFrequency" = 'NONE' AND "lastConfirmedAt" >= "alertInviteSentAt" AND NOT (id = ANY(${exclude}::text[]))`.then((r) => Number(r[0]?.n ?? 0)),
      alertFunnel({ excludeDesignerIds: exclude }),
    ]);
    return NextResponse.json({
      ok: true, mode: "report", build,
      invited,
      optedIn: Object.fromEntries(optedIn.map((r) => [r.alertFrequency, r._count._all])),
      nowNotLooking: notLooking,
      confirmedWithoutAlerts: stopped,
      ...funnel,
    });
  }
  return NextResponse.json({ error: `Unknown mode "${body.mode}"` }, { status: 400 });
}
