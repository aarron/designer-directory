"use client";

import { useState } from "react";
import Link from "next/link";

interface DryRunResult {
  designerCount: number;
  jobCount: number;
  totalJobs: number;
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
      <div className="rounded-xl overflow-hidden border border-brand-gray-100 mb-8 bg-[#F5F2EC] p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-gray-400 mb-4">Email preview</p>

        {/* Simulated email card */}
        <div className="bg-white border border-[#E8E5E0] max-w-[540px]">

          {/* Logo header */}
          <div className="px-8 py-6 border-b border-[#EBEBEB]">
            <img src="/og-image.png" alt="Design Better Careers" className="w-40" />
          </div>

          {/* Intro */}
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-[20px] font-bold text-[#0A0A0A] mb-3 tracking-tight leading-snug">
              New design jobs worth your time
            </h2>
            <p className="text-sm text-[#444444] leading-relaxed">
              Hi [First name], there are {preview?.totalJobs ?? "—"} open design roles on Design Better Careers right now. Here are six worth a look.
            </p>
          </div>

          {/* Job list preview */}
          <div className="px-8">
            {[
              { title: "Product Designer", company: "Framer", loc: "Remote" },
              { title: "AI Conversation Designer", company: "Notion", loc: "San Francisco, CA" },
              { title: "Product Designer", company: "Commure", loc: "Mountain View, CA" },
            ].map((j, i) => (
              <div key={i} className="py-4 border-b border-[#EBEBEB] flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A] mb-0.5">{j.title}</p>
                  <p className="text-xs text-[#767676]">{j.company} · {j.loc}</p>
                </div>
                <span className="text-xs font-semibold text-[#FF4725]">Apply →</span>
              </div>
            ))}
            <div className="py-3 border-b border-[#EBEBEB]">
              <p className="text-xs text-[#AAAAAA] italic">+ 3 more listings…</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-8 py-7">
            <span className="inline-block bg-[#FF4725] text-white text-sm font-bold px-6 py-3">
              View all open roles →
            </span>
          </div>

          {/* Divider */}
          <div className="px-8"><div className="h-px bg-[#EBEBEB]" /></div>

          {/* Portfolio Club */}
          <div className="px-8 py-7">
            <div className="border-l-[3px] border-[#FF4725] pl-5">
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#FF4725] mb-2">Portfolio Club</p>
              <p className="text-base font-bold text-[#0A0A0A] mb-2 leading-snug">A strong portfolio is your best shot at the job you want</p>
              <p className="text-sm text-[#444444] leading-relaxed mb-2">
                Portfolio Club is a feature of Design Better's paid membership on Substack. Design leaders—including Daniel Burka, MDS, and Bob Baxley—critique your work and give you specific, actionable feedback. Bring your portfolio, leave knowing exactly what to improve.
              </p>
              <p className="text-sm text-[#444444] leading-relaxed mb-4">
                Membership also includes our Slack community, Design Better books, ad-free episodes, two bonus episodes each month, and our newsletters The Roundup and The Brief. Take <strong>20% off an annual subscription</strong>.
              </p>
              <span className="inline-block bg-[#0A0A0A] text-white text-sm font-bold px-5 py-2.5">
                Join Portfolio Club — 20% off annual membership →
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-[#EBEBEB] bg-[#F9F7F4]">
            <p className="text-[11px] text-[#AAAAAA]">
              You're receiving this because you have a profile on Design Better Careers. · Remove my profile
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <p className="text-xs text-brand-gray-400">
            <strong>Subject:</strong> New design jobs—and a way to get feedback on your portfolio
          </p>
          <p className="text-xs text-brand-gray-400">
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
