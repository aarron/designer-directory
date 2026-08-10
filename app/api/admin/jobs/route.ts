import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isOwnerEmail } from "@/lib/owner-emails";

/**
 * GET /api/admin/jobs
 * List all active jobs with id, title, company, jobUrl.
 * Auth: x-admin-secret header.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const jobs = await db.job.findMany({
    where: { active: true },
    select: { id: true, title: true, company: true, jobUrl: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(jobs);
}

/**
 * POST /api/admin/jobs
 * Create a job directly without payment.
 * Auth: x-admin-secret header must match ADMIN_SECRET env var.
 *
 * Required body fields:
 *   company, title, role, location, typeOfRole, experienceLevel,
 *   posterFirstName, posterLastName, posterEmail
 *
 * Optional:
 *   companyUrl, jobUrl, description, compensation, remote,
 *   visaSponsorship, companySize, featured, expiresAt, matchFrequency
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const required = ["company", "title", "role", "location", "typeOfRole", "experienceLevel",
    "posterFirstName", "posterLastName", "posterEmail"];
  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const job = await db.job.create({
    data: {
      posterFirstName:  String(body.posterFirstName ?? "Aarron"),
      posterLastName:   String(body.posterLastName  ?? "Walter"),
      posterEmail:      String(body.posterEmail     ?? "aarronwalter@gmail.com"),
      company:          String(body.company),
      companyUrl:       body.companyUrl   ? String(body.companyUrl)   : null,
      title:            String(body.title),
      role:             String(body.role),
      location:         String(body.location),
      remote:           Boolean(body.remote ?? false),
      typeOfRole:       String(body.typeOfRole),
      experienceLevel:  String(body.experienceLevel),
      compensation:     body.compensation ? String(body.compensation) : null,
      visaSponsorship:  Boolean(body.visaSponsorship ?? false),
      companySize:      body.companySize  ? String(body.companySize)  : null,
      jobUrl:           body.jobUrl       ? String(body.jobUrl)       : null,
      description:      body.description  ? String(body.description)  : null,
      featured:         Boolean(body.featured ?? false),
      active:           true,
      expiresAt:        body.expiresAt ? new Date(String(body.expiresAt)) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      stripePaymentStatus: "paid",
      // Admin-created jobs are ours, so they default to no talent matching.
      // Note this was the source of ~150 unwanted digests: the old default was
      // "once", and because an explicit null is falsy a caller passing
      // matchFrequency: null still fell through to it.
      matchFrequency:   isOwnerEmail(String(body.posterEmail ?? ""))
                          ? null
                          : (body.matchFrequency ? String(body.matchFrequency) : null),
    },
  });

  return NextResponse.json({ ok: true, id: job.id, title: job.title, url: `/jobs/${job.id}` });
}

/**
 * PATCH /api/admin/jobs
 * Update fields on an existing job.
 * Body: { id: string, ...fields }
 */
export async function PATCH(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, ...updates } = await req.json() as { id: string; [key: string]: unknown };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const job = await db.job.update({ where: { id }, data: updates });
  return NextResponse.json({ ok: true, id: job.id });
}
