import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/confirm?error=missing", req.url));

  const designer = await db.designer.findUnique({ where: { editToken: token } });
  if (!designer) return NextResponse.redirect(new URL("/confirm?error=notfound", req.url));

  await db.designer.update({
    where: { id: designer.id },
    data: {
      lastConfirmedAt: new Date(),
      confirmSentAt: null,
      hidden: false,
      publicProfile: true,
    },
  });

  return NextResponse.redirect(
    new URL(`/confirm?name=${encodeURIComponent(designer.firstName)}`, req.url)
  );
}
