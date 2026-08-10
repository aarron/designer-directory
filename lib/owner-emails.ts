/**
 * Addresses belonging to us rather than to a hiring employer.
 *
 * Most listings on the board are seeded by us (the daily ingest posts as
 * Aarron), so any automated mail aimed at "the job poster" would land in our
 * own inbox hundreds of times over. Outbound poster mail is suppressed for
 * these addresses; real employers are unaffected.
 *
 * Override with OWNER_EMAILS (comma-separated) to change the list without a
 * code change.
 */
const DEFAULT_OWNER_EMAILS = [
  "aarronwalter@gmail.com",
  "aarron@thecuriositydepartment.com",
  "careers@thecuriositydepartment.com",
];

export const OWNER_EMAILS: string[] = (
  process.env.OWNER_EMAILS
    ? process.env.OWNER_EMAILS.split(",")
    : DEFAULT_OWNER_EMAILS
)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Prisma filter fragment: excludes our own addresses from a poster-facing
 * query. Case variants are included because the column isn't normalized.
 */
export function excludeOwnerPosters() {
  const variants = OWNER_EMAILS.flatMap((e) => [e, e.toUpperCase()]);
  return { posterEmail: { notIn: Array.from(new Set(variants)) } };
}
