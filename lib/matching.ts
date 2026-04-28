/**
 * Talent matching engine for Design Better Careers.
 *
 * Scoring breakdown (max 100 pts):
 *   Primary role match      30 pts  (fuzzy via role groups)
 *   Experience level        25 pts  (exact) / 12 pts (adjacent level)
 *   Type of role            20 pts  (full-time / contract / part-time)
 *   Remote / location       15 pts
 *   Availability status      5 pts
 *   Company size             5 pts
 *
 * Minimum threshold to appear in a digest: 60 pts
 */

// Roles in the same group are considered fuzzy matches (half points)
const ROLE_GROUPS: string[][] = [
  ["UX/UI Design", "Product Design"],
  ["Branding", "Illustration"],
  ["Design Systems", "DesignOps"],
  ["User Research", "Service Design"],
  ["Motion Design"],
  ["Product Management"],
  ["Engineering"],
  ["Marketing"],
  ["Project/Program Management"],
  ["Other"],
];

const EXPERIENCE_LADDER = [
  "Early Career (0-2 years)",
  "Mid Career (3-8 years)",
  "Late Career (9+ years)",
];

export const MATCH_THRESHOLD = 60;

export type DesignerForMatching = {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  primaryRole: string;
  otherRoles: string[];
  experienceLevel: string;
  typeOfRole: string[];
  location: string;
  remotePreference: string | null;
  openToWork: string;
  companySize: string[];
  photoUrl: string | null;
};

export type JobForMatching = {
  role: string;
  experienceLevel: string;
  typeOfRole: string;
  remote: boolean;
  location: string;
  companySize: string | null;
};

export type MatchResult = {
  designer: DesignerForMatching;
  score: number;
  label: "Strong match" | "Good match";
};

function getRoleGroup(role: string): number {
  return ROLE_GROUPS.findIndex((group) => group.includes(role));
}

function scoreRole(designerRoles: string[], jobRole: string): number {
  let best = 0;
  for (const role of designerRoles) {
    if (role === jobRole) return 30; // exact match — can't do better
    const dGroup = getRoleGroup(role);
    const jGroup = getRoleGroup(jobRole);
    if (dGroup !== -1 && dGroup === jGroup) best = Math.max(best, 15);
  }
  return best;
}

function scoreExperience(designerLevel: string, jobLevel: string): number {
  if (designerLevel === jobLevel) return 25;
  const dIdx = EXPERIENCE_LADDER.indexOf(designerLevel);
  const jIdx = EXPERIENCE_LADDER.indexOf(jobLevel);
  if (dIdx === -1 || jIdx === -1) return 0;
  if (Math.abs(dIdx - jIdx) === 1) return 12; // one level off
  return 0;
}

function scoreTypeOfRole(designerTypes: string[], jobType: string): number {
  if (designerTypes.length === 0) return 10; // no preference = flexible
  if (designerTypes.includes(jobType)) return 20;
  return 0;
}

function scoreRemoteLocation(
  designerLocation: string,
  designerRemotePref: string | null,
  jobRemote: boolean,
  jobLocation: string
): number {
  if (jobRemote) {
    if (!designerRemotePref) return 12;
    if (designerRemotePref === "Open to in-office") return 8; // remote available but they prefer office
    return 15; // Remote only / Open to hybrid / Flexible
  } else {
    if (designerRemotePref === "Remote only") return 0; // hard mismatch
    // Fuzzy location match on lowercased strings
    const jLoc = jobLocation.toLowerCase();
    const dLoc = designerLocation.toLowerCase();
    if (jLoc && dLoc && (jLoc.includes(dLoc) || dLoc.includes(jLoc))) return 15;
    // Flexible/open-to-office designers get partial credit even if city doesn't match
    if (
      designerRemotePref === "Flexible" ||
      designerRemotePref === "Open to in-office" ||
      designerRemotePref === "Open to hybrid"
    ) return 8;
    return 5;
  }
}

function scoreAvailability(status: string): number {
  if (status === "OPEN") return 5;
  if (status === "OPEN_SOON") return 2;
  return 0;
}

function scoreCompanySize(designerSizes: string[], jobSize: string | null): number {
  if (!jobSize || designerSizes.length === 0) return 3; // unknown = neutral
  if (designerSizes.includes(jobSize)) return 5;
  return 0;
}

export function scoreDesigner(designer: DesignerForMatching, job: JobForMatching): number {
  return (
    scoreRole([designer.primaryRole, ...designer.otherRoles], job.role) +
    scoreExperience(designer.experienceLevel, job.experienceLevel) +
    scoreTypeOfRole(designer.typeOfRole, job.typeOfRole) +
    scoreRemoteLocation(designer.location, designer.remotePreference, job.remote, job.location) +
    scoreAvailability(designer.openToWork) +
    scoreCompanySize(designer.companySize, job.companySize)
  );
}

export function rankDesigners(
  designers: DesignerForMatching[],
  job: JobForMatching,
  excludeIds: Set<string> = new Set()
): MatchResult[] {
  return designers
    .filter((d) => !excludeIds.has(d.id) && d.openToWork !== "NOT_LOOKING")
    .map((designer) => {
      const score = scoreDesigner(designer, job);
      return { designer, score, label: score >= 80 ? ("Strong match" as const) : ("Good match" as const) };
    })
    .filter((r) => r.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}
