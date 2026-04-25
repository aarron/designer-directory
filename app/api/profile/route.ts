import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const designer = await db.designer.findUnique({ where: { editToken: token } });
  if (!designer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { email, magicToken, magicTokenExpiry, ...safe } = designer;
  void email; void magicToken; void magicTokenExpiry;
  return NextResponse.json(safe);
}

const updateSchema = z.object({
  token: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  bio: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")).nullable(),
  websiteUrl: z.string().url().optional().or(z.literal("")).nullable(),
  primaryRole: z.string().min(1),
  location: z.string().min(1),
  experienceLevel: z.string().min(1),
  typeOfRole: z.array(z.string()).default([]),
  companySize: z.string().optional(),
  compensation: z.string().optional(),
  requiresVisa: z.boolean().default(false),
  openToWork: z.enum(["OPEN", "OPEN_SOON", "NOT_LOOKING"]),
  publicProfile: z.boolean().default(true),
  shareConfidentially: z.boolean().default(false),
  photoUrl: z.string().url().optional().nullable(),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const designer = await db.designer.findUnique({ where: { editToken: data.token } });
    if (!designer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { token, ...updates } = data;
    void token;

    await db.designer.update({
      where: { id: designer.id },
      data: {
        ...updates,
        linkedinUrl: updates.linkedinUrl || null,
        websiteUrl: updates.websiteUrl || null,
        photoUrl: updates.photoUrl || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
