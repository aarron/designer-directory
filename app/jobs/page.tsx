import { db } from "@/lib/db";
import { JobCard } from "@/components/JobCard";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

interface SearchParams {
  role?: string;
  level?: string;
  type?: string;
  remote?: string;
}

async function getJobs(params: SearchParams) {
  return db.job.findMany({
    where: {
      active: true,
      ...(params.role ? { role: params.role } : {}),
      ...(params.level ? { experienceLevel: params.level } : {}),
      ...(params.type ? { typeOfRole: params.type } : {}),
      ...(params.remote === "true" ? { remote: true } : {}),
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const jobs = await getJobs(params);
  const activeFilters = Object.values(params).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <h1 className="font-display text-display-md font-bold text-brand-black">Open design roles</h1>
          <p className="text-brand-gray-500 mt-2">
            {jobs.length} job{jobs.length !== 1 ? "s" : ""} posted
            {activeFilters > 0 ? " matching your filters" : ""}
          </p>
        </div>
        <Link href="/post-a-job">
          <Button className="gap-2 whitespace-nowrap">
            Post a Job — $249 <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <form className="mb-8 flex flex-wrap gap-3">
        <select
          name="role"
          defaultValue={params.role || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All roles</option>
          {PRIMARY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          name="level"
          defaultValue={params.level || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All experience levels</option>
          {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select
          name="type"
          defaultValue={params.type || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">Any type</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
          <option value="Part-time">Part-time</option>
        </select>

        <label className="h-9 px-3 flex items-center gap-2 text-sm border border-brand-gray-200 rounded bg-white cursor-pointer hover:border-brand-black transition-colors">
          <input type="checkbox" name="remote" value="true" defaultChecked={params.remote === "true"} className="rounded" />
          Remote
        </label>

        <button type="submit" className="h-9 px-4 text-sm font-medium bg-brand-black text-white rounded hover:bg-brand-gray-800 transition-colors">
          Filter
        </button>
        {activeFilters > 0 && (
          <Link href="/jobs" className="h-9 px-4 text-sm font-medium border border-brand-gray-200 rounded text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-colors flex items-center">
            Clear
          </Link>
        )}
      </form>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-brand-gray-400">
          <p className="text-lg font-medium">No jobs match your filters.</p>
          <p className="text-sm mt-2 mb-8">Try adjusting your filters or check back soon.</p>
          <Link href="/post-a-job">
            <Button variant="secondary">Post a Job</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} compact />)}
        </div>
      )}

      {/* Employer CTA */}
      <div className="mt-16 bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="font-display font-bold text-brand-black text-lg">Hiring a designer?</p>
          <p className="text-brand-gray-500 text-sm mt-1 max-w-md">
            Reach 230,000+ design professionals and get a curated shortlist of matched candidates.
          </p>
        </div>
        <Link href="/post-a-job" className="flex-shrink-0">
          <Button className="gap-2">Post a Job — $249 <ArrowRight className="w-4 h-4" /></Button>
        </Link>
      </div>
    </div>
  );
}
