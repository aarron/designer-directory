import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/parse-job?url=...
 * Fetches a job posting URL and extracts structured fields from its HTML.
 * Auth: x-admin-secret header.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url param required" }, { status: 400 });

  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DesignBetterBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    html = await res.text();
  } catch (e) {
    return NextResponse.json({ error: `Failed to fetch URL: ${String(e)}` }, { status: 502 });
  }

  // --- helpers ---
  function meta(name: string): string {
    const m =
      html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, "i"));
    return m ? decodeHtml(m[1].trim()) : "";
  }

  function decodeHtml(s: string): string {
    return s
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
  }

  function stripTags(s: string): string {
    return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  function textContent(): string {
    // Remove script/style blocks then strip tags
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    return stripTags(cleaned).slice(0, 8000);
  }

  function jsonLd(): Record<string, unknown> | null {
    const m = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!m) return null;
    try {
      const parsed = JSON.parse(m[1]);
      // Handle @graph arrays
      if (parsed["@graph"]) {
        const job = (parsed["@graph"] as Record<string, unknown>[]).find(
          (n) => String(n["@type"]).toLowerCase().includes("jobposting")
        );
        return job ?? null;
      }
      return String(parsed["@type"]).toLowerCase().includes("jobposting") ? parsed : null;
    } catch {
      return null;
    }
  }

  // --- extract ---
  const ld = jsonLd();

  const title = decodeHtml(
    (ld?.title as string) ||
    (ld?.name as string) ||
    meta("og:title") ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
    ""
  ).replace(/\s*[\|–—-]\s*.+$/, "").trim(); // strip " | Company" suffix

  const companyName = decodeHtml(
    (ld?.hiringOrganization as { name?: string })?.name ||
    meta("og:site_name") ||
    ""
  );

  const companyWebsite =
    (ld?.hiringOrganization as { sameAs?: string })?.sameAs ||
    (ld?.hiringOrganization as { url?: string })?.url ||
    "";

  const ldLocation = ld?.jobLocation as { address?: { addressLocality?: string; addressRegion?: string } } | undefined;
  const rawLocation = ldLocation?.address?.addressLocality
    ? [ldLocation.address.addressLocality, ldLocation.address.addressRegion].filter(Boolean).join(", ")
    : "";

  const remote =
    String(ld?.jobLocationType ?? "").toLowerCase().includes("remote") ||
    String(rawLocation).toLowerCase().includes("remote") ||
    textContent().toLowerCase().includes("remote");

  const compensation =
    (ld?.baseSalary as { value?: { minValue?: number; maxValue?: number; value?: number } })?.value
      ? (() => {
          const sal = (ld!.baseSalary as { value: { minValue?: number; maxValue?: number; value?: number } }).value;
          if (sal.minValue && sal.maxValue) return `$${sal.minValue.toLocaleString()}–$${sal.maxValue.toLocaleString()}`;
          if (sal.value) return `$${(sal.value as number).toLocaleString()}`;
          return "";
        })()
      : "";

  const description = decodeHtml(
    stripTags(String(ld?.description ?? "")).slice(0, 4000) ||
    meta("og:description") ||
    meta("description")
  );

  // Derive origin URL for jobUrl
  let origin = "";
  try { origin = new URL(url).origin; } catch {}
  const derivedCompanyUrl = companyWebsite || (origin !== new URL(url).origin ? "" : origin);

  return NextResponse.json({
    title,
    company: companyName,
    companyUrl: derivedCompanyUrl,
    location: rawLocation,
    remote,
    compensation,
    description: description.slice(0, 4000),
    jobUrl: url,
    // raw text for manual review
    rawText: textContent(),
  });
}
