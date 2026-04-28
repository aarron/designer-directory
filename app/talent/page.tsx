import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";
import { DesignerCard } from "@/components/DesignerCard";
import { ResultsBar } from "@/components/ResultsBar";
import {
  PRIMARY_ROLES,
  EXPERIENCE_LEVELS,
  DESIGN_SKILLS,
  INDUSTRIES,
  START_AVAILABILITY,
  REMOTE_PREFERENCES,
  LOCATIONS,
  LOCATION_ALIASES,
} from "@/lib/utils";
import { WorkStatus } from "@prisma/client";

interface SearchParams {
  q?: string;
  role?: string;
  level?: string;
  status?: string;
  location?: string;
  type?: string;
  skill?: string;
  industry?: string;
  start?: string;
  remote?: string;
  sort?: string;
  view?: string;
}

const SORT_OPTIONS = [
  { value: "", label: "RANDOM" },
  { value: "recent", label: "RECENTLY UPDATED" },
];

async function getDesigners(params: SearchParams) {
  const q = params.q?.trim();
  const sortByRecent = params.sort === "recent";

  const designers = await db.designer.findMany({
    where: {
      publicProfile: true,
      hidden: false,
      NOT: { openToWork: "NOT_LOOKING" },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" as const } },
              { lastName: { contains: q, mode: "insensitive" as const } },
              { title: { contains: q, mode: "insensitive" as const } },
              { company: { contains: q, mode: "insensitive" as const } },
              { primaryRole: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(params.role ? { primaryRole: params.role } : {}),
      ...(params.level ? { experienceLevel: params.level } : {}),
      ...(params.status ? { openToWork: params.status as WorkStatus } : {}),
      ...(params.location
        ? {
            OR: [params.location, ...(LOCATION_ALIASES[params.location] ?? [])].map(
              (term) => ({ location: { contains: term, mode: "insensitive" as const } })
            ),
          }
        : {}),
      ...(params.type ? { typeOfRole: { has: params.type } } : {}),
      ...(params.skill ? { skills: { has: params.skill } } : {}),
      ...(params.industry ? { industries: { has: params.industry } } : {}),
      ...(params.start ? { startAvailability: params.start } : {}),
      ...(params.remote ? { remotePreference: params.remote } : {}),
    },
    orderBy: sortByRecent ? [{ createdAt: "desc" }] : undefined,
  });

  // Default order is random — shuffle server-side on every request
  if (!sortByRecent) {
    for (let i = designers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [designers[i], designers[j]] = [designers[j], designers[i]];
    }
  }

  return designers;
}

const SELECT_BASE =
  "h-8 pl-2 pr-7 text-[11px] border border-brand-gray-200 bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer uppercase tracking-wide font-medium";

export default async function TalentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const designers = await getDesigners(params);
  const total = await db.designer.count({ where: { publicProfile: true, hidden: false, NOT: { openToWork: "NOT_LOOKING" } } });

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
            <h1 className="font-display text-display-lg md:text-display-xl font-bold text-brand-black leading-none">
              Design talent directory<span className="text-brand-red">.</span>
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-brand-gray-400 font-semibold mt-3">
              Designers · Open to work
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-8">
            <p className="font-display font-bold text-display-md text-brand-red leading-none">{total}</p>
            <p className="text-[11px] uppercase tracking-widest text-brand-gray-400 font-semibold mt-1">In directory</p>
          </div>
        </div>

        {/* Search bar */}
        <form className="mb-8">
          <div className="flex items-stretch border border-brand-gray-200 bg-white hover:border-brand-gray-400 transition-colors focus-within:border-brand-black">
            <span className="flex items-center px-4 text-[11px] uppercase tracking-widest text-brand-gray-400 font-semibold border-r border-brand-gray-200 bg-brand-gray-50 flex-shrink-0">
              Search
            </span>
            <input
              type="search"
              name="q"
              defaultValue={params.q || ""}
              placeholder="Name, title, or company..."
              className="flex-1 h-12 px-4 text-sm text-brand-black placeholder:text-brand-gray-300 bg-transparent focus:outline-none"
            />
            {/* Preserve other params */}
            {params.role && <input type="hidden" name="role" value={params.role} />}
            {params.level && <input type="hidden" name="level" value={params.level} />}
            {params.status && <input type="hidden" name="status" value={params.status} />}
            {params.location && <input type="hidden" name="location" value={params.location} />}
            {params.type && <input type="hidden" name="type" value={params.type} />}
            {params.skill && <input type="hidden" name="skill" value={params.skill} />}
            {params.industry && <input type="hidden" name="industry" value={params.industry} />}
            {params.start && <input type="hidden" name="start" value={params.start} />}
            {params.remote && <input type="hidden" name="remote" value={params.remote} />}
            {params.sort && <input type="hidden" name="sort" value={params.sort} />}
            {params.view && <input type="hidden" name="view" value={params.view} />}
            <button
              type="submit"
              className="px-6 text-[11px] uppercase tracking-widest font-bold text-white bg-brand-black hover:bg-brand-gray-800 transition-colors flex-shrink-0"
            >
              Search →
            </button>
          </div>
        </form>

        {/* Filter row */}
        <form className="mb-8">
          {params.q && <input type="hidden" name="q" value={params.q} />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          {params.view && <input type="hidden" name="view" value={params.view} />}
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            <FilterSelect label="Availability" name="status" value={params.status || ""}>
              <option value="">All</option>
              <option value="OPEN">Open now</option>
              <option value="OPEN_SOON">Open soon</option>
            </FilterSelect>

            <FilterSelect label="Role" name="role" value={params.role || ""}>
              <option value="">All</option>
              {PRIMARY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </FilterSelect>

            <FilterSelect label="Experience" name="level" value={params.level || ""}>
              <option value="">All</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </FilterSelect>

            <FilterSelect label="Work type" name="type" value={params.type || ""}>
              <option value="">All</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
              <option value="Advising">Advising</option>
            </FilterSelect>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-widest text-brand-gray-400 font-semibold">Location</label>
              <input
                type="text"
                name="location"
                defaultValue={params.location || ""}
                placeholder="Any"
                list="location-suggestions"
                className="h-8 px-2 text-[11px] border border-brand-gray-200 bg-white text-brand-black focus:border-brand-black focus:outline-none w-28 uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal placeholder:text-brand-gray-300"
              />
              <datalist id="location-suggestions">
                {LOCATIONS.filter((l) => l !== "Other").map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <FilterSelect label="Skill" name="skill" value={params.skill || ""}>
              <option value="">All</option>
              {DESIGN_SKILLS.map((s) => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>

            <FilterSelect label="Industry" name="industry" value={params.industry || ""}>
              <option value="">All</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </FilterSelect>

            <FilterSelect label="Remote" name="remote" value={params.remote || ""}>
              <option value="">Any</option>
              {REMOTE_PREFERENCES.map((r) => <option key={r} value={r}>{r}</option>)}
            </FilterSelect>

            <FilterSelect label="Start date" name="start" value={params.start || ""}>
              <option value="">Any</option>
              {START_AVAILABILITY.map((s) => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>

            <div className="flex items-end gap-2 pb-0">
              <button
                type="submit"
                className="h-8 px-4 text-[11px] uppercase tracking-widest font-bold text-white bg-brand-black hover:bg-brand-gray-800 transition-colors"
              >
                Filter
              </button>
              {activeFilters > 0 && (
                <Link
                  href="/talent"
                  className="h-8 px-3 text-[11px] uppercase tracking-widest font-medium border border-brand-gray-200 text-brand-gray-500 hover:border-brand-black hover:text-brand-black transition-colors flex items-center"
                >
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>

        {/* Results bar (client — sort + view toggle) */}
        <Suspense>
          <ResultsBar
            showing={designers.length}
            total={total}
            sortOptions={SORT_OPTIONS}
          />
        </Suspense>

        {/* Grid / List */}
        {designers.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display font-bold text-display-sm text-brand-black">
              No designers match<span className="text-brand-red">.</span>
            </p>
            <p className="text-brand-gray-500 text-sm mt-3">Try adjusting or clearing your filters.</p>
            {activeFilters > 0 && (
              <Link
                href="/talent"
                className="inline-block mt-6 text-[11px] uppercase tracking-widest font-bold border border-brand-gray-200 px-5 py-2.5 hover:border-brand-black transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : view === "list" ? (
          <div className="border border-brand-gray-100 overflow-hidden">
            {designers.map((designer) => (
              <DesignerCard key={designer.id} designer={designer} view="list" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {designers.map((designer) => (
              <DesignerCard key={designer.id} designer={designer} view="grid" />
            ))}
          </div>
        )}

        {/* Join CTA */}
        <div className="mt-20 border-t border-brand-gray-100 pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-display font-bold text-display-sm text-brand-black">
              Are you a designer?<span className="text-brand-red">.</span>
            </p>
            <p className="text-brand-gray-500 text-sm mt-2 max-w-md">
              Join the directory and get discovered by teams hiring for design roles.
            </p>
          </div>
          <Link
            href="/join"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-black text-white text-[11px] uppercase tracking-widest font-bold px-6 py-3.5 rounded hover:bg-brand-gray-800 transition-colors"
          >
            Join the Directory →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
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
          className={`h-8 pl-2 pr-6 text-[11px] border border-brand-gray-200 bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer uppercase tracking-wide font-medium ${value ? "border-brand-black text-brand-black" : ""}`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-brand-gray-400 text-[10px]">▾</span>
      </div>
    </div>
  );
}
