import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getResend, getFrom } from "@/lib/resend";

/**
 * POST /api/admin/blast-talent
 * Sends a job digest + Portfolio Club email to all visible designers.
 * Auth: x-admin-secret header.
 *
 * Body: { dryRun?: boolean }
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const dryRun = Boolean(body.dryRun);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";

  // Fetch jobs — featured first, then newest, max 10
  const jobs = await db.job.findMany({
    where: { active: true, expiresAt: { gt: new Date() } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 10,
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      remote: true,
      role: true,
      typeOfRole: true,
      companyLogoUrl: true,
    },
  });

  // Fetch all visible designers
  const designers = await db.designer.findMany({
    where: { publicProfile: true, hidden: false },
    select: { id: true, firstName: true, email: true, editToken: true },
  });

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      designerCount: designers.length,
      jobCount: jobs.length,
      jobs: jobs.map((j) => `${j.title} at ${j.company}`),
    });
  }

  const resend = getResend();
  const from = getFrom();
  let sent = 0;
  const errors: string[] = [];

  for (const designer of designers) {
    const unsubscribeUrl = `${appUrl}/api/hide?token=${designer.editToken}`;

    const jobRows = jobs
      .map((job) => {
        const locationStr = [job.location, job.remote ? "Remote" : null]
          .filter(Boolean)
          .join(" · ");
        return `
          <tr>
            <td style="padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                ${
                  job.companyLogoUrl
                    ? `<img src="${job.companyLogoUrl}" alt="${job.company}" width="32" height="32"
                        style="border-radius: 6px; flex-shrink: 0; margin-top: 2px;" />`
                    : ""
                }
                <div>
                  <a href="${appUrl}/jobs/${job.id}"
                    style="color: #F2F0EC; font-size: 16px; font-weight: 600; text-decoration: none; display: block; margin-bottom: 4px;">
                    ${job.title}
                  </a>
                  <span style="color: rgba(242,240,236,0.62); font-size: 14px;">
                    ${job.company}${locationStr ? ` &nbsp;·&nbsp; ${locationStr}` : ""}
                  </span>
                </div>
              </div>
            </td>
          </tr>`;
      })
      .join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New jobs for designers — Design Better Careers</title>
</head>
<body style="margin: 0; padding: 0; background: #0A0A0A;">
  <div style="background: #0A0A0A; max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif;">

    <!-- Logo -->
    <div style="padding: 36px 40px 28px;">
      <img src="${appUrl}/logo-white.png" alt="Design Better Careers" height="28"
        style="display: block;" />
    </div>

    <!-- Intro -->
    <div style="padding: 0 40px 32px;">
      <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; line-height: 1.2;
                 color: #F2F0EC; letter-spacing: -0.02em;">
        New jobs for designers
      </h1>
      <p style="margin: 0; font-size: 16px; line-height: 1.7; color: rgba(242,240,236,0.8);">
        Hi ${designer.firstName}, we've added new openings to Design Better Careers—roles at companies
        doing work worth your attention. Take a look.
      </p>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 0 40px;"></div>

    <!-- Jobs list -->
    <div style="padding: 8px 40px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tbody>
          ${jobRows}
        </tbody>
      </table>
    </div>

    <!-- View all CTA -->
    <div style="padding: 8px 40px 40px;">
      <a href="${appUrl}/jobs"
        style="display: inline-block; background: #FF4725; color: #0A0A0A;
               font-size: 15px; font-weight: 700; padding: 14px 28px;
               text-decoration: none;">
        View all open roles →
      </a>
    </div>

    <!-- Divider -->
    <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 0 40px;"></div>

    <!-- Portfolio Club -->
    <div style="padding: 36px 40px;">
      <div style="border-left: 3px solid #FF4725; padding-left: 20px;">
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
                   text-transform: uppercase; color: #FF4725;">
          Portfolio Club
        </p>
        <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #F2F0EC;
                   line-height: 1.3; letter-spacing: -0.01em;">
          Get feedback that moves your portfolio forward
        </h2>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;
                   color: rgba(242,240,236,0.8);">
          Portfolio Club is a Design Better program where you submit your portfolio for
          a constructive critique from a design leader, Eli, and Aarron. You'll get
          practical feedback to help you build a portfolio you're proud to send to
          hiring managers. Members also get access to our Slack community for ongoing
          peer feedback and support.
        </p>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.7;
                   color: rgba(242,240,236,0.8);">
          As a Design Better Careers member, take <strong style="color: #F2F0EC;">20% off</strong>
          an annual membership.
        </p>
        <a href="https://designbetterpodcast.com/82af4d0a"
          style="display: inline-block; border: 1px solid rgba(255,255,255,0.18);
                 color: #F2F0EC; font-size: 14px; font-weight: 600; padding: 12px 24px;
                 text-decoration: none;">
          Join Portfolio Club — 20% off →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="height: 1px; background: rgba(255,255,255,0.08); margin: 0 40px;"></div>
    <div style="padding: 24px 40px 40px;">
      <p style="margin: 0; font-size: 13px; color: rgba(242,240,236,0.38); line-height: 1.6;">
        You're receiving this because you have a profile on
        <a href="${appUrl}" style="color: rgba(242,240,236,0.38);">Design Better Careers</a>.
        &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color: rgba(242,240,236,0.38);">Remove my profile</a>
      </p>
    </div>

  </div>
</body>
</html>`;

    try {
      await resend.emails.send({
        from,
        to: designer.email,
        subject: "New design jobs—and a way to get feedback on your portfolio",
        html,
      });
      sent++;
    } catch {
      errors.push(designer.email);
    }
  }

  return NextResponse.json({ sent, errors, total: designers.length, jobCount: jobs.length });
}
