"use client";

import { useState } from "react";

interface CompanyLogoProps {
  companyLogoUrl?: string | null;
  company: string;
  size?: number;
  className?: string;
}

/**
 * Company mark for the job detail page.
 *
 * Only ever renders the logo resolved and quality-checked at ingest
 * (see lib/job-enrichment.ts), falling back to initials. It deliberately does
 * not reach for a favicon service: Clearbit's free logo API was retired, and
 * Google's endpoint upscales a 32px favicon to whatever size you request,
 * which renders as a blurry smudge. Initials look intentional; that doesn't.
 */
export function CompanyLogo({ companyLogoUrl, company, size = 40, className = "" }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);

  const initials = company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!companyLogoUrl || failed) {
    return (
      <div
        style={{ width: size, height: size, minWidth: size, background: "var(--surface-2)" }}
        className={`rounded-md flex items-center justify-center ${className}`}
      >
        <span className="text-xs font-bold leading-none" style={{ color: "var(--text-3)" }}>{initials}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={companyLogoUrl}
      alt={`${company} logo`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, minWidth: size }}
      className={`rounded-md object-contain ${className}`}
    />
  );
}
