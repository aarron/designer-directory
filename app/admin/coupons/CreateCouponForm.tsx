"use client";

import { useState } from "react";

export function CreateCouponForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [discountType, setDiscountType] = useState("percent");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
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
      if (!res.ok) { setError(json.error || "Failed to create coupon."); return; }

      setSuccess(`Coupon "${json.code}" created!`);
      form.reset();
      setDiscountType("percent");
      // Refresh the page to show new coupon
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Code</label>
        <input
          name="code"
          required
          placeholder="e.g. GOOGLE2025"
          className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none uppercase tracking-widest font-mono"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Description (internal)</label>
        <input
          name="description"
          placeholder="e.g. For Google design team"
          className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Discount type</label>
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
            Value {discountType === "percent" ? "(0–100)" : "(dollars)"}
          </label>
          <input
            name="discountValue"
            type="number"
            required
            min={1}
            max={discountType === "percent" ? 100 : undefined}
            placeholder={discountType === "percent" ? "100" : "249"}
            className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Max uses (blank = unlimited)</label>
          <input
            name="maxUses"
            type="number"
            min={1}
            placeholder="e.g. 10"
            className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Expires (optional)</label>
          <input
            name="expiresAt"
            type="date"
            className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded bg-brand-black text-white text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create coupon"}
      </button>
    </form>
  );
}
