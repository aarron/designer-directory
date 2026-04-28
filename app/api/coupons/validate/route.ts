import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ valid: false, message: "No code provided." });

  const coupon = await db.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, message: "Invalid or expired coupon code." });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, message: "This coupon has expired." });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit." });
  }

  const isFree = coupon.discountType === "percent" && coupon.discountValue === 100;
  const originalPrice = 249;

  let discountedPrice: number;
  let message: string;

  if (coupon.discountType === "percent") {
    discountedPrice = Math.round(originalPrice * (1 - coupon.discountValue / 100));
    message = isFree
      ? "100% off — your job posting is free!"
      : `${coupon.discountValue}% off — $${discountedPrice} today`;
  } else {
    discountedPrice = Math.max(0, originalPrice - coupon.discountValue);
    message = discountedPrice === 0
      ? "Your job posting is free!"
      : `$${coupon.discountValue} off — $${discountedPrice} today`;
  }

  return NextResponse.json({
    valid: true,
    isFree: discountedPrice === 0,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountedPrice,
    message,
  });
}
