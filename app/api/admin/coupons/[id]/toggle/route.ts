import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const { id } = await params;
  const coupon = await db.coupon.findUnique({ where: { id } });
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.coupon.update({ where: { id }, data: { active: !coupon.active } });

  return NextResponse.redirect(new URL("/admin/coupons", req.url));
}
