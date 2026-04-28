import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { z } from "zod";

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === process.env.ADMIN_SECRET;
}

const schema = z.object({
  code: z.string().min(1).max(32),
  description: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]),
  discountValue: z.number().int().min(1),
  maxUses: z.number().int().min(1).nullable(),
  expiresAt: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        code: data.code.toUpperCase(),
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    if ((error as any)?.code === "P2002") return NextResponse.json({ error: "That code is already in use." }, { status: 400 });
    return NextResponse.json({ error: "Failed to update coupon." }, { status: 500 });
  }
}
