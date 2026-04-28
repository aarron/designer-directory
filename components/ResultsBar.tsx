"use client";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

interface ResultsBarProps {
  showing: number;
  total: number;
  sortOptions: { value: string; label: string }[];
}

export function ResultsBar({ showing, total, sortOptions }: ResultsBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams.get("view") || "grid";
  const currentSort = searchParams.get("sort") || "";

  const makeHref = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    return `${pathname}?${p.toString()}`;
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(makeHref("sort", e.target.value));
  };

  return (
    <div className="flex items-center justify-between py-3 border-t border-b border-brand-gray-100 mb-6">
      <p className="text-[11px] font-medium tracking-widest text-brand-gray-400 uppercase">
        SHOWING {showing} OF {total}
      </p>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium tracking-widest text-brand-gray-400 uppercase">SORT:</span>
          <select
            value={currentSort}
            onChange={handleSort}
            className="text-[11px] font-semibold text-brand-black bg-transparent border-none outline-none cursor-pointer appearance-none uppercase tracking-widest"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-brand-gray-400 text-[11px] -ml-1">▾</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium tracking-widest text-brand-gray-400 uppercase">VIEW:</span>
          <Link
            href={makeHref("view", "grid")}
            className={`text-[11px] font-semibold tracking-widest uppercase transition-colors ${currentView === "grid" ? "text-brand-black" : "text-brand-gray-400 hover:text-brand-black"}`}
          >
            GRID
          </Link>
          <span className="text-brand-gray-300 text-[11px]">·</span>
          <Link
            href={makeHref("view", "list")}
            className={`text-[11px] font-semibold tracking-widest uppercase transition-colors ${currentView === "list" ? "text-brand-black" : "text-brand-gray-400 hover:text-brand-black"}`}
          >
            LIST
          </Link>
        </div>
      </div>
    </div>
  );
}
