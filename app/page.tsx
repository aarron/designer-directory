import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WORK_STATUS_LABELS } from "@/lib/utils";
import { ArrowRight, Users, Briefcase, Mail } from "lucide-react";

async function getStats() {
  const [designerCount, jobCount] = await Promise.all([
    db.designer.count({ where: { publicProfile: true, openToWork: { not: "NOT_LOOKING" } } }),
    db.job.count({ where: { active: true } }),
  ]);
  return { designerCount, jobCount };
}

async function getRecentJobs() {
  return db.job.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
}

async function getFeaturedDesigners() {
  return db.designer.findMany({
    where: { publicProfile: true, openToWork: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export default async function HomePage() {
  const [stats, recentJobs, featuredDesigners] = await Promise.all([
    getStats(),
    getRecentJobs(),
    getFeaturedDesigners(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-black text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-brand-red font-medium text-sm tracking-wide uppercase mb-6">
              Design Better Careers
            </p>
            <h1 className="font-display text-display-lg font-bold text-white mb-6 text-balance">
              Where design talent meets great teams.
            </h1>
            <p className="text-brand-gray-300 text-lg leading-relaxed mb-10 max-w-2xl">
              230,000+ design and tech professionals read Design Better every week.
              This is their career hub — senior designers actively looking, and employers who want to reach them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/talent">
                <Button size="lg" variant="primary" className="gap-2">
                  Browse Talent <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/post-a-job">
                <Button size="lg" variant="secondary" className="text-white border-brand-gray-600 hover:border-white hover:bg-brand-gray-900">
                  Post a Job — $249
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
            <div>
              <p className="font-display text-display-md font-bold text-brand-red">230k+</p>
              <p className="text-brand-gray-400 text-sm mt-1">Newsletter readers</p>
            </div>
            <div>
              <p className="font-display text-display-md font-bold text-brand-red">{stats.designerCount}+</p>
              <p className="text-brand-gray-400 text-sm mt-1">Designers available</p>
            </div>
            <div>
              <p className="font-display text-display-md font-bold text-brand-red">{stats.jobCount}</p>
              <p className="text-brand-gray-400 text-sm mt-1">Open roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured designers */}
      {featuredDesigners.length > 0 && (
        <section className="py-20 px-6 bg-brand-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-display-sm font-bold text-brand-black">
                  Designers open to work
                </h2>
                <p className="text-brand-gray-500 text-sm mt-1">
                  Senior designers actively looking for their next role
                </p>
              </div>
              <Link href="/talent" className="text-sm font-medium text-brand-black hover:text-brand-red transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredDesigners.map((designer) => {
                const status = WORK_STATUS_LABELS[designer.openToWork];
                return (
                  <Link
                    key={designer.id}
                    href={`/talent/${designer.id}`}
                    className="bg-white rounded-lg p-5 border border-brand-gray-100 hover:border-brand-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {designer.photoUrl ? (
                        <Image
                          src={designer.photoUrl}
                          alt={`${designer.firstName} ${designer.lastName}`}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-brand-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-brand-gray-400 text-lg">
                            {designer.firstName[0]}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-black group-hover:text-brand-red transition-colors truncate">
                          {designer.firstName} {designer.lastName}
                        </p>
                        <p className="text-sm text-brand-gray-500 truncate">
                          {designer.title || designer.primaryRole}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant={status.color as "green" | "yellow" | "gray"}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Recent jobs */}
      {recentJobs.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-display-sm font-bold text-brand-black">
                  Latest open roles
                </h2>
                <p className="text-brand-gray-500 text-sm mt-1">
                  New opportunities from design-forward teams
                </p>
              </div>
              <Link href="/jobs" className="text-sm font-medium text-brand-black hover:text-brand-red transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between bg-white border border-brand-gray-100 hover:border-brand-gray-300 rounded-lg px-5 py-4 hover:shadow-sm transition-all group"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-black group-hover:text-brand-red transition-colors">
                      {job.title}
                    </p>
                    <p className="text-sm text-brand-gray-500 mt-0.5">
                      {job.company} · {job.location}{job.remote ? " · Remote" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-xs text-brand-gray-400 hidden sm:block">{job.typeOfRole}</span>
                    <ArrowRight className="w-4 h-4 text-brand-gray-300 group-hover:text-brand-red transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* For employers */}
      <section className="py-20 px-6 bg-brand-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand-red font-medium text-sm tracking-wide uppercase mb-4">For employers</p>
              <h2 className="font-display text-display-sm font-bold mb-6 text-balance">
                Reach the designers you can&apos;t find anywhere else.
              </h2>
              <p className="text-brand-gray-300 leading-relaxed mb-8">
                Your posting reaches 230,000+ design and tech professionals through our newsletter,
                the talent directory, and The Roundup — our curated weekly digest of what&apos;s happening in design.
              </p>
              <Link href="/post-a-job">
                <Button size="lg" className="gap-2">
                  Post a Job — $249 <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Users, title: "Senior talent pool", desc: "Over 60% of our designers have 9+ years of experience." },
                { icon: Mail, title: "Newsletter reach", desc: "New roles featured in The Roundup, sent every Friday to 230k+ subscribers." },
                { icon: Briefcase, title: "Matched candidates", desc: "We send you a curated shortlist of matched profiles after you post." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 bg-brand-gray-900 rounded-lg p-5">
                  <div className="w-9 h-9 rounded bg-brand-red/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-red" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-brand-gray-400 mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA for talent */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-display text-display-sm font-bold text-brand-black mb-4 text-balance">
            Are you a designer looking for your next role?
          </h2>
          <p className="text-brand-gray-500 mb-8 max-w-lg mx-auto">
            Add your profile to the directory. It takes 5 minutes and puts you in front of employers who are actively looking.
          </p>
          <Link href="/join">
            <Button size="lg" variant="secondary" className="gap-2">
              Add Your Profile — It&apos;s Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
