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
        <div className={`w-10 h-10 flex-shrink-0 overflow-hidden bg-brand-gray-100 ${designer.photoUrl ? "rounded-full" : ""}`}>
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
      className="bg-white border border-brand-gray-100 hover:border-brand-gray-300 hover:shadow-md transition-all group flex items-start overflow-hidden animate-fade-in"
    >
      {/* Photo / Avatar — square, never stretches taller than wide */}
      <div className="w-[28%] flex-shrink-0 aspect-square relative bg-brand-gray-100 overflow-hidden">
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

      {/* Content */}
      <div className="flex-1 min-w-0 p-4 flex flex-col gap-2.5">

        {/* Name + subtitle */}
        <div>
          <p className="font-display font-bold text-[22px] leading-tight text-brand-black group-hover:text-brand-red transition-colors">
            {designer.firstName} {designer.lastName}<span className="text-brand-red">.</span>
          </p>
          {(designer.title || designer.company) && (
            <p className="text-[13px] italic text-brand-gray-500 mt-1 leading-snug truncate">
              {designer.title || designer.primaryRole}
              {designer.company && (
                <span className="not-italic font-semibold text-brand-gray-600"> · {designer.company}</span>
              )}
            </p>
          )}
        </div>

        {/* Role / Level grid */}
        <div className="grid grid-cols-2 border border-brand-gray-100">
          <div className="px-2.5 py-2 border-r border-brand-gray-100">
            <p className="text-[8px] uppercase tracking-widest text-brand-gray-400 font-semibold">Role</p>
            <p className="text-[13px] font-bold text-brand-red leading-tight mt-0.5 truncate">{designer.primaryRole}</p>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-[8px] uppercase tracking-widest text-brand-gray-400 font-semibold">Level</p>
            <p className="text-[13px] font-bold text-brand-black leading-tight mt-0.5 truncate">{designer.experienceLevel}</p>
          </div>
        </div>

        {/* Skills */}
        {designer.skills && designer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {designer.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[9px] px-1.5 py-0.5 bg-brand-gray-50 border border-brand-gray-100 text-brand-gray-600 uppercase tracking-wide font-semibold"
              >
                {skill}
              </span>
            ))}
            {designer.skills.length > 3 && (
              <span className="text-[9px] px-1 py-0.5 text-brand-gray-400">
                +{designer.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Status — pinned to bottom */}
        <div className="mt-auto pt-1">
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
      </div>
    </Link>
  );
}
