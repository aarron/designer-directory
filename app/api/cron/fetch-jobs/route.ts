import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ── Design role detection ──────────────────────────────────────────────────

const DESIGN_KEYWORDS = [
  "product designer", "ux designer", "ui designer", "visual designer",
  "motion designer", "brand designer", "graphic designer",
  "design lead", "design director", "design manager", "head of design",
  "vp of design", "vp, design", "chief design officer",
  "design engineer", "design technologist", "design systems engineer",
  "ux engineer", "ux researcher", "user researcher",
  "content designer", "ux writer",
  "industrial designer", "icon designer",
  "illustrat",
];

const DESIGN_ROLE_PATTERNS = [
  /\bdesigner\b/,
  /\bdesign\s+(lead|director|manager|engineer|technologist|systems|ops|operations)\b/,
  /\bhead\s+of\s+design\b/,
  /\b(ux|ui|product|visual|motion|brand|graphic|content)\s+design/,
  /\buser\s+(experience|research)\s+design/,
  /\binteraction\s+design(er)?\b/,
  /\bdesign\s+researcher\b/,
];

const DESIGN_EXCLUSIONS = [
  /engineer.*experience\s+platform/i,
  /sales\s+compensation\s+design/i,
  /channel\s+sales/i,
  /linux.*engineer/i,
  /security\s+engineer/i,
  /software\s+engineer.*new\s+grad/i,
  /full\s+stack\s+engineer/i,
];

function isDesignRole(title: string): boolean {
  const lower = title.toLowerCase();
  if (DESIGN_EXCLUSIONS.some((re) => re.test(lower))) return false;
  if (DESIGN_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  return DESIGN_ROLE_PATTERNS.some((re) => re.test(lower));
}

function mapRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("motion")) return "Motion Design";
  if (t.includes("brand") || t.includes("graphic")) return "Branding";
  if (t.includes("illustrat")) return "Illustration";
  if (t.includes("visual")) return "Visual Design";
  if (t.includes("design system") || t.includes("ux engineer") || t.includes("design engineer") || t.includes("design technologist")) return "Design Systems";
  if (t.includes("research") || t.includes("researcher")) return "User Research";
  if (t.includes("content designer") || t.includes("ux writer") || t.includes("content design")) return "UX/UI Design";
  if (t.includes("designops") || t.includes("design ops")) return "DesignOps";
  if (t.includes("service design")) return "Service Design";
  if (t.includes("industrial design")) return "Industrial Design";
  if (t.includes("ux ") || t.includes("ui ") || t.includes("interaction") || t.includes("user experience")) return "UX/UI Design";
  return "Product Design";
}

function mapExperience(title: string): string {
  const t = title.toLowerCase();
  if (/\b(vp|vice president|director|principal|staff|lead|head of|chief|senior staff|senior director)\b/.test(t)) {
    return "Late Career (9+ years)";
  }
  if (/\b(junior|associate|jr\.?|entry|new grad)\b/.test(t)) {
    return "Early Career (0-2 years)";
  }
  return "Mid Career (3-8 years)";
}

// ── Company list (Greenhouse / Lever / Ashby) ─────────────────────────────

interface Source {
  ats: "greenhouse" | "lever" | "ashby";
  slug: string;
  name: string;
  domain: string;
  url: string;
}

const SOURCES: Source[] = [
  // Greenhouse
  { ats: "greenhouse", slug: "figma",          name: "Figma",         domain: "figma.com",        url: "https://figma.com" },
  { ats: "greenhouse", slug: "notion",         name: "Notion",        domain: "notion.so",        url: "https://notion.so" },
  { ats: "greenhouse", slug: "stripe",         name: "Stripe",        domain: "stripe.com",       url: "https://stripe.com" },
  { ats: "greenhouse", slug: "airtable",       name: "Airtable",      domain: "airtable.com",     url: "https://airtable.com" },
  { ats: "greenhouse", slug: "dropbox",        name: "Dropbox",       domain: "dropbox.com",      url: "https://dropbox.com" },
  { ats: "greenhouse", slug: "brex",           name: "Brex",          domain: "brex.com",         url: "https://brex.com" },
  { ats: "greenhouse", slug: "mercurytech",    name: "Mercury",       domain: "mercury.com",      url: "https://mercury.com" },
  { ats: "greenhouse", slug: "benchling",      name: "Benchling",     domain: "benchling.com",    url: "https://benchling.com" },
  { ats: "greenhouse", slug: "anduril",        name: "Anduril",       domain: "anduril.com",      url: "https://anduril.com" },
  { ats: "greenhouse", slug: "rippling",       name: "Rippling",      domain: "rippling.com",     url: "https://rippling.com" },
  { ats: "greenhouse", slug: "lattice",        name: "Lattice",       domain: "lattice.com",      url: "https://lattice.com" },
  { ats: "greenhouse", slug: "gusto",          name: "Gusto",         domain: "gusto.com",        url: "https://gusto.com" },
  { ats: "greenhouse", slug: "intercom",       name: "Intercom",      domain: "intercom.com",     url: "https://intercom.com" },
  { ats: "greenhouse", slug: "superhuman",     name: "Superhuman",    domain: "superhuman.com",   url: "https://superhuman.com" },
  { ats: "greenhouse", slug: "coinbase",       name: "Coinbase",      domain: "coinbase.com",     url: "https://coinbase.com" },
  { ats: "greenhouse", slug: "klaviyo",        name: "Klaviyo",       domain: "klaviyo.com",      url: "https://klaviyo.com" },
  { ats: "greenhouse", slug: "webflow",        name: "Webflow",       domain: "webflow.com",      url: "https://webflow.com" },
  { ats: "greenhouse", slug: "miro",           name: "Miro",          domain: "miro.com",         url: "https://miro.com" },
  { ats: "greenhouse", slug: "canva",          name: "Canva",         domain: "canva.com",        url: "https://canva.com" },
  { ats: "greenhouse", slug: "productboard",   name: "Productboard",  domain: "productboard.com", url: "https://productboard.com" },
  { ats: "greenhouse", slug: "asana",          name: "Asana",         domain: "asana.com",        url: "https://asana.com" },
  { ats: "greenhouse", slug: "duolingo",       name: "Duolingo",      domain: "duolingo.com",     url: "https://duolingo.com" },
  { ats: "greenhouse", slug: "robinhood",      name: "Robinhood",     domain: "robinhood.com",    url: "https://robinhood.com" },
  { ats: "greenhouse", slug: "loom",           name: "Loom",          domain: "loom.com",         url: "https://loom.com" },
  { ats: "greenhouse", slug: "zendesk",        name: "Zendesk",       domain: "zendesk.com",      url: "https://zendesk.com" },
  { ats: "greenhouse", slug: "hubspot",        name: "HubSpot",       domain: "hubspot.com",      url: "https://hubspot.com" },
  { ats: "greenhouse", slug: "gitlab",         name: "GitLab",        domain: "gitlab.com",       url: "https://gitlab.com" },
  { ats: "greenhouse", slug: "twilio",         name: "Twilio",        domain: "twilio.com",       url: "https://twilio.com" },
  { ats: "greenhouse", slug: "verkada",        name: "Verkada",       domain: "verkada.com",      url: "https://verkada.com" },
  { ats: "greenhouse", slug: "carta",          name: "Carta",         domain: "carta.com",        url: "https://carta.com" },
  { ats: "greenhouse", slug: "vantacom",       name: "Vanta",         domain: "vanta.com",        url: "https://vanta.com" },
  { ats: "greenhouse", slug: "openai",         name: "OpenAI",        domain: "openai.com",       url: "https://openai.com" },
  { ats: "greenhouse", slug: "anthropic",      name: "Anthropic",     domain: "anthropic.com",    url: "https://anthropic.com" },
  { ats: "greenhouse", slug: "cohere",         name: "Cohere",        domain: "cohere.com",       url: "https://cohere.com" },
  { ats: "greenhouse", slug: "scale",          name: "Scale AI",      domain: "scale.com",        url: "https://scale.com" },
  { ats: "greenhouse", slug: "nianticlabs",    name: "Niantic",       domain: "nianticlabs.com",  url: "https://nianticlabs.com" },
  { ats: "greenhouse", slug: "headspace",      name: "Headspace",     domain: "headspace.com",    url: "https://headspace.com" },
  { ats: "greenhouse", slug: "calm",           name: "Calm",          domain: "calm.com",         url: "https://calm.com" },
  { ats: "greenhouse", slug: "stytch",         name: "Stytch",        domain: "stytch.com",       url: "https://stytch.com" },
  { ats: "greenhouse", slug: "vercel",         name: "Vercel",        domain: "vercel.com",       url: "https://vercel.com" },
  { ats: "greenhouse", slug: "runway",         name: "Runway",        domain: "runwayml.com",     url: "https://runwayml.com" },
  { ats: "greenhouse", slug: "midjourney",     name: "Midjourney",    domain: "midjourney.com",   url: "https://midjourney.com" },
  // Lever
  { ats: "lever", slug: "netflix",       name: "Netflix",      domain: "netflix.com",      url: "https://netflix.com" },
  { ats: "lever", slug: "squareup",      name: "Square",       domain: "squareup.com",     url: "https://squareup.com" },
  { ats: "lever", slug: "shopify",       name: "Shopify",      domain: "shopify.com",      url: "https://shopify.com" },
  { ats: "lever", slug: "mongodb",       name: "MongoDB",      domain: "mongodb.com",      url: "https://mongodb.com" },
  { ats: "lever", slug: "elastic",       name: "Elastic",      domain: "elastic.co",       url: "https://elastic.co" },
  { ats: "lever", slug: "atlassian",     name: "Atlassian",    domain: "atlassian.com",    url: "https://atlassian.com" },
  { ats: "lever", slug: "hashicorp",     name: "HashiCorp",    domain: "hashicorp.com",    url: "https://hashicorp.com" },
  { ats: "lever", slug: "reddit",        name: "Reddit",       domain: "reddit.com",       url: "https://reddit.com" },
  { ats: "lever", slug: "lyft",          name: "Lyft",         domain: "lyft.com",         url: "https://lyft.com" },
  { ats: "lever", slug: "eventbrite",    name: "Eventbrite",   domain: "eventbrite.com",   url: "https://eventbrite.com" },
  { ats: "lever", slug: "github",        name: "GitHub",       domain: "github.com",       url: "https://github.com" },
  { ats: "lever", slug: "squarespace",   name: "Squarespace",  domain: "squarespace.com",  url: "https://squarespace.com" },
  { ats: "lever", slug: "invisionapp",   name: "InVision",     domain: "invisionapp.com",  url: "https://invisionapp.com" },
  { ats: "lever", slug: "wealthsimple",  name: "Wealthsimple", domain: "wealthsimple.com", url: "https://wealthsimple.com" },
  { ats: "lever", slug: "linear",        name: "Linear",       domain: "linear.app",       url: "https://linear.app" },
  { ats: "lever", slug: "retool",        name: "Retool",       domain: "retool.com",       url: "https://retool.com" },
  { ats: "lever", slug: "ramp",          name: "Ramp",         domain: "ramp.com",         url: "https://ramp.com" },
  { ats: "lever", slug: "descript",      name: "Descript",     domain: "descript.com",     url: "https://descript.com" },
  { ats: "lever", slug: "perplexity",    name: "Perplexity",   domain: "perplexity.ai",    url: "https://perplexity.ai" },
  { ats: "lever", slug: "cursor",        name: "Cursor",       domain: "cursor.com",       url: "https://cursor.com" },
  { ats: "lever", slug: "pointclickcare", name: "PointClickCare", domain: "pointclickcare.com", url: "https://pointclickcare.com" },
  // Ashby
  { ats: "ashby", slug: "lumaai",        name: "Luma AI",      domain: "lumalabs.ai",      url: "https://lumalabs.ai" },
  { ats: "ashby", slug: "arc-browser",   name: "Arc Browser",  domain: "arc.net",          url: "https://arc.net" },
  { ats: "ashby", slug: "elevenlabs",    name: "ElevenLabs",   domain: "elevenlabs.io",    url: "https://elevenlabs.io" },
  { ats: "ashby", slug: "togetherai",    name: "Together AI",  domain: "together.ai",      url: "https://together.ai" },
  { ats: "ashby", slug: "anyscale",      name: "Anyscale",     domain: "anyscale.com",     url: "https://anyscale.com" },
  { ats: "ashby", slug: "photoroom",     name: "PhotoRoom",    domain: "photoroom.com",    url: "https://photoroom.com" },
  { ats: "ashby", slug: "supabase",      name: "Supabase",     domain: "supabase.com",     url: "https://supabase.com" },
  { ats: "ashby", slug: "posthog",       name: "PostHog",      domain: "posthog.com",      url: "https://posthog.com" },
  { ats: "ashby", slug: "raycast",       name: "Raycast",      domain: "raycast.com",      url: "https://raycast.com" },
  { ats: "ashby", slug: "framer",        name: "Framer",       domain: "framer.com",       url: "https://framer.com" },
  { ats: "ashby", slug: "clerk",         name: "Clerk",        domain: "clerk.com",        url: "https://clerk.com" },
  { ats: "ashby", slug: "ambiencehealthcare", name: "Ambience Healthcare", domain: "ambiencehealthcare.com", url: "https://ambiencehealthcare.com" },
  { ats: "ashby", slug: "hingehealth",   name: "Hinge Health", domain: "hingehealth.com",  url: "https://hingehealth.com" },
];

// ── ATS fetchers ──────────────────────────────────────────────────────────

interface CandidateJob {
  title: string;
  company: string;
  companyUrl: string;
  companyDomain: string;
  jobUrl: string;
  location: string;
}

async function fetchGreenhouse(src: Source): Promise<CandidateJob[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${src.slug}/jobs?content=true`);
    if (!res.ok) return [];
    const data = await res.json() as { jobs: Array<{ title: string; absolute_url: string; location: { name: string } }> };
    return data.jobs
      .filter((j) => isDesignRole(j.title))
      .map((j) => ({
        title: j.title,
        company: src.name,
        companyUrl: src.url,
        companyDomain: src.domain,
        jobUrl: j.absolute_url,
        location: j.location?.name ?? "",
      }));
  } catch { return []; }
}

async function fetchLever(src: Source): Promise<CandidateJob[]> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${src.slug}?mode=json`);
    if (!res.ok) return [];
    const data = await res.json() as Array<{ text: string; hostedUrl: string; categories: { location: string } }>;
    return data
      .filter((j) => isDesignRole(j.text))
      .map((j) => ({
        title: j.text,
        company: src.name,
        companyUrl: src.url,
        companyDomain: src.domain,
        jobUrl: j.hostedUrl,
        location: j.categories?.location ?? "",
      }));
  } catch { return []; }
}

async function fetchAshby(src: Source): Promise<CandidateJob[]> {
  try {
    const res = await fetch(`https://jobs.ashbyhq.com/api/non-user-graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operationName: "ApiJobBoardWithTeams",
        variables: { organizationHostedJobsPageName: src.slug },
        query: `query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
          jobBoard: jobBoard(organizationHostedJobsPageName: $organizationHostedJobsPageName) {
            jobPostings { id title isListed locationName jobUrl }
          }
        }`,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json() as { data: { jobBoard: { jobPostings: Array<{ title: string; jobUrl: string; locationName: string; isListed: boolean }> } } };
    return (data.data?.jobBoard?.jobPostings ?? [])
      .filter((j) => j.isListed && isDesignRole(j.title))
      .map((j) => ({
        title: j.title,
        company: src.name,
        companyUrl: src.url,
        companyDomain: src.domain,
        jobUrl: j.jobUrl,
        location: j.locationName ?? "",
      }));
  } catch { return []; }
}

// ── External job boards ───────────────────────────────────────────────────

async function fetchRemotive(): Promise<CandidateJob[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?category=Design&limit=100");
    if (!res.ok) return [];
    const data = await res.json() as { jobs: Array<{ title: string; company_name: string; url: string; candidate_required_location: string; company_logo_url?: string }> };
    return (data.jobs ?? [])
      .filter((j) => isDesignRole(j.title))
      .map((j) => ({
        title: j.title,
        company: j.company_name,
        companyUrl: "",
        companyDomain: "",
        jobUrl: j.url,
        location: j.candidate_required_location ?? "Remote",
      }));
  } catch { return []; }
}

async function fetchRemoteOK(): Promise<CandidateJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api?tags=design", {
      headers: { "User-Agent": "DesignBetterCareers/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json() as Array<{ position?: string; company?: string; apply_url?: string; url?: string; location?: string; logo?: string }>;
    return data
      .filter((j) => j.position && isDesignRole(j.position))
      .map((j) => ({
        title: j.position!,
        company: j.company ?? "",
        companyUrl: "",
        companyDomain: "",
        jobUrl: j.apply_url || j.url || "",
        location: j.location ?? "Remote",
      }))
      .filter((j) => j.jobUrl);
  } catch { return []; }
}

async function fetchWeworkRemotely(): Promise<CandidateJob[]> {
  try {
    const res = await fetch("https://weworkremotely.com/categories/remote-design-jobs.rss");
    if (!res.ok) return [];
    const xml = await res.text();
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
    return items.flatMap((m) => {
      const raw = m[1];
      const titleMatch = raw.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
      const linkMatch = raw.match(/<link>([\s\S]*?)<\/link>/);
      const regionMatch = raw.match(/<region>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/region>/);
      const rawTitle = titleMatch?.[1]?.trim() ?? "";
      const link = linkMatch?.[1]?.trim() ?? "";
      if (!rawTitle || !link) return [];
      // WWR titles = "Company: Job Title"
      const colonIdx = rawTitle.indexOf(": ");
      const company = colonIdx > 0 ? rawTitle.slice(0, colonIdx).trim() : "";
      const title = colonIdx > 0 ? rawTitle.slice(colonIdx + 2).trim() : rawTitle;
      if (!isDesignRole(title)) return [];
      return [{
        title,
        company,
        companyUrl: "",
        companyDomain: "",
        jobUrl: link,
        location: regionMatch?.[1]?.trim() ?? "Remote",
      }];
    });
  } catch { return []; }
}

// ── Logo upload ───────────────────────────────────────────────────────────

async function uploadLogo(domain: string): Promise<string | null> {
  if (!domain) return null;
  try {
    const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/upload-logo`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": process.env.ADMIN_SECRET! },
      body: JSON.stringify({ url: logoUrl }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { blobUrl?: string };
    return data.blobUrl ?? null;
  } catch { return null; }
}

// ── Pruning ───────────────────────────────────────────────────────────────

async function pruneExpiredJobs(): Promise<{ checked: number; pruned: number }> {
  const jobs = await db.job.findMany({
    where: { active: true, jobUrl: { not: null } },
    select: { id: true, jobUrl: true },
  });

  let pruned = 0;
  const checks = jobs.map(async (job) => {
    if (!job.jobUrl) return;
    try {
      const res = await fetch(job.jobUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(6000),
      });
      if (res.status === 404 || res.status === 410 || res.status === 403) {
        // 403 on job pages often means "closed" on Greenhouse/Lever
        await db.job.update({ where: { id: job.id }, data: { active: false } });
        pruned++;
      }
    } catch {
      // timeout or network error — leave active
    }
  });

  // Run in batches of 10 to avoid overwhelming target servers
  for (let i = 0; i < checks.length; i += 10) {
    await Promise.all(checks.slice(i, i + 10));
  }

  return { checked: jobs.length, pruned };
}

// ── Main handler ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Get existing job URLs to skip duplicates
  const existing = await db.job.findMany({
    where: { active: true },
    select: { jobUrl: true, title: true, company: true },
  });
  const existingUrls = new Set(existing.map((j) => j.jobUrl).filter(Boolean) as string[]);
  // Company+title dedup for sources (like Remotive) that use their own redirect URLs
  const existingKeys = new Set(existing.map((j) => `${j.company?.toLowerCase()}|${j.title?.toLowerCase()}`));

  // Fetch from all sources in parallel
  const atsFetches = SOURCES.map((src) => {
    if (src.ats === "greenhouse") return fetchGreenhouse(src);
    if (src.ats === "lever") return fetchLever(src);
    return fetchAshby(src);
  });

  const [atsResults, remotive, remoteOK, wwr] = await Promise.all([
    Promise.all(atsFetches),
    fetchRemotive(),
    fetchRemoteOK(),
    fetchWeworkRemotely(),
  ]);

  const candidates = [
    ...atsResults.flat(),
    ...remotive,
    ...remoteOK,
    ...wwr,
  ].filter((j) => {
    if (!j.jobUrl) return false;
    if (existingUrls.has(j.jobUrl)) return false;
    const key = `${j.company?.toLowerCase()}|${j.title?.toLowerCase()}`;
    return !existingKeys.has(key);
  });

  // Create jobs sequentially to avoid DB contention
  let added = 0;
  const errors: string[] = [];

  for (const job of candidates) {
    try {
      const logoUrl = job.companyDomain ? await uploadLogo(job.companyDomain) : null;
      await db.job.create({
        data: {
          posterFirstName: "Aarron",
          posterLastName: "Walter",
          posterEmail: "aarronwalter@gmail.com",
          company: job.company,
          companyUrl: job.companyUrl || null,
          companyLogoUrl: logoUrl,
          title: job.title,
          role: mapRole(job.title),
          location: job.location || "Not specified",
          remote: /remote|anywhere/i.test(job.location),
          typeOfRole: "Full-time",
          experienceLevel: mapExperience(job.title),
          jobUrl: job.jobUrl,
          active: true,
          featured: false,
          stripePaymentStatus: "paid",
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          matchFrequency: null,
        },
      });
      added++;
      // Track for dedup within this batch
      existingUrls.add(job.jobUrl);
      existingKeys.add(`${job.company?.toLowerCase()}|${job.title?.toLowerCase()}`);
    } catch (err) {
      errors.push(`${job.company} — ${job.title}: ${err}`);
    }
  }

  // Prune expired jobs
  const pruneResult = await pruneExpiredJobs();

  return NextResponse.json({
    ok: true,
    added,
    pruned: pruneResult.pruned,
    checked: pruneResult.checked,
    errors: errors.length,
    appUrl,
  });
}
