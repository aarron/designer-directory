import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

/**
 * POST /api/admin/upload-logo
 * Fetches a logo from a remote URL and stores it in Vercel Blob.
 * Auth: x-admin-secret header.
 *
 * Body: { url: string, filename: string }
 * Returns: { blobUrl: string }
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, filename } = await req.json() as { url: string; filename: string };
  if (!url || !filename) {
    return NextResponse.json({ error: "url and filename required" }, { status: 400 });
  }

  const imgRes = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DesignBetterBot/1.0)" },
  });
  if (!imgRes.ok) {
    return NextResponse.json({ error: `Failed to fetch image: ${imgRes.status}` }, { status: 502 });
  }

  const contentType = imgRes.headers.get("content-type") ?? "image/png";
  const blob = await imgRes.blob();

  const result = await put(`logos/${filename}`, blob, {
    access: "public",
    contentType,
  });

  return NextResponse.json({ blobUrl: result.url });
}
