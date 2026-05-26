"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@prisma/client";

// Derive a stable light background color from the company name
const LOGO_PALETTES = [
  "#F2EDE4", "#A8D3EB", "#C7C3E7", "#F1B7C5",
  "#E7C451", "#8DD8C3", "#D3E749", "#E7833A",
];

function companyBg(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return LOGO_PALETTES[Math.abs(h) % LOGO_PALETTES.length];
}

function getDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; }
}

type SquareStage = "explicit" | "clearbit" | "favicon" | "initials";

function CompanySquare({ companyUrl, companyLogoUrl, company }: { companyUrl?: string | null; companyLogoUrl?: string | null; company: string }) {
  const initialStage: SquareStage = companyLogoUrl ? "explicit" : "clearbit";
  const [stage, setStage] = useState<SquareStage>(initialStage);
  const domain = getDomain(companyUrl);
  const bg = companyBg(company);
  const initial = company.trim()[0]?.toUpperCase() ?? "?";

  const src =
    stage === "explicit"
      ? companyLogoUrl!
      : stage === "clearbit"
      ? `https://logo.clearbit.com/${domain}`
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;

  const handleError = () => {
    if (stage === "explicit") setStage(domain ? "clearbit" : "initials");
    else if (stage === "clearbit") setStage("favicon");
    else setStage("initials");
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6" style={{ backgroundColor: bg }}>
      {stage !== "initials" && (domain || companyLogoUrl) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${company} logo`}
          width={72}
          height={72}
          onError={handleError}
          className="object-contain w-full h-full"
        />
      ) : (
        <span
          className="font-display font-bold leading-none select-none"
          style={{ fontSize: "clamp(2.5rem, 8cqi, 5rem)", color: "rgba(0,0,0,0.18)" }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="bg-white border border-brand-gray-100 hover:border-brand-gray-300 hover:shadow-md transition-all group flex items-start overflow-hidden animate-fade-in"
    >
      {/* Company square — same proportion as DesignerCard photo */}
      <div className="w-[28%] flex-shrink-0 aspect-square relative overflow-hidden container-type-inline">
        <CompanySquare companyUrl={job.companyUrl} companyLogoUrl={job.companyLogoUrl} company={job.company} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">

        {/* Title + company/location */}
        <div>
          <p className="font-display font-bold text-[22px] leading-tight text-brand-black group-hover:text-brand-red transition-colors">
            {job.title}<span className="text-brand-red">.</span>
          </p>
          <p className="text-[13px] italic text-brand-gray-500 mt-1 leading-snug truncate">
            {job.company}
            {job.location && (
              <span className="not-italic font-semibold text-brand-gray-600"> · {job.location}</span>
            )}
          </p>
        </div>

        {/* Role / Type grid — mirrors DesignerCard's Role / Level */}
        <div className="grid grid-cols-2 border border-brand-gray-100">
          <div className="px-2.5 py-2 border-r border-brand-gray-100">
            <p className="text-[8px] uppercase tracking-widest text-brand-gray-400 font-semibold">Role</p>
            <p className="text-[13px] font-bold text-brand-red leading-tight mt-0.5 truncate">{job.role}</p>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-widest text-brand-gray-400 font-semibold">Type</p>
            <p className="text-[13px] font-bold text-brand-black leading-tight mt-0.5 truncate">{job.typeOfRole}</p>
          </div>
        </div>

        {/* Level */}
        {job.experienceLevel && (
          <div className="flex flex-wrap gap-1">
            <span className="text-[9px] px-1.5 py-0.5 bg-brand-gray-50 border border-brand-gray-100 text-brand-gray-600 uppercase tracking-wide font-semibold">
              {job.experienceLevel}
            </span>
            {job.remote && (
              <span className="text-[9px] px-1.5 py-0.5 bg-brand-gray-50 border border-brand-gray-100 text-brand-gray-600 uppercase tracking-wide font-semibold">
                Remote OK
              </span>
            )}
          </div>
        )}

        {/* Footer — featured + date */}
        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          {job.featured ? (
            <span className="text-[9px] font-bold tracking-widest uppercase text-brand-red">
              ★ Featured
            </span>
          ) : (
            <span />
          )}
          <span className="text-[9px] text-brand-gray-400">
            {formatDate(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
