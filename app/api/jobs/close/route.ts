import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const job = await db.job.findUnique({ where: { manageToken: token } });
  if (!job) return NextResponse.json({ error: "Invalid token." }, { status: 404 });

  if (!job.active) {
    // Already closed — just redirect to confirmation
    return NextResponse.redirect(new URL(`/jobs/closed?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`, req.url));
  }

  await db.job.update({ where: { id: job.id }, data: { active: false } });

  return NextResponse.redirect(
    new URL(`/jobs/closed?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`, req.url)
  );
}
