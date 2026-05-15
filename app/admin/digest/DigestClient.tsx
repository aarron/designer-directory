"use client";

import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";

export type DigestJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  typeOfRole: string;
  compensation: string | null;
  createdAt: string;
};

function buildMeta(job: DigestJob): string {
  return [
    job.typeOfRole,
    job.location,
    job.remote ? "Remote OK" : null,
    job.compensation ?? null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function generateSubstackHtml(jobs: DigestJob[], appUrl: string): string {
  return jobs
    .map((job) => {
      const meta = buildMeta(job);
      return `<p><strong><a href="${appUrl}/jobs/${job.id}">${job.title}</a></strong> at ${job.company}<br>${meta}</p>`;
    })
    .join("\n");
}

function generatePlainText(jobs: DigestJob[], appUrl: string): string {
  return jobs
    .map((job) => {
      const meta = buildMeta(job);
      return `${job.title} at ${job.company}\n${meta}\n${appUrl}/jobs/${job.id}`;
    })
    .join("\n\n");
}

export function DigestClient({
  jobs,
  appUrl,
}: {
  jobs: DigestJob[];
  appUrl: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(jobs.map((j) => j.id))
  );
  const [copied, setCopied] = useState<null | "substack" | "text">(null);

  const selectedJobs = jobs.filter((j) => selectedIds.has(j.id));
  const allSelected = selectedIds.size === jobs.length;

  function toggleJob(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(jobs.map((j) => j.id))
    );
  }

  async function copyForSubstack() {
    const html = generateSubstackHtml(selectedJobs, appUrl);
    const plain = generatePlainText(selectedJobs, appUrl);
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(plain);
    }
    setCopied("substack");
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyPlainText() {
    await navigator.clipboard.writeText(
      generatePlainText(selectedJobs, appUrl)
    );
    setCopied("text");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Job list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-brand-black">
            Jobs to include{" "}
            <span className="font-normal text-brand-gray-400">
              ({selectedIds.size} of {jobs.length} selected)
            </span>
          </h2>
          <button
            onClick={toggleAll}
            className="text-xs text-brand-gray-400 hover:text-brand-black transition-colors"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>

        <div className="divide-y divide-brand-gray-100 border border-brand-gray-100 rounded-xl overflow-hidden">
          {jobs.map((job) => (
            <label
              key={job.id}
              className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-brand-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(job.id)}
                onChange={() => toggleJob(job.id)}
                className="mt-0.5 accent-brand-red flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-black">
                  {job.title}
                </p>
                <p className="text-xs text-brand-gray-500 mt-0.5">
                  {buildMeta(job)}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-brand-gray-300 flex-shrink-0 mt-1">
                {new Date(job.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </label>
          ))}
        </div>
      </div>

      {selectedJobs.length === 0 ? (
        <p className="text-sm text-brand-gray-400 text-center py-6">
          Select at least one job to copy.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            <h2 className="text-sm font-semibold text-brand-black mb-3">
              Preview
            </h2>
            <div className="border border-brand-gray-100 rounded-xl p-5 bg-white space-y-4">
              {selectedJobs.map((job) => (
                <div
                  key={job.id}
                  className="border-b border-brand-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <p className="text-sm">
                    <span className="font-bold text-brand-red underline underline-offset-2">
                      {job.title}
                    </span>{" "}
                    <span className="font-bold text-brand-black">
                      at {job.company}
                    </span>
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-0.5">
                    {buildMeta(job)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Copy options */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-brand-black">
              Copy options
            </h2>

            {/* Substack */}
            <div className="border border-brand-gray-100 rounded-xl p-5 bg-white">
              <p className="text-sm font-semibold text-brand-black mb-1">
                Copy for Substack
              </p>
              <p className="text-xs text-brand-gray-400 mb-4 leading-relaxed">
                Paste directly into your Substack editor. Job titles become
                clickable links, formatting is preserved.
              </p>
              <button
                onClick={copyForSubstack}
                className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-brand-gray-800 transition-colors"
              >
                {copied === "substack" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied === "substack" ? "Copied!" : "Copy for Substack"}
              </button>
            </div>

            {/* Plain text */}
            <div className="border border-brand-gray-100 rounded-xl p-5 bg-white">
              <p className="text-sm font-semibold text-brand-black mb-1">
                Copy as plain text
              </p>
              <p className="text-xs text-brand-gray-400 mb-4 leading-relaxed">
                Simple text with full URLs. Works anywhere — email, Slack,
                notes.
              </p>
              <button
                onClick={copyPlainText}
                className="flex items-center gap-2 px-4 py-2 border border-brand-gray-200 text-brand-black text-xs font-bold uppercase tracking-widest rounded hover:border-brand-black transition-colors"
              >
                {copied === "text" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                {copied === "text" ? "Copied!" : "Copy plain text"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
