import { db } from "@/lib/db";
import Link from "next/link";
import { DesignerCard } from "@/components/DesignerCard";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS } from "@/lib/utils";
import { WorkStatus } from "@prisma/client";

interface SearchParams {
  role?: string;
  level?: string;
  status?: string;
  location?: string;
  type?: string;
}

async function getDesigners(params: SearchParams) {
  return db.designer.findMany({
    where: {
      publicProfile: true,
      ...(params.role ? { primaryRole: params.role } : {}),
      ...(params.level ? { experienceLevel: params.level } : {}),
      ...(params.status ? { openToWork: params.status as WorkStatus } : {}),
      ...(params.location
        ? { location: { contains: params.location, mode: "insensitive" } }
        : {}),
      ...(params.type ? { typeOfRole: { has: params.type } } : {}),
    },
    orderBy: [
      { openToWork: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export default async function TalentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const designers = await getDesigners(params);

  const activeFilters = Object.values(params).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-display-md font-bold text-brand-black">
          Design talent directory
        </h1>
        <p className="text-brand-gray-500 mt-2">
          {designers.length} designer{designers.length !== 1 ? "s" : ""} in the directory
          {activeFilters > 0 ? " matching your filters" : ""}
        </p>
      </div>

      {/* Filters */}
      <form className="mb-10 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={params.status || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All availability</option>
          <option value="OPEN">Open to work</option>
          <option value="OPEN_SOON">Open in 3 months</option>
          <option value="NOT_LOOKING">Not looking</option>
        </select>

        <select
          name="role"
          defaultValue={params.role || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All roles</option>
          {PRIMARY_ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          name="level"
          defaultValue={params.level || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">All experience levels</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          name="type"
          defaultValue={params.type || ""}
          className="h-9 pl-3 pr-8 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none appearance-none cursor-pointer"
        >
          <option value="">Any work type</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
          <option value="Part-time">Part-time</option>
          <option value="Advising">Advising</option>
        </select>

        <input
          type="text"
          name="location"
          defaultValue={params.location || ""}
          placeholder="Location..."
          className="h-9 px-3 text-sm border border-brand-gray-200 rounded bg-white text-brand-black focus:border-brand-black focus:outline-none"
        />

        <button
          type="submit"
          className="h-9 px-4 text-sm font-medium bg-brand-black text-white rounded hover:bg-brand-gray-800 transition-colors"
        >
          Filter
        </button>

        {activeFilters > 0 && (
          <Link
            href="/talent"
            className="h-9 px-4 text-sm font-medium border border-brand-gray-200 rounded text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-colors flex items-center"
          >
            Clear filters
          </Link>
        )}
      </form>

      {designers.length === 0 ? (
        <div className="text-center py-20 text-brand-gray-400">
          <p className="text-lg font-medium">No designers match your filters.</p>
          <p className="text-sm mt-2">Try adjusting or clearing your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {designers.map((designer) => (
            <DesignerCard key={designer.id} designer={designer} />
          ))}
        </div>
      )}
    </div>
  );
}
