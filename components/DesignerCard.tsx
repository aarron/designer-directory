import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { MapPin } from "lucide-react";
import { WORK_STATUS_LABELS } from "@/lib/utils";
import type { Designer } from "@prisma/client";

interface DesignerCardProps {
  designer: Designer;
}

export function DesignerCard({ designer }: DesignerCardProps) {
  const status = WORK_STATUS_LABELS[designer.openToWork];

  return (
    <Link
      href={`/talent/${designer.id}`}
      className="bg-white rounded-lg border border-brand-gray-100 hover:border-brand-gray-300 hover:shadow-md transition-all p-5 flex flex-col gap-4 group animate-fade-in"
    >
      <div className="flex items-start gap-4">
        {designer.photoUrl ? (
          <Image
            src={designer.photoUrl}
            alt={`${designer.firstName} ${designer.lastName}`}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-brand-gray-100"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-gray-100 flex items-center justify-center flex-shrink-0 ring-2 ring-brand-gray-100">
            <span className="font-display font-bold text-brand-gray-400 text-xl">
              {designer.firstName[0]}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-brand-black group-hover:text-brand-red transition-colors truncate">
            {designer.firstName} {designer.lastName}
          </p>
          <p className="text-sm text-brand-gray-500 truncate mt-0.5">
            {designer.title || designer.primaryRole}
            {designer.company ? ` · ${designer.company}` : ""}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-3 h-3 text-brand-gray-400" />
            <p className="text-xs text-brand-gray-400 truncate">{designer.location}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant={status.color as "green" | "yellow" | "gray"}>{status.label}</Badge>
        <Badge variant="gray">{designer.experienceLevel}</Badge>
        {designer.primaryRole && <Badge variant="gray">{designer.primaryRole}</Badge>}
      </div>
    </Link>
  );
}
