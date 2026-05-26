import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPin, Building2, DollarSign, ArrowLeft, ExternalLink, Clock, Globe, Settings } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await db.job.findUnique({ where: { id } });
  if (!job) return {};
  return {
    title: `${job.title} at ${job.company} | Design Better Careers`,
    description: `${job.title} — ${job.typeOfRole} role at ${job.company} in ${job.location}. Browse and apply on Design Better Careers.`,
  };
}

async function incrementView(id: string) {
  await db.job.update({ where: { id }, data: { viewCount: { increment: 1 } } });
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;
  const job = await db.job.findUnique({ where: { id } });

  if (!job) notFound();

  const isOwner = !!token && token === job.manageToken;

  // Only count views for live jobs when viewer is not the owner
  if (job.active && !isOwner) await incrementView(id);

  const manageUrl = `/api/jobs/close?token=${job.manageToken}`;
  const isExpired = job.expiresAt ? job.expiresAt < new Date() : false;

  return (
    <div className="min-h-screen bg-brand-gray-50">

      {/* Owner management bar */}
      {isOwner && (
        <div className="bg-brand-black border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-white">
              <Settings className="w-4 h-4 text-brand-gray-400 flex-shrink-0" />
              <span className="text-brand-gray-300">
                <strong className="text-white">Your listing</strong>
                {job.active && job.expiresAt && !isExpired && (
                  <> · Active until {formatDate(job.expiresAt)}</>
                )}
                {isExpired && <> · <span className="text-red-400">Expired</span></>}
                {!job.active && !isExpired && <> · <span className="text-amber-400">Pending activation</span></>}
                {job.viewCount > 0 && <> · {job.viewCount} view{job.viewCount !== 1 ? "s" : ""}</>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a href={`/jobs/${job.id}`} className="text-xs text-brand-gray-400 hover:text-white transition-colors">
                Public view
              </a>
              {job.active && (
                <a
                  href={manageUrl}
                  className="inline-flex items-center h-8 px-3 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Mark as filled
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment pending banner */}
      {!job.active && !isOwner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-amber-800">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span><strong>Payment pending.</strong> This listing will go live once payment is confirmed.</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-brand-gray-500 hover:text-brand-black transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        {/* Hero */}
        <div className="bg-brand-black rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full translate-x-32 -translate-y-32" />
          <div className="relative">
            {job.featured && (
              <div className="mb-4">
                <Badge variant="red">Featured</Badge>
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <CompanyLogo companyUrl={job.companyUrl} companyLogoUrl={job.companyLogoUrl} company={job.company} size={52} className="border-white/20" />
              <div>
                <h1 className="font-display text-display-sm font-bold text-white leading-tight">{job.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {job.companyUrl ? (
                    <a
                      href={job.companyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-gray-300 text-lg font-medium hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      {job.company}
                      <Globe className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  ) : (
                    <p className="text-brand-gray-300 text-lg font-medium">{job.company}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-5">
              <div className="flex items-center gap-1.5 text-brand-gray-400 text-sm">
                <MapPin className="w-4 h-4" />
                {job.location}{job.remote ? " · Remote OK" : ""}
              </div>
              <div className="flex items-center gap-1.5 text-brand-gray-400 text-sm">
                <Building2 className="w-4 h-4" />
                {job.companySize ? `${job.companySize} employees` : "Company size not listed"}
              </div>
              {job.compensation && (
                <div className="flex items-center gap-1.5 text-brand-gray-400 text-sm">
                  <DollarSign className="w-4 h-4" />
                  {job.compensation}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              <Badge variant="gray">{job.typeOfRole}</Badge>
              <Badge variant="gray">{job.experienceLevel}</Badge>
              <Badge variant="gray">{job.role}</Badge>
              {job.remote && <Badge variant="green">Remote</Badge>}
              {job.visaSponsorship && <Badge variant="yellow">Visa sponsorship available</Badge>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Description */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {job.description && (
              <div className="bg-white border border-brand-gray-100 rounded-xl p-6">
                <h2 className="font-display font-bold text-brand-black mb-4">About this role</h2>
                <div className="text-brand-gray-600 leading-relaxed preserve-formatting text-sm">
                  {job.description}
                </div>
              </div>
            )}

            {job.jobUrl && (
              <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-6">
                <p className="text-sm text-brand-gray-500 mb-4">
                  For full details and to apply, visit the official job listing:
                </p>
                <a href={job.jobUrl} target="_blank" rel="noreferrer">
                  <Button className="gap-2">
                    Apply Now <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Apply */}
            {job.jobUrl && (
              <div className="bg-white border border-brand-gray-100 rounded-xl p-5">
                <p className="font-semibold text-brand-black mb-3">Ready to apply?</p>
                <a href={job.jobUrl} target="_blank" rel="noreferrer">
                  <Button size="sm" className="w-full gap-2">
                    View Full Listing <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            )}

            {/* Details */}
            <div className="bg-white border border-brand-gray-100 rounded-xl p-5">
              <h3 className="font-semibold text-brand-black mb-4">Job details</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Role type</p>
                  <p className="text-brand-black">{job.typeOfRole}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Experience level</p>
                  <p className="text-brand-black">{job.experienceLevel}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Category</p>
                  <p className="text-brand-black">{job.role}</p>
                </div>
                {job.compensation && (
                  <div>
                    <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Compensation</p>
                    <p className="text-brand-black">{job.compensation}</p>
                  </div>
                )}
                {job.companyUrl && (
                  <div>
                    <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Company</p>
                    <a
                      href={job.companyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-red hover:underline text-sm flex items-center gap-1"
                    >
                      Visit website <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Posted</p>
                  <p className="text-brand-black">{formatDate(job.createdAt)}</p>
                </div>
                {job.expiresAt && (
                  <div>
                    <p className="text-xs text-brand-gray-400 uppercase tracking-wide font-medium mb-1">Active until</p>
                    <p className={isExpired ? "text-red-600" : "text-brand-black"}>{formatDate(job.expiresAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner manage card — only shown with valid token */}
            {isOwner && (
              <div className="bg-brand-gray-50 border border-brand-gray-200 rounded-xl p-5">
                <p className="font-semibold text-brand-black mb-1 text-sm">Manage this listing</p>
                <p className="text-xs text-brand-gray-500 mb-4">Role filled or no longer hiring? Remove it from the board.</p>
                {job.active ? (
                  <a href={manageUrl}>
                    <Button size="sm" variant="secondary" className="w-full">
                      Mark as filled
                    </Button>
                  </a>
                ) : (
                  <p className="text-xs text-brand-gray-400">This listing is not currently active.</p>
                )}
                <p className="text-xs text-brand-gray-400 mt-3">
                  Questions? Email{" "}
                  <a href="mailto:careers@thecuriositydepartment.com" className="underline hover:text-brand-black">
                    careers@thecuriositydepartment.com
                  </a>
                </p>
              </div>
            )}

            {/* Browse talent CTA */}
            <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5">
              <p className="text-sm font-semibold text-brand-black mb-2">Browse our talent pool</p>
              <p className="text-xs text-brand-gray-500 mb-3">200+ senior designers actively looking for their next role.</p>
              <Link href="/talent">
                <Button size="sm" variant="secondary" className="w-full">Browse Designers</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
