"use client";

import { useState } from "react";
import Link from "next/link";

interface DryRunResult {
  designerCount: number;
  jobCount: number;
  jobs: string[];
}

interface SendResult {
  sent: number;
  errors: string[];
  total: number;
  jobCount: number;
}

export default function BlastTalentPage() {
  const [status, setStatus] = useState<"idle" | "previewing" | "sending" | "done" | "error">("idle");
  const [preview, setPreview] = useState<DryRunResult | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");

  async function handlePreview() {
    setStatus("previewing");
    setError("");
    try {
      const res = await fetch("/api/admin/blast-talent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": "careers" },
        body: JSON.stringify({ dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to preview");
        setStatus("error");
        return;
      }
      setPreview(data);
      setStatus("idle");
    } catch (e) {
      setError(String(e));
      setStatus("error");
    }
  }

  async function handleSend() {
    if (!confirm(`Send to ${preview?.designerCount} designers featuring ${preview?.jobCount} jobs. Continue?`)) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/blast-talent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": "careers" },
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

      <h1 className="font-display text-display-sm font-bold text-brand-black mb-2">Job digest blast</h1>
      <p className="text-brand-gray-500 mb-10">
        Send a jobs digest + Portfolio Club offer to all designers in the talent pool.
      </p>

      {/* Email preview card */}
      <div className="rounded-xl overflow-hidden border border-brand-gray-100 mb-8">
        <div className="bg-[#0A0A0A] px-8 py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[rgba(242,240,236,0.38)] mb-6">
            Email preview — dark background
          </p>

          {/* Logo placeholder */}
          <div className="mb-6">
            <img src="/logo-white.png" alt="Design Better Careers" className="h-6" />
          </div>

          <h2 className="text-[22px] font-bold text-[#F2F0EC] mb-3 tracking-tight">
            New jobs for designers
          </h2>
          <p className="text-sm text-[rgba(242,240,236,0.8)] leading-relaxed mb-6">
            Hi [First name], we've added new openings to Design Better Careers—roles at companies doing work worth your attention. Take a look.
          </p>

          {/* Job list preview */}
          <div className="border-t border-[rgba(255,255,255,0.08)] py-3 mb-2">
            <p className="text-[#F2F0EC] text-sm font-semibold mb-0.5">Product Designer</p>
            <p className="text-[rgba(242,240,236,0.62)] text-xs">Framer · Remote</p>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.08)] py-3 mb-2">
            <p className="text-[#F2F0EC] text-sm font-semibold mb-0.5">Product Designer</p>
            <p className="text-[rgba(242,240,236,0.62)] text-xs">Commure · Mountain View, CA</p>
          </div>
          <div className="border-t border-[rgba(255,255,255,0.08)] py-3 mb-4">
            <p className="text-[rgba(242,240,236,0.38)] text-xs italic">+ more listings…</p>
          </div>

          <div className="mb-8">
            <span className="inline-block bg-[#FF4725] text-[#0A0A0A] text-sm font-bold px-5 py-3">
              View all open roles →
            </span>
          </div>

          {/* Portfolio Club */}
          <div className="border-t border-[rgba(255,255,255,0.08)] pt-6">
            <div className="border-l-[3px] border-[#FF4725] pl-5">
              <p className="text-xs font-bold tracking-widest uppercase text-[#FF4725] mb-2">Portfolio Club</p>
              <p className="text-[#F2F0EC] font-bold text-lg mb-2 leading-snug">Get feedback that moves your portfolio forward</p>
              <p className="text-[rgba(242,240,236,0.8)] text-sm leading-relaxed mb-4">
                Submit your portfolio for a constructive critique from a design leader, Eli, and Aarron.
                Members also get access to our Slack community for ongoing peer support.
                As a Design Better Careers member, take <strong className="text-[#F2F0EC]">20% off</strong> an annual membership.
              </p>
              <span className="inline-block border border-[rgba(255,255,255,0.18)] text-[#F2F0EC] text-sm font-semibold px-5 py-2.5">
                Join Portfolio Club — 20% off →
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white px-8 py-4 border-t border-brand-gray-100">
          <p className="text-xs text-brand-gray-400">
            <strong>Subject:</strong> New design jobs—and a way to get feedback on your portfolio
          </p>
          <p className="text-xs text-brand-gray-400 mt-1">
            <strong>From:</strong> Design Better Careers &lt;careers@thecuriositydepartment.com&gt;
          </p>
        </div>
      </div>

      {/* Jobs that will be featured */}
      {preview && (
        <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5 mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-3">
            Jobs to be featured ({preview.jobCount})
          </p>
          <ul className="flex flex-col gap-1">
            {preview.jobs.map((j, i) => (
              <li key={i} className="text-sm text-brand-gray-600">• {j}</li>
            ))}
          </ul>
          <p className="text-sm text-brand-gray-500 mt-3">
            Sending to <strong className="text-brand-black">{preview.designerCount}</strong> designers.
          </p>
        </div>
      )}

      {/* Actions */}
      {status === "done" && result ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <p className="font-semibold text-green-800 mb-1">✓ Emails sent</p>
          <p className="text-sm text-green-700">
            {result.sent} of {result.total} designers received the email featuring {result.jobCount} jobs.
          </p>
          {result.errors.length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              Failed ({result.errors.length}): {result.errors.slice(0, 5).join(", ")}
              {result.errors.length > 5 ? ` + ${result.errors.length - 5} more` : ""}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreview}
              disabled={status === "previewing" || status === "sending"}
              className="h-10 px-5 text-sm font-medium border border-brand-gray-200 rounded text-brand-gray-600 hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-50"
            >
              {status === "previewing" ? "Loading…" : "Preview recipients & jobs"}
            </button>
          </div>

          {preview && (
            <button
              onClick={handleSend}
              disabled={status === "sending"}
              className="w-full h-12 rounded bg-brand-red text-white text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending"
                ? "Sending…"
                : `Send to ${preview.designerCount} designers`}
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
