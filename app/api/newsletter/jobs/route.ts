import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/newsletter/jobs
 *
 * Returns recent active job postings for use by the newsletter agent.
 *
 * Auth:    Authorization: Bearer <NEWSLETTER_API_KEY>
 * Params:  ?days=N   — how many days back to fetch (default 7, max 30)
 *
 * Response:
 * {
 *   retrieved_at: string (ISO 8601)
 *   window_days: number
 *   total: number
 *   jobs: Job[]
 * }
 */
export async function GET(req: NextRequest) {
  // Auth
  const auth = req.headers.get("Authorization");
  if (!process.env.NEWSLETTER_API_KEY || auth !== `Bearer ${process.env.NEWSLETTER_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse ?days param
  const daysParam = req.nextUrl.searchParams.get("days");
  const days = Math.min(30, Math.max(1, parseInt(daysParam ?? "7", 10) || 7));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const rows = await db.job.findMany({
    where: { active: true, createdAt: { gte: since } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      company: true,
      companyUrl: true,
      role: true,
      typeOfRole: true,
      location: true,
      remote: true,
      experienceLevel: true,
      compensation: true,
      visaSponsorship: true,
      description: true,
      jobUrl: true,
      featured: true,
      createdAt: true,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";

  const jobs = rows.map((j) => ({
    id: j.id,
    url: `${appUrl}/jobs/${j.id}`,
    title: j.title,
    company: j.company,
    company_url: j.companyUrl ?? null,
    role_category: j.role,
    type: j.typeOfRole,
    location: j.location,
    remote: j.remote,
    experience_level: j.experienceLevel,
    compensation: j.compensation ?? null,
    visa_sponsorship: j.visaSponsorship,
    description: j.description ?? null,
    apply_url: j.jobUrl ?? null,
    featured: j.featured,
    posted_at: j.createdAt.toISOString(),
  }));

  return NextResponse.json({
    retrieved_at: new Date().toISOString(),
    window_days: days,
    total: jobs.length,
    jobs,
  });
}
