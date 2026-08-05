import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  fetchAllCandidates,
  resolveAndStoreLogo,
  mapRole,
  mapExperience,
  dedupKey,
  domainOf,
  type CandidateJob,
} from "@/lib/job-enrichment";

// Logo resolution scrapes company sites and probes several image URLs, so give
// the ingest room to breathe.
export const maxDuration = 300;

/** Mark jobs inactive once their source listing is gone. */
async function pruneExpiredJobs(): Promise<{ checked: number; pruned: number }> {
  const jobs = await db.job.findMany({
    where: { active: true, jobUrl: { not: null } },
    select: { id: true, jobUrl: true },
  });

  let pruned = 0;
  for (let i = 0; i < jobs.length; i += 10) {
    await Promise.all(jobs.slice(i, i + 10).map(async (job) => {
      if (!job.jobUrl) return;
      try {
        const res = await fetch(job.jobUrl, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(6000),
        });
        // Only treat an explicit "gone" as gone — a 403/timeout is usually a
        // bot check, not a closed role.
        if (res.status === 404 || res.status === 410) {
          await db.job.update({ where: { id: job.id }, data: { active: false } });
          pruned++;
        }
      } catch { /* network hiccup — leave the job alone */ }
    }));
  }
  return { checked: jobs.length, pruned };
}

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.job.findMany({
    where: { active: true },
    select: { jobUrl: true, title: true, company: true },
  });
  const seenUrls = new Set(existing.map((j) => j.jobUrl).filter(Boolean) as string[]);
  const seenKeys = new Set(existing.map((j) => dedupKey(j.company ?? "", j.title ?? "")));

  const candidates = (await fetchAllCandidates()).filter((j) => {
    if (!j.jobUrl || !j.company) return false;
    if (seenUrls.has(j.jobUrl)) return false;
    const k = dedupKey(j.company, j.title);
    if (seenKeys.has(k)) return false;
    // Guard against duplicates inside this same batch.
    seenUrls.add(j.jobUrl);
    seenKeys.add(k);
    return true;
  });

  let added = 0;
  const errors: string[] = [];

  for (const job of candidates as CandidateJob[]) {
    try {
      const domain = job.companyDomain ?? domainOf(job.companyUrl);
      const logoUrl = await resolveAndStoreLogo(job.company, domain, job.logoHint);
      await db.job.create({
        data: {
          posterFirstName: "Aarron",
          posterLastName: "Walter",
          posterEmail: "aarronwalter@gmail.com",
          company: job.company,
          companyUrl: job.companyUrl,
          companyLogoUrl: logoUrl,
          title: job.title,
          role: mapRole(job.title),
          location: job.location || "Not specified",
          remote: job.remote,
          typeOfRole: job.typeOfRole,
          experienceLevel: mapExperience(job.title),
          compensation: job.compensation,
          description: job.description,
          jobUrl: job.jobUrl,
          active: true,
          featured: false,
          stripePaymentStatus: "paid",
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          matchFrequency: null,
        },
      });
      added++;
    } catch (err) {
      errors.push(`${job.company} — ${job.title}: ${String(err).slice(0, 160)}`);
    }
  }

  const prune = await pruneExpiredJobs();

  return NextResponse.json({
    ok: true,
    added,
    withDescription: candidates.filter((c) => c.description).length,
    withCompensation: candidates.filter((c) => c.compensation).length,
    pruned: prune.pruned,
    checked: prune.checked,
    errors: errors.slice(0, 10),
    errorCount: errors.length,
  });
}
