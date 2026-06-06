import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AddJobForm } from "./AddJobForm";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

export default async function AddJobPage() {
  await checkAuth();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/admin" className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors mb-2 inline-block">
        ← Back to admin
      </Link>
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-8">Add a Job</h1>
      <AddJobForm />
    </div>
  );
}
