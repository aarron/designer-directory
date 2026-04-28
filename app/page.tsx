import Link from "next/link";
import { HeroCollage } from "@/components/HeroCollage";
import { DesignerCard } from "@/components/DesignerCard";
import { JobCard } from "@/components/JobCard";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { ROLE_SEO } from "@/lib/seo";
import { ArrowRight, Users, Briefcase, Mail, Zap } from "lucide-react";
import type { Designer } from "@prisma/client";

export const dynamic = "force-dynamic";

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getFeaturedDesigners() {
  const all = await db.designer.findMany({
    where: { publicProfile: true, hidden: false, openToWork: "OPEN", photoUrl: { not: null } },
    select: {
      id: true, firstName: true, lastName: true, title: true, company: true,
      primaryRole: true, photoUrl: true, openToWork: true,
      experienceLevel: true, skills: true, location: true,
    },
  });
  return shuffle(all).slice(0, 18) as unknown as Designer[];
}

async function getHeroDesigners() {
  const all = await db.designer.findMany({
    where: { publicProfile: true, hidden: false, photoUrl: { not: null } },
    select: { id: true, firstName: true, lastName: true, photoUrl: true },
  });
  return shuffle(all).slice(0, 64) as { id: string; firstName: string; lastName: string; photoUrl: string }[];
}

export default async function HomePage() {
  const [stats, recentJobs, featuredDesigners, heroDesigners] = await Promise.all([
    getStats(),
    getRecentJobs(),
    getFeaturedDesigners(),
    getHeroDesigners(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-black text-white py-24 px-6 relative overflow-hidden">
        <HeroCollage designers={heroDesigners} />
        <div className="max-w-6xl mx-auto relative z-20">
          <div className="max-w-3xl">
            <h1 className="font-display text-display-lg font-bold text-white mb-6 text-balance">
              Where creative people and great companies connect.
            </h1>
            <p className="text-brand-gray-300 text-lg leading-relaxed mb-10 max-w-2xl">
              Design Better reaches 230,000+ designers and leaders every week. We built this to connect the best of them — senior talent ready for their next move, and the teams who deserve them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/talent">
                <Button size="lg" variant="primary" className="gap-2 hover:bg-brand-red/80">
                  Browse Talent <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/post-a-job">
                <Button size="lg" className="gap-2 bg-transparent text-white border border-brand-gray-500 hover:border-white hover:bg-brand-gray-900">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredDesigners.map((designer) => (
                <DesignerCard key={designer.id} designer={designer} />
              ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
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
                The right designers, delivered to your inbox.
              </h2>
              <p className="text-brand-gray-300 leading-relaxed mb-6">
                Post your role and our matching engine automatically scores every designer in the directory against your criteria — role, experience level, availability, location, and more. Top matches land in your inbox on a schedule you choose.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["Once on go-live", "Weekly", "Bi-weekly"].map((freq) => (
                  <span key={freq} className="text-xs font-medium text-brand-gray-300 border border-brand-gray-700 rounded-full px-3 py-1">{freq}</span>
                ))}
              </div>
              <Link href="/post-a-job">
                <Button size="lg" className="gap-2">
                  Post a Job — $249 <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Zap, title: "Automated matching", desc: "Our algorithm scores designers on role, experience, type of work, location, and availability — no manual searching." },
                { icon: Users, title: "Senior talent pool", desc: "Over 60% of our designers have 9+ years of experience. Every profile is real and self-submitted." },
                { icon: Mail, title: "Newsletter reach", desc: "New roles featured in The Roundup, sent every Friday to 230k+ subscribers." },
                { icon: Briefcase, title: "60-day listing", desc: "Active for 60 days. Update your match frequency anytime by replying to any digest email." },
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

      {/* Browse by role */}
      <section className="py-16 px-6 bg-brand-gray-50 border-t border-brand-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-display-sm font-bold text-brand-black">
                Browse by role
              </h2>
              <p className="text-brand-gray-500 text-sm mt-1">
                Find designers and jobs by discipline
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(ROLE_SEO).map(([roleKey, { slug, singular, plural }]) => (
              <div key={slug} className="bg-white border border-brand-gray-100 rounded-xl p-5 flex flex-col gap-3">
                <p className="font-semibold text-brand-black">{roleKey}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/hire/${slug}`}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 border border-brand-gray-200 rounded-lg text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-colors"
                  >
                    Hire a {singular}
                  </Link>
                  <Link
                    href={`/design-jobs/${slug}`}
                    className="flex-1 text-center text-xs font-medium py-2 px-3 border border-brand-gray-200 rounded-lg text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-colors"
                  >
                    {plural} Jobs
                  </Link>
                </div>
              </div>
            ))}
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
