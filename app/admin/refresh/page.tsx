"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminRefreshPage() {
  const [status, setStatus] = useState<"idle" | "counting" | "sending" | "done" | "error">("idle");
  const [count, setCount] = useState<number | null>(null);
  const [result, setResult] = useState<{ sent: number; errors: string[]; total: number } | null>(null);
  const [error, setError] = useState("");

  async function handleCount() {
    setStatus("counting");
    setError("");
    try {
      const res = await fetch("/api/admin/send-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(`Error ${res.status}: ${data.error || "Unknown error"}`);
        setStatus("error");
        return;
      }
      setCount(data.count ?? 0);
      setStatus("idle");
    } catch (e) {
      setError(`Failed to count designers: ${e}`);
      setStatus("error");
    }
  }

  async function handleSend() {
    if (!confirm(`This will send the relaunch email to ${count} designers. Are you sure?`)) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/send-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: false }),
      });
      const data = await res.json();
      setResult(data);
      setStatus("done");
    } catch {
      setError("Failed to send emails.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/admin" className="text-sm text-brand-gray-500 hover:text-brand-black transition-colors mb-8 inline-block">
        ← Back to admin
      </Link>

      <h1 className="font-display text-display-sm font-bold text-brand-black mb-2">Relaunch email blast</h1>
      <p className="text-brand-gray-500 mb-10">
        Send the one-time relaunch email to all public, non-hidden designers asking them to update their profile.
      </p>

      {/* Email preview */}
      <div className="bg-white border border-brand-gray-100 rounded-xl p-6 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-4">Email preview</p>
        <p className="text-sm font-semibold text-brand-black mb-1">Subject: Your Design Better talent profile — still looking?</p>
        <div className="mt-4 text-sm text-brand-gray-600 leading-relaxed border-t border-brand-gray-100 pt-4 flex flex-col gap-3">
          <p>Hi [First name],</p>
          <p>Remember when Design Better launched its talent directory last year — a place for designers to post a profile and for companies to find and hire great design talent? We're back, and we've rebuilt it from the ground up.</p>
          <p>It's now called <strong>Design Better Careers</strong>, and your profile is still listed in our directory where companies and recruiters can find you.</p>
          <p><strong>If you're still open to new opportunities</strong>, now is a great time to update your profile. We've added new fields including skills and tools, industry experience, remote preferences, and availability — all things recruiters use to find the right fit.</p>
          <p>We'll be inviting companies to post job openings soon, and we want to make sure the talent side of the directory is in great shape before they arrive. Think of this as your chance to get your profile in front of employers before the doors open.</p>
          <p><span className="bg-brand-red text-white text-xs px-3 py-1.5 rounded inline-block">Review and update my profile →</span></p>
          <p><strong>If you're no longer looking</strong>, no worries — you can hide your profile with one click. Your information stays saved, so you can reactivate anytime.</p>
          <p className="text-brand-gray-400 text-xs underline">Hide my profile</p>
          <p>Questions? Just reply to this email.</p>
          <p>— Aarron and the Design Better team</p>
        </div>
      </div>

      {/* Actions */}
      {status === "done" && result ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <p className="font-semibold text-green-800 mb-1">✓ Emails sent successfully</p>
          <p className="text-sm text-green-700">{result.sent} of {result.total} emails sent.</p>
          {result.errors.length > 0 && (
            <p className="text-sm text-red-600 mt-2">Failed: {result.errors.join(", ")}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCount}
              disabled={status === "counting"}
              className="h-10 px-5 text-sm font-medium border border-brand-gray-200 rounded text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-50"
            >
              {status === "counting" ? "Counting…" : "Count recipients"}
            </button>
            {count !== null && (
              <p className="text-sm text-brand-gray-600">
                <span className="font-semibold text-brand-black">{count}</span> designers will receive this email.
              </p>
            )}
          </div>

          {count !== null && (
            <button
              onClick={handleSend}
              disabled={status === "sending"}
              className="w-full h-12 rounded bg-brand-red text-white text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : `Send to ${count ?? "?"} designers`}
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Periodic cron info */}
      <div className="mt-12 bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-2">Periodic refresh emails</p>
        <p className="text-sm text-brand-gray-600">
          A shorter check-in email is sent automatically every 60 days to designers who haven't confirmed recently.
          It goes to all public, non-hidden profiles where <code className="bg-brand-gray-100 px-1 rounded text-xs">lastConfirmedAt</code> is null or older than 60 days.
        </p>
      </div>
    </div>
  );
}
