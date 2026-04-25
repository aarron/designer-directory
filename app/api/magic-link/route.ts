import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, FROM } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const designer = await db.designer.findUnique({ where: { email } });
  if (!designer) {
    // Return 200 to prevent email enumeration
    return NextResponse.json({ sent: true });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const editUrl = `${appUrl}/profile/edit?token=${designer.editToken}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Edit your Design Better Careers profile",
    html: `
      <h2>Edit your profile</h2>
      <p>Hi ${designer.firstName},</p>
      <p>Click the link below to edit your Design Better Careers profile:</p>
      <p><a href="${editUrl}">Edit my profile →</a></p>
      <p><em>This link doesn't expire — bookmark it for easy access.</em></p>
      <p>— Design Better Careers</p>
    `,
  });

  return NextResponse.json({ sent: true });
}
