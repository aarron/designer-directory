import Link from "next/link";
import Image from "next/image";
import { ArtisticAvatar } from "@/components/ArtisticAvatar";
import { WORK_STATUS_LABELS } from "@/lib/utils";
import type { Designer } from "@prisma/client";

interface DesignerCardProps {
  designer: Designer;
  view?: "grid" | "list";
}

export function DesignerCard({ designer, view = "grid" }: DesignerCardProps) {
  const status = WORK_STATUS_LABELS[designer.openToWork];
  const name = `${designer.firstName} ${designer.lastName}`;

  if (view === "list") {
    return (
      <Link
        href={`/talent/${designer.id}`}
        className="bg-white border-b border-brand-gray-100 hover:bg-brand-gray-50 transition-colors group flex items-center gap-4 px-6 py-4"
      >
        <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-brand-gray-100">
          {designer.photoUrl ? (
            <Image
              src={designer.photoUrl}
              alt={name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <ArtisticAvatar seed={name} size={40} rounded="none" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-brand-black group-hover:text-brand-red transition-colors truncate text-sm">
            {name}<span className="text-brand-red">.</span>
          </p>
          <p className="text-xs text-brand-gray-500 truncate">
            {designer.title || designer.primaryRole}
            {designer.company ? ` · ${designer.company}` : ""}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6 flex-shrink-0 text-[11px] uppercase tracking-widest">
          <span className="text-brand-gray-500 font-medium">{designer.primaryRole}</span>
          <span className="text-brand-gray-400">{designer.experienceLevel}</span>
          <span
            className={`font-semibold ${
              designer.openToWork === "OPEN"
                ? "text-green-600"
                : "text-brand-gray-400"
            }`}
          >
            ● {status.label}
          </span>
        </div>
      </Link>
    );
  }

  // Grid view
  return (
    <Link
      href={`/talent/${designer.id}`}
      className="bg-white border border-brand-gray-100 hover:border-brand-gray-300 hover:shadow-md transition-all group block relative overflow-hidden animate-fade-in"
    >
      {/* Photo / Avatar — square, drives card height */}
      <div className="w-[28%] aspect-square relative bg-brand-gray-100 overflow-hidden">
        {designer.photoUrl ? (
          <Image
            src={designer.photoUrl}
            alt={name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 40vw, 20vw"
          />
        ) : (
          <ArtisticAvatar
            seed={name}
            size={300}
            rounded="none"
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>

      {/* Content — absolutely fills the right portion, clipped to avatar height */}
      <div className="absolute inset-0 left-[28%] overflow-hidden px-4 py-3 flex flex-col justify-between">

        {/* Name + subtitle */}
        <div className="min-w-0">
          <p className="font-display font-bold text-[18px] leading-tight text-brand-black group-hover:text-brand-red transition-colors truncate">
            {designer.firstName} {designer.lastName}<span className="text-brand-red">.</span>
          </p>
          {(designer.title || designer.company) && (
            <p className="text-[12px] italic text-brand-gray-500 mt-0.5 leading-snug truncate">
              {designer.title || designer.primaryRole}
              {designer.company && (
                <span className="not-italic font-semibold text-brand-gray-600"> · {designer.company}</span>
              )}
            </p>
          )}
        </div>

        {/* Role · Level — inline, no borders */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[12px] font-bold text-brand-red truncate">{designer.primaryRole}</span>
          <span className="text-brand-gray-300 flex-shrink-0">·</span>
          <span className="text-[12px] font-medium text-brand-gray-500 truncate">{designer.experienceLevel}</span>
        </div>

        {/* Status */}
        <span
          className={`text-[9px] font-bold tracking-widest uppercase ${
            designer.openToWork === "OPEN"
              ? "text-green-600"
              : designer.openToWork === "OPEN_SOON"
              ? "text-amber-500"
              : "text-brand-gray-400"
          }`}
        >
          ● {status.label}
        </span>

      </div>
    </Link>
  );
}
