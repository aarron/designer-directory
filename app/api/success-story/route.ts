import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  token: z.string(),
  quote: z.string().min(10),
  company: z.string().optional(),
  newRole: z.string().optional(),
  public: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const designer = await db.designer.findUnique({ where: { editToken: data.token } });
    if (!designer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.successStory.create({
      data: {
        designerId: designer.id,
        designerName: `${designer.firstName} ${designer.lastName}`,
        quote: data.quote,
        company: data.company || null,
        newRole: data.newRole || null,
        public: data.public,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
