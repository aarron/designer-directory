"use client";

import { useState } from "react";

export function ApproveButton({ storyId, approved }: { storyId: string; approved: boolean }) {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(approved);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/success-stories/${storyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !current }),
    });
    setCurrent(!current);
    setLoading(false);
    window.location.reload();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm font-medium px-4 py-1.5 rounded border transition-colors ${
        current
          ? "border-brand-gray-200 text-brand-gray-500 hover:border-red-300 hover:text-red-600"
          : "border-green-200 text-green-700 bg-green-50 hover:bg-green-100"
      }`}
    >
      {loading ? "..." : current ? "Unapprove" : "Approve"}
    </button>
  );
}
