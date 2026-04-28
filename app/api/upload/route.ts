import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/db";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function POST(req: NextRequest) {
  // Gate 1: Origin must match the app domain (blocks cross-site abuse).
  // For new sign-ups there's no editToken yet, so origin check is the
  // only guard available at that stage.
  const origin = req.headers.get("origin") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const sameOrigin =
    (APP_URL && (origin.startsWith(APP_URL) || referer.startsWith(APP_URL))) ||
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1");

  if (!sameOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 4MB." }, { status: 400 });
  }

  // Gate 2: If an editToken is supplied (profile edit flow), verify it
  // belongs to a real designer before accepting the upload.
  const token = form.get("token") as string | null;
  if (token) {
    const designer = await db.designer.findUnique({
      where: { editToken: token },
      select: { id: true },
    });
    if (!designer) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  const ext = file.type.split("/")[1];
  const filename = `profiles/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
