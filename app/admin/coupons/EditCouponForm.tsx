"use client";

import { useState } from "react";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  expiresAt: Date | null;
};

export function EditCouponForm({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discountType, setDiscountType] = useState(coupon.discountType);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: (data.get("code") as string).trim().toUpperCase(),
          description: data.get("description") || undefined,
          discountType: data.get("discountType"),
          discountValue: parseInt(data.get("discountValue") as string),
          maxUses: data.get("maxUses") ? parseInt(data.get("maxUses") as string) : null,
          expiresAt: data.get("expiresAt") || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to update coupon."); return; }

      window.location.reload();
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  const expiresAtValue = coupon.expiresAt
    ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
    : "";

  return (
    <div className="mt-3 border-t border-brand-gray-100 pt-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Code</label>
            <input
              name="code"
              required
              defaultValue={coupon.code}
              className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none uppercase tracking-widest font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Description</label>
            <input
              name="description"
              defaultValue={coupon.description ?? ""}
              placeholder="Internal note"
              className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Type</label>
            <select
              name="discountType"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none appearance-none bg-white"
            >
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-brand-gray-700 mb-1 block">
              Value {discountType === "percent" ? "(%)" : "($)"}
            </label>
            <input
              name="discountValue"
              type="number"
              required
              min={1}
              max={discountType === "percent" ? 100 : undefined}
              defaultValue={coupon.discountValue}
              className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Max uses</label>
            <input
              name="maxUses"
              type="number"
              min={1}
              defaultValue={coupon.maxUses ?? ""}
              placeholder="Unlimited"
              className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Expires (optional)</label>
          <input
            name="expiresAt"
            type="date"
            defaultValue={expiresAtValue}
            className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-9 rounded bg-brand-black text-white text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded border border-brand-gray-200 text-xs font-medium text-brand-gray-500 hover:text-brand-black transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
