import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import { JobCard } from "@/components/JobCard";
import { ResultsBar } from "@/components/ResultsBar";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS } from "@/lib/utils";

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
  const jobs = await getJobs(params);
  const total = await db.job.count({ where: { active: true } });

  const view = params.view === "list" ? "list" : "grid";
  const activeFilters = Object.entries(params)
    .filter(([k]) => !["sort", "view"].includes(k))
    .filter(([, v]) => Boolean(v)).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">

        {/* Hero */}
        <div className="flex items-end justify-between mb-10 border-b border-brand-gray-100 pb-10">
          <div>
            <h1 className="font-display text-display-lg font-bold text-brand-black leading-none">
              Open design roles<span className="text-brand-red">.</span>
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-brand-gray-400 font-semibold mt-3">
              Jobs · Design Better Careers
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 ml-8">
            <div className="text-right">
              <p className="font-display font-bold text-display-md text-brand-red leading-none">{total}</p>
              <p className="text-[11px] uppercase tracking-widest text-brand-gray-400 font-semibold mt-1">Roles open</p>
            </div>
            <div className="hidden md:flex flex-col gap-2">
              <Link
                href="/post-a-job"
                className="inline-flex items-center gap-2 bg-brand-black text-white text-[11px] uppercase tracking-widest font-bold px-5 py-3 rounded hover:bg-brand-gray-800 transition-colors whitespace-nowrap"
              >
                Post a Job — $249 →
              </Link>
              <Link
                href="/jobs/manage"
                className="text-[11px] text-brand-gray-400 hover:text-brand-black transition-colors text-center uppercase tracking-widest font-medium"
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
              <label className="text-[9px] uppercase tracking-widest text-brand-gray-400 font-semibold">Remote</label>
              <label className="h-8 px-3 flex items-center gap-2 text-[11px] border border-brand-gray-200 bg-white cursor-pointer hover:border-brand-black transition-colors uppercase tracking-wide font-medium">
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
                className="h-8 px-4 text-[11px] uppercase tracking-widest font-bold text-white bg-brand-black hover:bg-brand-gray-800 transition-colors"
              >
                Filter
              </button>
              {activeFilters > 0 && (
                <Link
                  href="/jobs"
                  className="h-8 px-3 text-[11px] uppercase tracking-widest font-medium border border-brand-gray-200 text-brand-gray-500 hover:border-brand-black hover:text-brand-black transition-colors flex items-center"
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
          />
        </Suspense>

        {/* Grid / List */}
        {jobs.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display font-bold text-display-sm text-brand-black">
              No roles match<span className="text-brand-red">.</span>
            </p>
            <p className="text-brand-gray-500 text-sm mt-3">
              Try adjusting your filters or check back soon.
            </p>
            {activeFilters > 0 && (
              <Link
                href="/jobs"
                className="inline-block mt-6 text-[11px] uppercase tracking-widest font-bold border border-brand-gray-200 px-5 py-2.5 hover:border-brand-black transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Employer CTA */}
        <div className="mt-20 border-t border-brand-gray-100 pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-display font-bold text-display-sm text-brand-black">
              Hiring a designer?<span className="text-brand-red">.</span>
            </p>
            <p className="text-brand-gray-500 text-sm mt-2 max-w-md">
              Reach 230,000+ design professionals and get a curated shortlist of matched candidates.
            </p>
          </div>
          <Link
            href="/post-a-job"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-black text-white text-[11px] uppercase tracking-widest font-bold px-6 py-3.5 rounded hover:bg-brand-gray-800 transition-colors whitespace-nowrap"
          >
            Post a Job — $249 →
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
      <label className="text-[9px] uppercase tracking-widest text-brand-gray-400 font-semibold">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          defaultValue={value}
          className={`h-8 pl-2 pr-6 text-[11px] border border-brand-gray-200 bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer uppercase tracking-wide font-medium ${value ? "border-brand-black" : ""}`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-gray-400 text-[10px]">▾</span>
      </div>
    </div>
  );
}
