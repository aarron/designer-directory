import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CopyButton } from "./CopyButton";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

function generateDigestHtml(jobs: Awaited<ReturnType<typeof getRecentJobs>>, weekLabel: string): string {
  const jobRows = jobs
    .map(
      (job) => `
  <tr>
    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}" style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #000000; text-decoration: none;">${job.title}</a>
            <br />
            <span style="font-family: Arial, sans-serif; font-size: 14px; color: #606060;">${job.company} &middot; ${job.location}${job.remote ? " &middot; Remote OK" : ""} &middot; ${job.typeOfRole}</span>
          </td>
          <td align="right" style="vertical-align: top; padding-top: 2px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}" style="font-family: Arial, sans-serif; font-size: 13px; color: #FF4725; text-decoration: none; white-space: nowrap;">View role &rarr;</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
    )
    .join("");

  return `<!-- Design Better Careers: Jobs for ${weekLabel} -->
<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <tr>
    <td style="background: #000000; padding: 20px 24px;">
      <span style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #FF4725; text-transform: uppercase; letter-spacing: 1px;">Design Better Careers</span>
      <br />
      <span style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #ffffff;">Open roles this week</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 4px 24px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${jobRows}
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 16px 24px; background: #f9f9f9; border-top: 1px solid #e0e0e0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs" style="font-family: Arial, sans-serif; font-size: 13px; color: #606060; text-decoration: none;">View all jobs &rarr;</a>
      &nbsp;&nbsp;&middot;&nbsp;&nbsp;
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/talent" style="font-family: Arial, sans-serif; font-size: 13px; color: #606060; text-decoration: none;">Browse talent &rarr;</a>
      &nbsp;&nbsp;&middot;&nbsp;&nbsp;
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/post-a-job" style="font-family: Arial, sans-serif; font-size: 13px; color: #606060; text-decoration: none;">Post a job &rarr;</a>
    </td>
  </tr>
</table>
<!-- End Design Better Careers jobs block -->`;
}

async function getRecentJobs() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return db.job.findMany({
    where: { active: true, createdAt: { gte: sevenDaysAgo } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export default async function DigestPage() {
  await checkAuth();

  const jobs = await getRecentJobs();
  const now = new Date();
  const weekLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const html = generateDigestHtml(jobs, weekLabel);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-2">
        Weekly digest generator
      </h1>
      <p className="text-brand-gray-500 text-sm mb-8">
        {jobs.length} new job{jobs.length !== 1 ? "s" : ""} posted this week. Copy the HTML block below and paste it into your Substack newsletter.
      </p>

      {jobs.length === 0 ? (
        <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-8 text-center text-brand-gray-400">
          <p className="font-medium">No new jobs this week.</p>
          <p className="text-sm mt-1">Check back after new jobs are posted.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div>
            <h2 className="font-semibold text-brand-black mb-3 text-sm">Preview</h2>
            <div className="border border-brand-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-black px-5 py-4">
                <p className="text-brand-red text-xs font-bold uppercase tracking-wide">Design Better Careers</p>
                <p className="text-white font-bold text-base mt-0.5">Open roles this week</p>
              </div>
              <div className="px-5 py-3 divide-y divide-brand-gray-100">
                {jobs.map((job) => (
                  <div key={job.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-brand-black text-sm">{job.title}</p>
                      <p className="text-brand-gray-500 text-xs mt-0.5">
                        {job.company} · {job.location}{job.remote ? " · Remote OK" : ""} · {job.typeOfRole}
                      </p>
                    </div>
                    <span className="text-brand-red text-xs whitespace-nowrap">View →</span>
                  </div>
                ))}
              </div>
              <div className="bg-brand-gray-50 px-5 py-3 border-t border-brand-gray-100 flex gap-4 text-xs text-brand-gray-400">
                <span>View all jobs →</span>
                <span>Browse talent →</span>
                <span>Post a job →</span>
              </div>
            </div>
          </div>

          {/* HTML block */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-brand-black text-sm">Copy-paste HTML</h2>
              <CopyButton text={html} />
            </div>
            <textarea
              readOnly
              value={html}
              rows={24}
              className="w-full font-mono text-xs border border-brand-gray-200 rounded-xl p-4 bg-brand-gray-50 text-brand-gray-600 resize-none focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
