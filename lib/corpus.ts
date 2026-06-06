export interface CorpusStats {
  podcasts: number;
  videos: number;
  roundups: number;
  briefs: number;
  total: number;
  subscribers: number | null;
  updatedAt: string;
}

/**
 * Fetch stats from the Design Better Corpus API.
 * Cached for 1 hour — safe to call on every render.
 * Returns null on failure so callers can gracefully omit stats.
 */
export async function getCorpusStats(): Promise<CorpusStats | null> {
  try {
    const res = await fetch("https://db-corpus.vercel.app/api/stats", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as CorpusStats;
  } catch {
    return null;
  }
}

/**
 * Format a subscriber count as "Over 236,000" for use in prose copy.
 * Returns null when the value is null/undefined so callers can omit the stat.
 */
export function formatSubscribers(count: number | null | undefined): string | null {
  if (count == null) return null;
  return `Over ${count.toLocaleString()}`;
}

/**
 * Format a subscriber count as a compact label for stat chips, e.g. "236k+".
 * Returns null when the value is null/undefined.
 */
export function formatSubscribersShort(count: number | null | undefined): string | null {
  if (count == null) return null;
  const k = Math.floor(count / 1000);
  return `${k}k+`;
}
