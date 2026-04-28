import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreateCouponForm } from "./CreateCouponForm";
import { CouponRow } from "./CouponRow";

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (token !== process.env.ADMIN_SECRET) redirect("/admin/login");
}

export default async function AdminCouponsPage() {
  await checkAuth();

  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <Link href="/admin" className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors mb-2 inline-block">← Back to admin</Link>
          <h1 className="font-display text-display-sm font-bold text-brand-black">Coupon Codes</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Create form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-brand-gray-100 rounded-xl p-6 sticky top-6">
            <h2 className="font-semibold text-brand-black mb-5">Create new coupon</h2>
            <CreateCouponForm />
          </div>
        </div>

        {/* Coupon list */}
        <div className="lg:col-span-2">
          {coupons.length === 0 ? (
            <div className="text-center py-16 text-brand-gray-400 border border-brand-gray-100 rounded-xl">
              <p className="font-medium">No coupons yet</p>
              <p className="text-sm mt-1">Create your first coupon on the left.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {coupons.map((coupon) => (
                <CouponRow key={coupon.id} coupon={coupon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
