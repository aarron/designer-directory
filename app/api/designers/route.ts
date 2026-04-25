import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, FROM } from "@/lib/resend";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  bio: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  primaryRole: z.string().min(1),
  location: z.string().min(1),
  experienceLevel: z.string().min(1),
  typeOfRole: z.array(z.string()).default([]),
  companySize: z.string().optional(),
  compensation: z.string().optional(),
  requiresVisa: z.boolean().default(false),
  openToWork: z.enum(["OPEN", "OPEN_SOON", "NOT_LOOKING"]).default("OPEN"),
  publicProfile: z.boolean().default(true),
  shareConfidentially: z.boolean().default(false),
  photoUrl: z.string().url().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await db.designer.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "A profile with this email already exists. Check your email for your edit link." }, { status: 409 });
    }

    const designer = await db.designer.create({
      data: {
        ...data,
        linkedinUrl: data.linkedinUrl || null,
        websiteUrl: data.websiteUrl || null,
        photoUrl: data.photoUrl || null,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const editUrl = `${appUrl}/profile/edit?token=${designer.editToken}`;

    await resend.emails.send({
      from: FROM,
      to: designer.email,
      subject: "Your Design Better Careers profile is live!",
      html: `
        <h2>You're in the directory!</h2>
        <p>Hi ${designer.firstName},</p>
        <p>Your profile is live on Design Better Careers. Employers can now find you in the talent directory.</p>
        <p><a href="${appUrl}/talent/${designer.id}">View your profile →</a></p>
        <h3>Need to make changes?</h3>
        <p>Use this link to edit your profile anytime — no password required:</p>
        <p><a href="${editUrl}">${editUrl}</a></p>
        <p><em>Save this email — this is your edit link.</em></p>
        <p>— Design Better Careers</p>
      `,
    });

    return NextResponse.json({ id: designer.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }
    console.error("Designer create error:", error);
    return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const level = searchParams.get("level");

  const designers = await db.designer.findMany({
    where: {
      publicProfile: true,
      openToWork: { not: "NOT_LOOKING" },
      ...(role ? { primaryRole: role } : {}),
      ...(level ? { experienceLevel: level } : {}),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      title: true,
      company: true,
      primaryRole: true,
      experienceLevel: true,
      location: true,
      openToWork: true,
      photoUrl: true,
      typeOfRole: true,
    },
    orderBy: [{ openToWork: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(designers);
}
