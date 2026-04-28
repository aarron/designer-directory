"use client";

import { useState } from "react";

function getDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

interface CompanyLogoProps {
  companyUrl?: string | null;
  company: string;
  size?: number;
  className?: string;
}

export function CompanyLogo({ companyUrl, company, size = 40, className = "" }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(companyUrl);

  const initials = company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!domain || failed) {
    return (
      <div
        style={{ width: size, height: size, minWidth: size }}
        className={`rounded-lg bg-brand-gray-100 flex items-center justify-center ${className}`}
      >
        <span className="text-xs font-bold text-brand-gray-500 leading-none">{initials}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={`${company} logo`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, minWidth: size }}
      className={`rounded-lg object-contain bg-white border border-brand-gray-100 ${className}`}
    />
  );
}
