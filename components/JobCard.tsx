"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@prisma/client";

const LOGO_PALETTES = [
  "#F2EDE4", "#A8D3EB", "#C7C3E7", "#F1B7C5",
  "#E7C451", "#8DD8C3", "#D3E749", "#E7833A",
];

function companyBg(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
  return LOGO_PALETTES[Math.abs(h) % LOGO_PALETTES.length];
}

// Logos are resolved and quality-checked at ingest, then mirrored into Blob
// (see lib/job-enrichment.ts). There is deliberately no client-side favicon
// fallback: those services return whatever low-res icon they have, upscaled,
// and a soft 32px smudge reads as broken where a clean lettermark reads as
// intentional. So it's the vetted logo or the lettermark, nothing in between.
type SquareStage = "explicit" | "initials";

export function CompanySquare({ companyLogoUrl, company, compact = false }: {
  companyLogoUrl?: string | null;
  company: string;
  /** Tighter padding + smaller lettermark for the 36px list-view square. */
  compact?: boolean;
}) {
  const [stage, setStage] = useState<SquareStage>(companyLogoUrl ? "explicit" : "initials");
  const bg = companyBg(company);
  const initial = company.trim()[0]?.toUpperCase() ?? "?";
  const handleError = () => setStage("initials");

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${compact ? "p-1" : "p-6"}`}
      style={{ backgroundColor: bg }}
    >
      {stage === "explicit" && companyLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={companyLogoUrl} alt={`${company} logo`} width={72} height={72} onError={handleError} className="object-contain w-full h-full" />
      ) : (
        <span
          className="font-display font-bold leading-none select-none"
          style={{
            fontSize: compact ? "1rem" : "clamp(2.5rem, 8cqi, 5rem)",
            color: "rgba(0,0,0,0.28)",
          }}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

/** Grid card. The dense list view lives in JobTable. */
export function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex items-start overflow-hidden animate-fade-in transition-all duration-[240ms] hover:-translate-y-[2px]"
      style={{ background: "var(--surface-1)", boxShadow: "var(--shadow-1)" }}
    >
      {/* Company square */}
      <div className="w-[28%] flex-shrink-0 aspect-square relative overflow-hidden container-type-inline">
        <CompanySquare companyLogoUrl={job.companyLogoUrl} company={job.company} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">

        {/* Title + company/location */}
        <div>
          <p className="font-display font-bold text-[22px] leading-tight transition-colors duration-[120ms] group-hover:text-[#FF4725]" style={{ color: "var(--text-1)" }}>
            {job.title}<span style={{ color: "#FF4725" }}>.</span>
          </p>
          <p className="text-[13px] italic mt-1 leading-snug truncate" style={{ color: "var(--text-3)" }}>
            {job.company}
            {job.location && (
              <span className="not-italic font-semibold" style={{ color: "var(--text-2)" }}> · {job.location}</span>
            )}
          </p>
        </div>

        {/* Role / Type — gap-px trick: colored parent + surface-1 children = hairline divider, no CSS border */}
        <div className="grid grid-cols-2" style={{ background: "var(--divider)", gap: "1px" }}>
          <div className="px-2.5 py-2" style={{ background: "var(--surface-1)" }}>
            <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>Role</p>
            <p className="text-[13px] font-bold leading-tight mt-0.5 truncate" style={{ color: "#FF4725" }}>{job.role}</p>
          </div>
          <div className="px-2.5 py-2" style={{ background: "var(--surface-1)" }}>
            <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>Type</p>
            <p className="text-[13px] font-bold leading-tight mt-0.5 truncate" style={{ color: "var(--text-1)" }}>{job.typeOfRole}</p>
          </div>
        </div>

        {/* Level + Remote — DS tagPill: mono 11px, pill, divider-strong border */}
        {job.experienceLevel && (
          <div className="flex flex-wrap gap-1">
            <span className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] rounded-full px-3 py-0.5" style={{ border: "1px solid var(--divider-strong)", color: "var(--text-2)" }}>
              {job.experienceLevel}
            </span>
            {job.remote && (
              <span className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] rounded-full px-3 py-0.5" style={{ border: "1px solid var(--divider-strong)", color: "var(--text-2)" }}>
                Remote OK
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-1 flex items-center justify-between gap-2">
          {job.featured ? (
            <span className="font-mono text-[11px] font-normal uppercase tracking-[0.12em]" style={{ color: "#FF4725" }}>★ Featured</span>
          ) : <span />}
          <span className="font-mono text-[11px] font-normal" style={{ color: "var(--text-3)" }}>
            {formatDate(job.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
