/**
 * Outbound apply links carry attribution so employers can see the applicants
 * we send them. Applied at click time rather than stored: jobUrl is the
 * de-duplication key and pruning target, and a tagged copy of the same URL
 * would count as a different job.
 *
 * utm_* is read by whatever analytics the employer runs on their careers site.
 * Where the ATS has its own source field that recruiters actually look at, we
 * set that too: Lever records `lever-source[]` as candidate origin, and Workday
 * tenants commonly read `source`. Greenhouse's gh_src expects a token minted in
 * Greenhouse, so arbitrary values aren't credited there — UTMs are the best we
 * can do for it.
 */
export const TRACKING = {
  utm_source: "designbetter.careers",
  utm_medium: "job_board",
  utm_campaign: "design_jobs",
} as const;

export function withTracking(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    // A number of older rows already carry these in the stored URL.
    if (u.searchParams.has("utm_source")) return raw;
    for (const [k, v] of Object.entries(TRACKING)) u.searchParams.set(k, v);
    const host = u.hostname;
    if (/\.lever\.co$/i.test(host)) u.searchParams.append("lever-source[]", TRACKING.utm_source);
    if (/\.myworkdayjobs\.com$/i.test(host) && !u.searchParams.has("source")) {
      u.searchParams.set("source", TRACKING.utm_source);
    }
    return u.toString();
  } catch {
    return raw;
  }
}
