import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WORK_STATUS_LABELS } from "@/lib/utils";
import { Linkedin, Globe, MapPin, Building2, ArrowLeft, Share2 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const designer = await db.designer.findUnique({ where: { id } });
  if (!designer) return {};

  const name = `${designer.firstName} ${designer.lastName}`;
  const title = designer.title || designer.primaryRole;
  const description = designer.bio?.slice(0, 160) || `${name} — ${title} on Design Better Careers`;

  return {
    title: `${name} — ${title} | Design Better Careers`,
    description,
    openGraph: {
      title: `${name} — ${title}`,
      description,
      type: "profile",
      images: designer.photoUrl ? [{ url: designer.photoUrl, width: 400, height: 400 }] : [],
    },
    twitter: {
      card: "summary",
      title: `${name} — ${title}`,
      description,
      images: designer.photoUrl ? [designer.photoUrl] : [],
    },
  };
}

export default async function DesignerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const designer = await db.designer.findUnique({ where: { id } });

  if (!designer || !designer.publicProfile) notFound();

  const status = WORK_STATUS_LABELS[designer.openToWork];
  const name = `${designer.firstName} ${designer.lastName}`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/talent" className="inline-flex items-center gap-2 text-sm text-brand-gray-500 hover:text-brand-black transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to directory
      </Link>

      {/* Hero card */}
      <div className="bg-brand-black rounded-xl p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full translate-x-32 -translate-y-32" />
        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            {designer.photoUrl ? (
              <Image
                src={designer.photoUrl}
                alt={name}
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover ring-4 ring-brand-gray-800"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-brand-gray-800 flex items-center justify-center ring-4 ring-brand-gray-700">
                <span className="font-display font-bold text-brand-gray-400 text-4xl md:text-5xl">
                  {designer.firstName[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant={status.color as "green" | "yellow" | "gray"}>{status.label}</Badge>
            </div>
            <h1 className="font-display text-display-sm font-bold text-white mb-1">{name}</h1>
            <p className="text-brand-gray-300 text-lg">
              {designer.title || designer.primaryRole}
              {designer.company ? ` at ${designer.company}` : ""}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              {designer.location && (
                <div className="flex items-center gap-1.5 text-brand-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{designer.location}</span>
                </div>
              )}
              {designer.linkedinUrl && (
                <a
                  href={designer.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-brand-gray-400 hover:text-white text-sm transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {designer.websiteUrl && (
                <a
                  href={designer.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-brand-gray-400 hover:text-white text-sm transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {designer.bio && (
            <div className="bg-white border border-brand-gray-100 rounded-xl p-6">
              <h2 className="font-display font-bold text-brand-black mb-4">About</h2>
              <p className="text-brand-gray-600 leading-relaxed preserve-formatting">{designer.bio}</p>
            </div>
          )}

          {/* Work preferences */}
          <div className="bg-white border border-brand-gray-100 rounded-xl p-6">
            <h2 className="font-display font-bold text-brand-black mb-5">Work preferences</h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Primary role</p>
                <p className="text-brand-black text-sm font-medium">{designer.primaryRole}</p>
              </div>
              {designer.experienceLevel && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Experience</p>
                  <p className="text-brand-black text-sm font-medium">{designer.experienceLevel}</p>
                </div>
              )}
              {designer.typeOfRole.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Open to</p>
                  <div className="flex flex-wrap gap-1.5">
                    {designer.typeOfRole.map((t) => (
                      <Badge key={t} variant="gray">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {designer.companySize && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Company size</p>
                  <p className="text-brand-black text-sm font-medium">{designer.companySize}</p>
                </div>
              )}
              {designer.compensation && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Compensation</p>
                  <p className="text-brand-black text-sm font-medium">{designer.compensation}</p>
                </div>
              )}
              {designer.timing && (
                <div>
                  <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Availability</p>
                  <p className="text-brand-black text-sm font-medium">{designer.timing}</p>
                </div>
              )}
            </div>

            {designer.otherRoles.length > 0 && (
              <div className="mt-5 pt-5 border-t border-brand-gray-100">
                <p className="text-xs font-medium text-brand-gray-400 uppercase tracking-wide mb-2">Also interested in</p>
                <div className="flex flex-wrap gap-1.5">
                  {designer.otherRoles.map((r) => (
                    <Badge key={r} variant="gray">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Hire CTA */}
          <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5">
            <p className="font-semibold text-brand-black mb-2">Interested in hiring {designer.firstName}?</p>
            <p className="text-sm text-brand-gray-500 mb-4">
              Post a job to reach {designer.firstName} and 200+ other senior designers actively looking.
            </p>
            <Link href="/post-a-job">
              <Button size="sm" className="w-full">Post a Job — $249</Button>
            </Link>
          </div>

          {/* Share */}
          <div className="bg-white border border-brand-gray-100 rounded-xl p-5">
            <p className="font-semibold text-brand-black mb-3">Share this profile</p>
            <div className="flex flex-col gap-2">
              {designer.linkedinUrl && (
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/talent/${designer.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-gray-600 hover:text-brand-black transition-colors py-1"
                >
                  <Linkedin className="w-4 h-4" />
                  Share on LinkedIn
                </a>
              )}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${name}'s profile on Design Better Careers`)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/talent/${designer.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-brand-gray-600 hover:text-brand-black transition-colors py-1"
              >
                <Share2 className="w-4 h-4" />
                Share on X / Twitter
              </a>
            </div>
          </div>

          {/* Visa */}
          {designer.requiresVisa && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p className="text-xs font-medium text-yellow-800">
                Requires work visa sponsorship
              </p>
            </div>
          )}

          {/* Company size pref */}
          {designer.companySize && (
            <div className="bg-white border border-brand-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-2 text-sm text-brand-gray-600">
                <Building2 className="w-4 h-4 text-brand-gray-400" />
                Prefers {designer.companySize} person companies
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
