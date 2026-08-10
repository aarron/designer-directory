import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import { JobCard } from "@/components/JobCard";
import { ResultsBar } from "@/components/ResultsBar";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS } from "@/lib/utils";
import { JOB_POSTING_PRICE_DOLLARS } from "@/lib/stripe";
import { getCorpusStats, formatSubscribers } from "@/lib/corpus";

interface SearchParams {
  role?: string;
  level?: string;
  type?: string;
  remote?: string;
  sort?: string;
  view?: string;
}

const SORT_OPTIONS = [
  { value: "", label: "RECENTLY POSTED" },
  { value: "featured", label: "FEATURED FIRST" },
];

async function getJobs(params: SearchParams) {
  const sortFeatured = params.sort === "featured";
  return db.job.findMany({
    where: {
      active: true,
      ...(params.role ? { role: params.role } : {}),
      ...(params.level ? { experienceLevel: params.level } : {}),
      ...(params.type ? { typeOfRole: params.type } : {}),
      ...(params.remote === "true" ? { remote: true } : {}),
    },
    orderBy: sortFeatured
      ? [{ featured: "desc" }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }],
  });
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [jobs, total, corpusStats] = await Promise.all([
    getJobs(params),
    db.job.count({ where: { active: true } }),
    getCorpusStats(),
  ]);
  const subscriberLabel = formatSubscribers(corpusStats?.subscribers);

  // Jobs default to the compact list: it fits far more roles on screen, which
  // matters now the board carries a few hundred. `?view=grid` opts back in.
  const view = params.view === "grid" ? "grid" : "list";
  const activeFilters = Object.entries(params)
    .filter(([k]) => !["sort", "view"].includes(k))
    .filter(([, v]) => Boolean(v)).length;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">

        {/* Hero */}
        <div className="flex items-end justify-between mb-10 pb-10" style={{ borderBottom: "1px solid var(--divider)" }}>
          <div>
            <h1 className="font-display text-display-lg font-bold leading-none" style={{ color: "var(--text-1)" }}>
              Open design roles<span style={{ color: "#FF4725" }}>.</span>
            </h1>
            <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] mt-3" style={{ color: "var(--text-3)" }}>
              Jobs · Design Better Careers
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 ml-8">
            <div className="text-right">
              <p className="font-display font-bold text-display-md leading-none" style={{ color: "#FF4725" }}>{total}</p>
              <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] mt-1" style={{ color: "var(--text-3)" }}>Roles open</p>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              <Link
                href="/post-a-job"
                className="inline-flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.12em] px-5 py-3 rounded-md transition-colors duration-[120ms] whitespace-nowrap"
                style={{ background: "#0A0A0A", color: "#F5F2EC" }}
              >
                Post a Job — ${JOB_POSTING_PRICE_DOLLARS} →
              </Link>
              <Link
                href="/jobs/manage"
                className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] text-center transition-colors duration-[120ms]"
                style={{ color: "var(--text-3)" }}
              >
                Manage a listing
              </Link>
            </div>
          </div>
        </div>

        {/* Filter row */}
        <form className="mb-8">
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          {params.view && <input type="hidden" name="view" value={params.view} />}
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            <JobFilterSelect label="Role" name="role" value={params.role || ""}>
              <option value="">All roles</option>
              {PRIMARY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </JobFilterSelect>

            <JobFilterSelect label="Experience" name="level" value={params.level || ""}>
              <option value="">All levels</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </JobFilterSelect>

            <JobFilterSelect label="Type" name="type" value={params.type || ""}>
              <option value="">Any type</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </JobFilterSelect>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[9px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>Remote</label>
              <label
                className="h-8 px-3 flex items-center gap-2 text-[11px] cursor-pointer uppercase tracking-wide font-medium transition-colors duration-[120ms]"
                style={{ border: "1px solid var(--input-border)", background: "var(--surface-1)", color: "var(--text-1)" }}
              >
                <input
                  type="checkbox"
                  name="remote"
                  value="true"
                  defaultChecked={params.remote === "true"}
                  className="rounded"
                />
                Remote only
              </label>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="h-8 px-4 font-mono text-[11px] font-normal uppercase tracking-[0.12em] transition-colors duration-[120ms]"
                style={{ background: "#0A0A0A", color: "#F5F2EC" }}
              >
                Filter
              </button>
              {activeFilters > 0 && (
                <Link
                  href="/jobs"
                  className="h-8 px-3 font-mono text-[11px] font-normal uppercase tracking-[0.12em] transition-colors duration-[120ms] flex items-center"
                  style={{ color: "var(--text-3)" }}
                >
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>

        {/* Results bar */}
        <Suspense>
          <ResultsBar
            showing={jobs.length}
            total={total}
            sortOptions={SORT_OPTIONS}
            defaultView="list"
          />
        </Suspense>

        {/* Grid / List */}
        {jobs.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display font-bold text-display-sm" style={{ color: "var(--text-1)" }}>
              No roles match<span style={{ color: "#FF4725" }}>.</span>
            </p>
            <p className="text-sm mt-3" style={{ color: "var(--text-2)" }}>
              Try adjusting your filters or check back soon.
            </p>
            {activeFilters > 0 && (
              <Link
                href="/jobs"
                className="inline-block mt-6 font-mono text-[11px] font-normal uppercase tracking-[0.12em] px-5 py-2.5 rounded-md transition-colors duration-[120ms]"
                style={{ background: "var(--surface-1)", color: "var(--text-2)" }}
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : view === "list" ? (
          <div className="flex flex-col gap-px" style={{ background: "var(--divider)" }}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} variant="list" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Employer CTA */}
        <div className="mt-20 pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6" style={{ borderTop: "1px solid var(--divider)" }}>
          <div>
            <p className="font-display font-bold text-display-sm" style={{ color: "var(--text-1)" }}>
              Hiring a designer?<span style={{ color: "#FF4725" }}>.</span>
            </p>
            <p className="text-sm mt-2 max-w-md" style={{ color: "var(--text-2)" }}>
              Reach {subscriberLabel ?? "hundreds of thousands of"} design professionals and get a curated shortlist of matched candidates.
            </p>
          </div>
          <Link
            href="/post-a-job"
            className="flex-shrink-0 inline-flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.12em] px-6 py-3.5 rounded-md transition-colors duration-[120ms] whitespace-nowrap"
            style={{ background: "#0A0A0A", color: "#F5F2EC" }}
          >
            Post a Job — ${JOB_POSTING_PRICE_DOLLARS} →
          </Link>
        </div>
      </div>
    </div>
  );
}

function JobFilterSelect({
  label,
  name,
  value,
  children,
}: {
  label: string;
  name: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[9px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          defaultValue={value}
          className="h-8 pl-2 pr-6 text-[11px] focus:outline-none appearance-none cursor-pointer uppercase tracking-wide font-medium"
          style={{ border: "1px solid var(--input-border)", background: "var(--surface-1)", color: "var(--text-1)" }}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: "var(--text-3)" }}>▾</span>
      </div>
    </div>
  );
}
