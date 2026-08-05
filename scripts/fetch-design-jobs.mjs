/**
 * fetch-design-jobs.mjs
 *
 * Scans Greenhouse, Lever, and Ashby job boards at curated design-forward
 * companies, then adds any new design roles to the Design Better Careers board.
 *
 * Usage:
 *   node scripts/fetch-design-jobs.mjs              # add new jobs
 *   node scripts/fetch-design-jobs.mjs --dry-run    # preview only, no writes
 *   node scripts/fetch-design-jobs.mjs --source greenhouse
 *   node scripts/fetch-design-jobs.mjs --company figma
 */

const ADMIN_URL = "https://designbetter.careers/api/admin";
const ADMIN_SECRET = "careers";
const DRY_RUN = process.argv.includes("--dry-run");
const SOURCE_FILTER = process.argv.find((a) => a.startsWith("--source="))?.split("=")[1];
const COMPANY_FILTER = process.argv.find((a) => a.startsWith("--company="))?.split("=")[1]?.toLowerCase();

// ── Curated company list ────────────────────────────────────────────────────
// ats: "greenhouse" | "lever" | "ashby"
// slug: board identifier used in the ATS API
// domain: used for logo fetch via Google favicons

const SOURCES = [
  // ── Greenhouse ──────────────────────────────────────────────────────────
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

  // ── Lever ───────────────────────────────────────────────────────────────
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
  { ats: "lever", slug: "invision",      name: "InVision",     domain: "invisionapp.com",  url: "https://invisionapp.com" },
  { ats: "lever", slug: "wealthsimple",  name: "Wealthsimple", domain: "wealthsimple.com", url: "https://wealthsimple.com" },

  // ── Ashby ───────────────────────────────────────────────────────────────
  { ats: "ashby", slug: "linear",        name: "Linear",       domain: "linear.app",       url: "https://linear.app" },
  { ats: "ashby", slug: "retool",        name: "Retool",       domain: "retool.com",       url: "https://retool.com" },
  { ats: "ashby", slug: "ramp",          name: "Ramp",         domain: "ramp.com",         url: "https://ramp.com" },
  { ats: "ashby", slug: "descript",      name: "Descript",     domain: "descript.com",     url: "https://descript.com" },
  { ats: "ashby", slug: "perplexity-ai", name: "Perplexity",   domain: "perplexity.ai",    url: "https://perplexity.ai" },
  { ats: "ashby", slug: "cursor",        name: "Cursor",       domain: "cursor.com",       url: "https://cursor.com" },
  { ats: "ashby", slug: "luma-ai",       name: "Luma AI",      domain: "lumalabs.ai",      url: "https://lumalabs.ai" },
  { ats: "ashby", slug: "arc",           name: "Arc Browser",  domain: "arc.net",          url: "https://arc.net" },
  { ats: "ashby", slug: "elevenlabs",    name: "ElevenLabs",   domain: "elevenlabs.io",    url: "https://elevenlabs.io" },
  { ats: "ashby", slug: "together-ai",   name: "Together AI",  domain: "together.ai",      url: "https://together.ai" },
  { ats: "ashby", slug: "anyscale",      name: "Anyscale",     domain: "anyscale.com",     url: "https://anyscale.com" },
  { ats: "ashby", slug: "photoroom",     name: "PhotoRoom",    domain: "photoroom.com",    url: "https://photoroom.com" },
  { ats: "ashby", slug: "supabase",      name: "Supabase",     domain: "supabase.com",     url: "https://supabase.com" },
  { ats: "ashby", slug: "posthog",       name: "PostHog",      domain: "posthog.com",      url: "https://posthog.com" },
  { ats: "ashby", slug: "raycast",       name: "Raycast",      domain: "raycast.com",      url: "https://raycast.com" },
  { ats: "ashby", slug: "framer",        name: "Framer",       domain: "framer.com",       url: "https://framer.com" },
  { ats: "ashby", slug: "clerk",         name: "Clerk",        domain: "clerk.com",        url: "https://clerk.com" },
];

// ── Design role detection ───────────────────────────────────────────────────

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

// Title prefixes/fragments that only count when the word "design" is a role noun
const DESIGN_ROLE_PATTERNS = [
  /\bdesigner\b/,
  /\bdesign\s+(lead|director|manager|engineer|technologist|systems|ops|operations)\b/,
  /\bhead\s+of\s+design\b/,
  /\b(ux|ui|product|visual|motion|brand|graphic|content)\s+design/,
  /\buser\s+(experience|research)\s+design/,
  /\binteraction\s+design(er)?\b/,
  /\bdesign\s+researcher\b/,
];

// Titles containing these strings are NOT design roles despite keyword matches
const DESIGN_EXCLUSIONS = [
  /engineer.*experience\s+platform/i,
  /sales\s+compensation\s+design/i,
  /channel\s+sales/i,
  /linux.*engineer/i,
  /security\s+engineer/i,
  /software\s+engineer.*new\s+grad/i,
  /full\s+stack\s+engineer/i,
];

function isDesignRole(title) {
  const lower = title.toLowerCase();
  if (DESIGN_EXCLUSIONS.some((re) => re.test(lower))) return false;
  if (DESIGN_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  return DESIGN_ROLE_PATTERNS.some((re) => re.test(lower));
}

// ── Role mapping ────────────────────────────────────────────────────────────

function mapRole(title) {
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
  if (t.includes("product manager") || t.includes("product management")) return "Product Management";
  if (t.includes("industrial design") || t.includes("ux ") || t.includes("ui ") || t.includes("interaction") || t.includes("user experience")) return "UX/UI Design";
  return "Product Design";
}

function mapExperience(title) {
  const t = title.toLowerCase();
  if (/\b(vp|vice president|director|principal|staff|lead|head of|chief|senior staff|senior director)\b/.test(t)) {
    return "Late Career (9+ years)";
  }
  if (/\b(junior|associate|jr\.?|entry|new grad)\b/.test(t)) {
    return "Early Career (0-2 years)";
  }
  // "Senior" alone is mid, not late
  return "Mid Career (3-8 years)";
}

// ── ATS fetchers ────────────────────────────────────────────────────────────

async function fetchGreenhouse(slug) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.jobs || []).map((j) => ({
    title: j.title,
    location: j.location?.name || "",
    applyUrl: j.absolute_url,
  }));
}

async function fetchLever(slug) {
  const res = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((j) => ({
    title: j.text,
    location: j.categories?.location || j.workplaceType || "",
    applyUrl: j.hostedUrl,
  }));
}

async function fetchAshby(slug) {
  const res = await fetch("https://jobs.ashbyhq.com/api/non-user-graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operationName: "ApiJobBoardWithTeams",
      variables: { organizationHostedJobsPageName: slug },
      query: `query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
        jobBoard: jobBoard(organizationHostedJobsPageName: $organizationHostedJobsPageName) {
          jobPostings { id title locationName }
        }
      }`,
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const postings = data?.data?.jobBoard?.jobPostings || [];
  return postings.map((j) => ({
    title: j.title,
    location: j.locationName || "",
    applyUrl: `https://jobs.ashbyhq.com/${slug}/${j.id}`,
  }));
}

// ── Admin API helpers ───────────────────────────────────────────────────────

async function adminFetch(method, path, body) {
  const res = await fetch(`${ADMIN_URL}${path}`, {
    method,
    headers: { "x-admin-secret": ADMIN_SECRET, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function getExistingJobUrls() {
  const jobs = await adminFetch("GET", "/jobs");
  return new Set((jobs || []).map((j) => j.jobUrl).filter(Boolean));
}

const logoCache = new Map();
async function uploadLogo(domain) {
  if (logoCache.has(domain)) return logoCache.get(domain);
  const result = await adminFetch("POST", "/upload-logo", {
    url: `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
    filename: `${domain.replace(/\./g, "-")}-logo.png`,
  });
  const url = result?.blobUrl || null;
  logoCache.set(domain, url);
  return url;
}

async function createJob(source, job) {
  const result = await adminFetch("POST", "/jobs", {
    company: source.name,
    companyUrl: source.url,
    title: job.title,
    role: mapRole(job.title),
    location: job.location || "Unknown",
    remote: /remote/i.test(job.location),
    typeOfRole: "Full-time",
    experienceLevel: mapExperience(job.title),
    jobUrl: job.applyUrl,
    posterFirstName: "Aarron",
    posterLastName: "Walter",
    posterEmail: "aarronwalter@gmail.com",
    matchFrequency: null,
  });
  if (result?.ok) {
    const logo = await uploadLogo(source.domain);
    if (logo) await adminFetch("PATCH", "/jobs", { id: result.id, companyLogoUrl: logo });
  }
  return result;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 Design Better Careers — Job Fetcher${DRY_RUN ? " [DRY RUN]" : ""}\n`);

  const existingUrls = await getExistingJobUrls();
  console.log(`  Existing jobs in DB: ${existingUrls.size}\n`);

  let sources = SOURCES;
  if (SOURCE_FILTER) sources = sources.filter((s) => s.ats === SOURCE_FILTER);
  if (COMPANY_FILTER) sources = sources.filter((s) => s.name.toLowerCase().includes(COMPANY_FILTER));

  const stats = { scanned: 0, found: 0, added: 0, skipped: 0, errors: 0 };
  const newJobs = [];

  for (const source of sources) {
    let jobs = [];
    try {
      if (source.ats === "greenhouse") jobs = await fetchGreenhouse(source.slug);
      else if (source.ats === "lever") jobs = await fetchLever(source.slug);
      else if (source.ats === "ashby") jobs = await fetchAshby(source.slug);
    } catch (err) {
      console.error(`  ✗ ${source.name}: ${err.message}`);
      stats.errors++;
      continue;
    }

    const designJobs = jobs.filter((j) => isDesignRole(j.title));
    stats.scanned += jobs.length;
    stats.found += designJobs.length;

    const freshJobs = designJobs.filter((j) => !existingUrls.has(j.applyUrl));

    if (freshJobs.length === 0) {
      process.stdout.write(`  · ${source.name} (${designJobs.length} design, 0 new)\n`);
      continue;
    }

    console.log(`  ✦ ${source.name}: ${designJobs.length} design roles, ${freshJobs.length} new`);
    for (const job of freshJobs) {
      console.log(`      + ${job.title} — ${job.location}`);
      newJobs.push({ source, job });
    }
    // small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n──────────────────────────────────────────────`);
  console.log(`  Scanned ${stats.scanned} total roles across ${sources.length} companies`);
  console.log(`  Found ${newJobs.length} new design jobs to add`);

  if (DRY_RUN || newJobs.length === 0) {
    if (DRY_RUN) console.log("\n  [Dry run — no jobs written]\n");
    return;
  }

  console.log("\n  Adding to board...\n");
  for (const { source, job } of newJobs) {
    try {
      const result = await createJob(source, job);
      if (result?.ok) {
        console.log(`  ✓ ${source.name}: ${job.title}`);
        stats.added++;
      } else {
        console.log(`  ✗ ${source.name}: ${job.title} — ${JSON.stringify(result)}`);
        stats.errors++;
      }
    } catch (err) {
      console.error(`  ✗ ${source.name}: ${job.title} — ${err.message}`);
      stats.errors++;
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n  Done. Added ${stats.added} jobs, ${stats.errors} errors.\n`);
}

main().catch(console.error);
