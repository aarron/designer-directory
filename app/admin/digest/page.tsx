import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DigestClient } from "./DigestClient";
import type { DigestJob } from "./DigestClient";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

async function getRecentJobs(): Promise<DigestJob[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const jobs = await db.job.findMany({
    where: { active: true, createdAt: { gte: thirtyDaysAgo } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      remote: true,
      typeOfRole: true,
      compensation: true,
      createdAt: true,
    },
  });

  // Serialize dates for the client component
  return jobs.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() }));
}

export default async function DigestPage() {
  await checkAuth();

  const jobs = await getRecentJobs();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://designbetter.careers";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-2">
        Newsletter digest
      </h1>
      <p className="text-brand-gray-500 text-sm mb-8">
        {jobs.length} job{jobs.length !== 1 ? "s" : ""} from the last 30 days.
        Select which to include, then copy into Substack.
      </p>

      {jobs.length === 0 ? (
        <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-8 text-center text-brand-gray-400">
          <p className="font-medium">No jobs in the last 30 days.</p>
          <p className="text-sm mt-1">Check back after new jobs are posted.</p>
        </div>
      ) : (
        <DigestClient jobs={jobs} appUrl={appUrl} />
      )}
    </div>
  );
}
