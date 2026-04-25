import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Job } from "@prisma/client";

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

export function JobCard({ job, compact = false }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="bg-white rounded-lg border border-brand-gray-100 hover:border-brand-gray-300 hover:shadow-md transition-all group block"
    >
      {compact ? (
        <div className="flex items-center justify-between px-5 py-4">
          <div className="min-w-0">
            <p className="font-semibold text-brand-black group-hover:text-brand-red transition-colors">
              {job.title}
            </p>
            <p className="text-sm text-brand-gray-500 mt-0.5">
              {job.company} · {job.location}{job.remote ? " (Remote OK)" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <Badge variant="gray">{job.typeOfRole}</Badge>
            <ArrowRight className="w-4 h-4 text-brand-gray-300 group-hover:text-brand-red transition-colors" />
          </div>
        </div>
      ) : (
        <div className="p-5 flex flex-col gap-3">
          <div>
            <p className="font-semibold text-brand-black group-hover:text-brand-red transition-colors">
              {job.title}
            </p>
            <p className="text-sm font-medium text-brand-gray-600 mt-0.5">{job.company}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="gray">{job.typeOfRole}</Badge>
            <Badge variant="gray">{job.experienceLevel}</Badge>
            {job.remote && <Badge variant="green">Remote</Badge>}
          </div>
          <div className="flex items-center justify-between text-xs text-brand-gray-400">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{job.location}</span>
            </div>
            <span>{formatDate(job.createdAt)}</span>
          </div>
        </div>
      )}
    </Link>
  );
}
