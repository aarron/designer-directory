import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  fetchAllCandidates,
  resolveAndStoreLogo,
  scoreImage,
  normalizeRole,
  mapExperience,
  extractCompensation,
  dedupKey,
  domainOf,
  guessDomain,
  knownCompanySite,
  mapLimit,
  type CandidateJob,
} from "@/lib/job-enrichment";

export const maxDuration = 300;

/**
 * POST /api/admin/enrich-jobs
 * Backfills fields the original ingest dropped. Auth: x-admin-secret.
 *
 * Body: { mode: "data" | "logos", offset?: number, limit?: number, dryRun?: boolean }
 *
 *   mode "data"  — one pass over every active job, filling description,
 *                  compensation, companyUrl and fixing invalid role values by
 *                  re-reading the source listings. Cheap; run once.
 *   mode "logos" — batched. Re-resolves any logo that is missing or fails the
 *                  upscaled-favicon check. Expensive (scrapes company sites),
 *                  so the caller pages through with offset/limit.
 */
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    mode?: string; offset?: number; limit?: number; dryRun?: boolean;
  };
  const mode = body.mode ?? "data";
  const dryRun = Boolean(body.dryRun);

  if (mode === "data") return enrichData(dryRun);
  if (mode === "logos") return enrichLogos(body.offset ?? 0, body.limit ?? 12, dryRun);
  return NextResponse.json({ error: `Unknown mode "${mode}"` }, { status: 400 });
}

async function enrichData(dryRun: boolean) {
  const candidates = await fetchAllCandidates();

  // Index the live listings both ways: apply URL is exact, company+title
  // catches rows whose stored URL differs from what the source reports now.
  const byUrl = new Map<string, CandidateJob>();
  const byKey = new Map<string, CandidateJob>();
  for (const c of candidates) {
    if (c.jobUrl) byUrl.set(c.jobUrl, c);
    byKey.set(dedupKey(c.company, c.title), c);
  }

  const jobs = await db.job.findMany({
    where: { active: true },
    select: {
      id: true, title: true, company: true, role: true, description: true,
      compensation: true, companyUrl: true, experienceLevel: true, typeOfRole: true,
      jobUrl: true, location: true,
    },
  });

  const stats = {
    total: jobs.length, matched: 0, description: 0, compensation: 0,
    companyUrl: 0, role: 0, experience: 0, unmatched: 0,
  };
  const samples: Array<Record<string, unknown>> = [];

  for (const job of jobs) {
    const cand = (job.jobUrl ? byUrl.get(job.jobUrl) : undefined)
      ?? byKey.get(dedupKey(job.company ?? "", job.title ?? ""));
    if (cand) stats.matched++; else stats.unmatched++;

    const data: Record<string, unknown> = {};

    if (!job.description && cand?.description) {
      data.description = cand.description;
      stats.description++;
    }
    if (!job.compensation) {
      // Prefer the source's structured figure; otherwise scrape whatever
      // description text we now have.
      const comp = cand?.compensation
        ?? extractCompensation(cand?.description ?? job.description);
      if (comp) { data.compensation = comp; stats.compensation++; }
    }
    if (!job.companyUrl && cand?.companyUrl) {
      data.companyUrl = cand.companyUrl;
      stats.companyUrl++;
    }

    // Roles outside PRIMARY_ROLES silently drop out of the board's Role filter.
    const fixedRole = normalizeRole(job.role, job.title ?? "");
    if (fixedRole !== job.role) { data.role = fixedRole; stats.role++; }

    if (!job.experienceLevel) {
      data.experienceLevel = mapExperience(job.title ?? "");
      stats.experience++;
    }

    if (Object.keys(data).length) {
      if (dryRun && samples.length < 6) {
        samples.push({
          company: job.company,
          title: job.title,
          fields: Object.keys(data),
          compensation: data.compensation ?? undefined,
          role: data.role ?? undefined,
          descriptionPreview: typeof data.description === "string"
            ? `${data.description.slice(0, 220)}…`
            : undefined,
        });
      }
      if (!dryRun) await db.job.update({ where: { id: job.id }, data });
    }
  }

  return NextResponse.json({
    ok: true, mode: "data", dryRun, candidates: candidates.length, ...stats,
    ...(dryRun ? { samples } : {}),
  });
}

/** True when the stored logo is absent or is a blurry upscaled favicon. */
async function logoNeedsUpgrade(url: string | null): Promise<boolean> {
  if (!url) return true;
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) });
    if (!res.ok) return true;
    const buf = await res.arrayBuffer();
    // Strict scoring: anything that looks synthesized/upscaled gets replaced.
    return !scoreImage(buf, false).ok;
  } catch {
    return true;
  }
}

async function enrichLogos(offset: number, limit: number, dryRun: boolean) {
  const all = await db.job.findMany({
    where: { active: true },
    select: { id: true, company: true, companyUrl: true, companyLogoUrl: true },
    orderBy: { id: "asc" },
  });

  const batch = all.slice(offset, offset + limit);
  const results = await mapLimit(batch, 4, async (job) => {
    if (!(await logoNeedsUpgrade(job.companyLogoUrl))) {
      return { company: job.company, status: "kept" as const };
    }

    // Many older rows never stored a companyUrl, leaving nothing to resolve
    // against. Recover it from the source list first, then by verified guess.
    let domain = domainOf(job.companyUrl);
    let learnedUrl: string | null = null;
    if (!domain) {
      const known = knownCompanySite(job.company);
      if (known) {
        domain = known.domain;
        learnedUrl = known.url;
      } else {
        domain = await guessDomain(job.company);
        if (domain) learnedUrl = `https://${domain}`;
      }
    }
    if (!domain) return { company: job.company, status: "no-domain" as const };
    if (dryRun) return { company: job.company, status: "would-upgrade" as const };

    const logoUrl = await resolveAndStoreLogo(job.company, domain);
    const data: Record<string, unknown> = {};
    if (learnedUrl && !job.companyUrl) data.companyUrl = learnedUrl;
    if (logoUrl) data.companyLogoUrl = logoUrl;
    if (Object.keys(data).length) await db.job.update({ where: { id: job.id }, data });

    if (!logoUrl) return { company: job.company, status: "not-found" as const };
    return { company: job.company, status: "upgraded" as const, logoUrl };
  });

  const tally: Record<string, number> = {};
  for (const r of results) tally[r.status] = (tally[r.status] ?? 0) + 1;

  return NextResponse.json({
    ok: true,
    mode: "logos",
    dryRun,
    total: all.length,
    offset,
    processed: batch.length,
    nextOffset: offset + batch.length,
    done: offset + batch.length >= all.length,
    tally,
    upgraded: results.filter((r) => r.status === "upgraded").map((r) => r.company),
  });
}
