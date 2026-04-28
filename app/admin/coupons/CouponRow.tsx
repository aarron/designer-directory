"use client";

import { useState } from "react";
import { EditCouponForm } from "./EditCouponForm";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  active: boolean;
};

export function CouponRow({ coupon }: { coupon: Coupon }) {
  const [editing, setEditing] = useState(false);

  const usageLabel = coupon.maxUses === null
    ? `${coupon.usedCount} uses (unlimited)`
    : `${coupon.usedCount} / ${coupon.maxUses} uses`;
  const discountLabel = coupon.discountType === "percent"
    ? `${coupon.discountValue}% off`
    : `$${coupon.discountValue} off`;
  const isExpired = coupon.expiresAt ? coupon.expiresAt < new Date() : false;
  const isMaxed = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;

  return (
    <div className={`bg-white border rounded-xl px-5 py-4 ${!coupon.active || isExpired || isMaxed ? "opacity-50 border-brand-gray-100" : "border-brand-gray-200"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono font-bold text-brand-black tracking-widest">{coupon.code}</span>
            {!coupon.active && <span className="text-xs bg-brand-gray-100 text-brand-gray-500 px-2 py-0.5 rounded">Inactive</span>}
            {isExpired && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">Expired</span>}
            {isMaxed && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">Maxed out</span>}
            {coupon.discountType === "percent" && coupon.discountValue === 100 && coupon.active && !isExpired && !isMaxed && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">Free</span>
            )}
          </div>
          <p className="text-sm text-brand-gray-500">
            {discountLabel} · {usageLabel}
            {coupon.description && ` · ${coupon.description}`}
            {coupon.expiresAt && ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-xs font-medium px-3 py-1.5 rounded border border-brand-gray-200 text-brand-gray-500 hover:border-brand-black hover:text-brand-black transition-colors"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <form action={`/api/admin/coupons/${coupon.id}/toggle`} method="POST">
            <button
              type="submit"
              className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${coupon.active ? "border-brand-gray-200 text-brand-gray-500 hover:border-red-300 hover:text-red-600" : "border-green-200 text-green-700 hover:border-green-400"}`}
            >
              {coupon.active ? "Deactivate" : "Activate"}
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <EditCouponForm coupon={coupon} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
