import { db } from "@/lib/db";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

export default async function AdminPage() {
  await checkAuth();

  const [designers, jobs] = await Promise.all([
    db.designer.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.job.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const activeJobs = jobs.filter((j) => j.active);
  const pendingJobs = jobs.filter((j) => !j.active);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-display-sm font-bold text-brand-black">Admin</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/jobs/new">
            <Button variant="primary">+ Add Job</Button>
          </Link>
          <Link href="/admin/success-stories">
            <Button variant="secondary">Success Stories</Button>
          </Link>
          <Link href="/admin/coupons">
            <Button variant="secondary">Coupon Codes</Button>
          </Link>
          <Link href="/admin/blast-talent">
            <Button variant="primary">Send Job Digest</Button>
          </Link>
          <Link href="/admin/refresh">
            <Button variant="secondary">Relaunch Email Blast</Button>
          </Link>
          <Link href="/admin/digest">
            <Button variant="secondary">Weekly Digest Generator</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total designers", value: designers.length },
          { label: "Active jobs", value: activeJobs.length },
          { label: "Pending payment", value: pendingJobs.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5">
            <p className="font-display text-display-sm font-bold text-brand-black">{value}</p>
            <p className="text-sm text-brand-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending jobs */}
      {pendingJobs.length > 0 && (
        <section className="mb-10">
          <h2 className="font-semibold text-brand-black mb-4">Pending payment</h2>
          <div className="flex flex-col gap-2">
            {pendingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-3 text-sm">
                <div>
                  <span className="font-medium">{job.title}</span> at {job.company}
                  <span className="text-brand-gray-400 ml-2">({job.posterEmail})</span>
                </div>
                <span className="text-brand-gray-400">{formatDate(job.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent jobs */}
      <section className="mb-10">
        <h2 className="font-semibold text-brand-black mb-4">Recent jobs</h2>
        <div className="flex flex-col gap-2">
          {activeJobs.slice(0, 10).map((job) => (
            <div key={job.id} className="flex items-center justify-between bg-white border border-brand-gray-100 rounded-lg px-4 py-3 text-sm">
              <div>
                <Link href={`/jobs/${job.id}`} className="font-medium hover:text-brand-red">{job.title}</Link>
                <span className="text-brand-gray-400"> at {job.company} · {job.viewCount} views</span>
              </div>
              <span className="text-brand-gray-400">{formatDate(job.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent designers */}
      <section>
        <h2 className="font-semibold text-brand-black mb-4">Recent designers</h2>
        <div className="flex flex-col gap-2">
          {designers.slice(0, 10).map((d) => (
            <div key={d.id} className="flex items-center justify-between bg-white border border-brand-gray-100 rounded-lg px-4 py-3 text-sm">
              <div>
                <Link href={`/talent/${d.id}`} className="font-medium hover:text-brand-red">{d.firstName} {d.lastName}</Link>
                <span className="text-brand-gray-400"> · {d.primaryRole} · {d.openToWork}</span>
              </div>
              <span className="text-brand-gray-400">{formatDate(d.createdAt)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
