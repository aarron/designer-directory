import { db } from "@/lib/db";
import { getResend, getFrom } from "@/lib/resend";
import { alertFunnel } from "@/lib/alert-events";

/**
 * Weekly funnel report for the designer job-alert programme. Emailed every
 * Friday by /api/cron/alerts-report; also available on demand from the admin
 * endpoint (mode "report", and "report" + email:true to send it now).
 */

const DAY = 864e5;
/** The owner's preview row; excluded so test clicks never count. */
const PREVIEW_EMAILS = ["aarron@aarronwalter.com"];
export const REPORT_TO = process.env.ALERTS_REPORT_TO ?? "aarron@aarronwalter.com";

type KindRow = { events: number; designers: number; jobs: number };
type Funnel = Awaited<ReturnType<typeof alertFunnel>>;

export interface AlertReport {
  generatedAt: string;
  invited: number;
  optedIn: Record<string, number>;
  optedInTotal: number;
  nowNotLooking: number;
  confirmedWithoutAlerts: number;
  rolesOnBoard: number;
  alertsSent: { designers: number; roles: number; designers7d: number; roles7d: number };
  allTime: Funnel;
  last7d: Funnel;
}

export async function buildAlertReport(): Promise<AlertReport> {
  const preview = await db.designer.findMany({ where: { email: { in: PREVIEW_EMAILS } }, select: { id: true } });
  const exclude = preview.map((p) => p.id);
  const since = new Date(Date.now() - 7 * DAY);

  const [invited, optedInRows, nowNotLooking, confirmedRows, rolesOnBoard, sentAll, sent7, allTime, last7d] = await Promise.all([
    db.designer.count({ where: { alertInviteSentAt: { not: null }, id: { notIn: exclude } } }),
    db.designer.groupBy({ by: ["alertFrequency"], where: { alertFrequency: { not: "NONE" }, id: { notIn: exclude } }, _count: { _all: true } }),
    db.designer.count({ where: { alertInviteSentAt: { not: null }, openToWork: "NOT_LOOKING", id: { notIn: exclude } } }),
    // Saved the form since the invitation but chose no emails. Raw SQL because
    // Prisma can't compare two columns of the same row.
    db.$queryRaw<Array<{ n: bigint }>>`SELECT COUNT(*)::bigint AS n FROM designers WHERE "alertInviteSentAt" IS NOT NULL AND "alertFrequency" = 'NONE' AND "lastConfirmedAt" >= "alertInviteSentAt" AND NOT (id = ANY(${exclude}::text[]))`,
    db.job.count({ where: { active: true } }),
    db.jobAlertLog.groupBy({ by: ["designerId"], where: { designerId: { notIn: exclude } }, _count: { _all: true } }),
    db.jobAlertLog.groupBy({ by: ["designerId"], where: { designerId: { notIn: exclude }, sentAt: { gte: since } }, _count: { _all: true } }),
    alertFunnel({ excludeDesignerIds: exclude }),
    alertFunnel({ excludeDesignerIds: exclude, since }),
  ]);

  const optedIn = Object.fromEntries(optedInRows.map((r) => [r.alertFrequency, r._count._all]));
  return {
    generatedAt: new Date().toISOString(),
    invited,
    optedIn,
    optedInTotal: Object.values(optedIn).reduce((a, b) => a + b, 0),
    nowNotLooking,
    confirmedWithoutAlerts: Number(confirmedRows[0]?.n ?? 0),
    rolesOnBoard,
    alertsSent: {
      designers: sentAll.length,
      roles: sentAll.reduce((a, r) => a + r._count._all, 0),
      designers7d: sent7.length,
      roles7d: sent7.reduce((a, r) => a + r._count._all, 0),
    },
    allTime,
    last7d,
  };
}

// ---------------------------------------------------------------------------

const INK = "#0A0A0A";
const PAPER = "#F5F2EC";
const ORANGE = "#FF4725";
const MUTED = "#6B6862";

const KIND_LABEL: Record<string, string> = {
  invite_click: "Opened the preferences page",
  prefs_saved: "Saved preferences",
  stop: "Chose no job recommendations",
  job_view: "Viewed a role from an email",
  apply_click: "Clicked Apply",
};
const KIND_ORDER = ["invite_click", "prefs_saved", "stop", "job_view", "apply_click"];

function pct(n: number, of: number): string {
  return of ? ` <span style="color:${MUTED};">(${Math.round((n / of) * 100)}%)</span>` : "";
}

function row(label: string, week: string, all: string, strong = false): string {
  const w = strong ? "font-weight:700;" : "";
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #E5E1D8;font-size:14px;${w}">${label}</td>
    <td style="padding:9px 8px;border-bottom:1px solid #E5E1D8;font-size:14px;text-align:right;${w}">${week}</td>
    <td style="padding:9px 0;border-bottom:1px solid #E5E1D8;font-size:14px;text-align:right;color:${MUTED};">${all}</td>
  </tr>`;
}

export function renderReportEmail(r: AlertReport): { subject: string; html: string } {
  const date = new Date(r.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const k = (f: Funnel, kind: string): KindRow => f.byKind[kind] ?? { events: 0, designers: 0, jobs: 0 };

  const funnelRows = KIND_ORDER.map((kind) => {
    const w = k(r.last7d, kind);
    const a = k(r.allTime, kind);
    const extra = kind === "job_view" || kind === "apply_click" ? ` · ${a.jobs} roles` : "";
    return row(KIND_LABEL[kind], `${w.designers}`, `${a.designers}${pct(a.designers, r.invited)}${extra}`);
  }).join("");

  const cadence = ["WEEKLY", "BIWEEKLY", "MONTHLY"]
    .map((c) => `${r.optedIn[c] ?? 0} ${c.toLowerCase()}`)
    .join(" · ");

  const prefs = Object.entries(r.allTime.prefsBreakdown).sort((a, b) => b[1] - a[1]);
  const prefsLine = prefs.length
    ? prefs.map(([d, n]) => `${n} ${d.replace("OPEN_SOON", "open soon").replace("OPEN", "looking").replace("NOT_LOOKING", "not looking").replace("/", " · ").toLowerCase()}`).join(", ")
    : "none yet";

  const subject = `Job alerts, week of ${date}: ${r.optedInTotal} opted in, ${k(r.allTime, "apply_click").designers} applied`;
  const html = `
  <div style="background:${PAPER};padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;padding:32px;border-radius:8px;">
      <p style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};margin:0 0 10px;">Design Better Careers · ${date}</p>
      <h1 style="font-size:24px;line-height:1.15;margin:0 0 20px;">Designer job alerts<span style="color:${ORANGE};">.</span></h1>

      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:0 0 6px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">Funnel</td>
          <td style="padding:0 8px 6px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};text-align:right;">This week</td>
          <td style="padding:0 0 6px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};text-align:right;">All time</td>
        </tr>
        ${row("Invited", "—", `${r.invited}`, true)}
        ${funnelRows}
        ${row("Opted in to alerts", "—", `<span style="color:${ORANGE};font-weight:700;">${r.optedInTotal}</span>${pct(r.optedInTotal, r.invited)}`, true)}
      </table>

      <p style="font-size:14px;line-height:1.6;margin:0 0 6px;"><strong>Cadence:</strong> ${cadence}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 6px;"><strong>Preferences saved:</strong> ${prefsLine}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 6px;"><strong>Now marked not looking:</strong> ${r.nowNotLooking} · <strong>confirmed but no emails:</strong> ${r.confirmedWithoutAlerts}</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 6px;"><strong>Alert emails:</strong> ${r.alertsSent.designers7d} designers sent ${r.alertsSent.roles7d} roles this week · ${r.alertsSent.designers} / ${r.alertsSent.roles} all time</p>
      <p style="font-size:14px;line-height:1.6;margin:0;"><strong>Open roles on the board:</strong> ${r.rolesOnBoard}</p>

      <p style="color:${MUTED};font-size:12px;line-height:1.6;margin:28px 0 0;border-top:1px solid #E5E1D8;padding-top:14px;">"This week" counts distinct designers in the last 7 days. "All time" is since the 2 Sep 2026 invitation, with percentages of the ${r.invited} invited. The preview account is excluded. Sent every Friday by <code>/api/cron/alerts-report</code>.</p>
    </div>
  </div>`;
  return { subject, html };
}

export async function sendAlertReport(to = REPORT_TO): Promise<{ to: string; subject: string; report: AlertReport }> {
  const report = await buildAlertReport();
  const { subject, html } = renderReportEmail(report);
  await getResend().emails.send({ from: getFrom(), to, subject, html });
  return { to, subject, report };
}
