"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS, COMPANY_SIZES } from "@/lib/utils";

const ROLE_TYPES = ["Full-time", "Part-time", "Contract", "Advising", "Internship"];

interface FormState {
  posterFirstName: string;
  posterLastName: string;
  posterEmail: string;
  company: string;
  companyUrl: string;
  title: string;
  role: string;
  location: string;
  remote: boolean;
  typeOfRole: string;
  experienceLevel: string;
  compensation: string;
  visaSponsorship: boolean;
  companySize: string;
  jobUrl: string;
  description: string;
  featured: boolean;
  expiresAt: string;
  matchFrequency: string;
}

const DEFAULTS: FormState = {
  posterFirstName: "Aarron",
  posterLastName: "Walter",
  posterEmail: "aarronwalter@gmail.com",
  company: "",
  companyUrl: "",
  title: "",
  role: "",
  location: "",
  remote: false,
  typeOfRole: "Full-time",
  experienceLevel: "",
  compensation: "",
  visaSponsorship: false,
  companySize: "",
  jobUrl: "",
  description: "",
  featured: false,
  expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  matchFrequency: "once",
};

export function AddJobForm() {
  const router = useRouter();
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [rawText, setRawText] = useState("");
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError("");
    try {
      const res = await fetch(
        `/api/admin/parse-job?url=${encodeURIComponent(importUrl.trim())}`,
        { headers: { "x-admin-secret": "careers" } }
      );
      const data = await res.json();
      if (!res.ok) { setImportError(data.error || "Failed to parse"); return; }

      setRawText(data.rawText || "");
      setForm((f) => ({
        ...f,
        title:       data.title       || f.title,
        company:     data.company     || f.company,
        companyUrl:  data.companyUrl  || f.companyUrl,
        location:    data.location    || f.location,
        remote:      data.remote      ?? f.remote,
        compensation: data.compensation || f.compensation,
        description: data.description || f.description,
        jobUrl:      data.jobUrl      || f.jobUrl,
      }));
    } catch (e) {
      setImportError(String(e));
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": "careers" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create job"); return; }
      router.push(`/admin?created=${data.id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full h-9 px-3 text-sm border border-brand-gray-200 rounded-lg focus:outline-none focus:border-brand-black bg-white";
  const labelCls = "block text-sm font-medium text-brand-gray-700 mb-1";
  const selectCls = "w-full h-9 px-3 text-sm border border-brand-gray-200 rounded-lg focus:outline-none focus:border-brand-black bg-white";

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main form */}
      <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6">

        {/* Import from URL */}
        <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5">
          <p className="font-semibold text-brand-black mb-1 text-sm">Import from URL</p>
          <p className="text-xs text-brand-gray-500 mb-3">Paste a job posting URL to auto-fill fields below.</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleImport())}
              placeholder="https://company.com/jobs/123"
              className={inputCls + " flex-1"}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || !importUrl.trim()}
              className="h-9 px-4 text-sm font-medium rounded-lg bg-brand-black text-white disabled:opacity-40 whitespace-nowrap"
            >
              {importing ? "Importing…" : "Import"}
            </button>
          </div>
          {importError && <p className="text-red-600 text-xs mt-2">{importError}</p>}
        </div>

        {/* Poster */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray-400 mb-3">Posted by</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>First name</label>
              <input className={inputCls} value={form.posterFirstName} onChange={(e) => set("posterFirstName", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Last name</label>
              <input className={inputCls} value={form.posterLastName} onChange={(e) => set("posterLastName", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={form.posterEmail} onChange={(e) => set("posterEmail", e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray-400 mb-3">Company</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Company name *</label>
              <input className={inputCls} value={form.company} onChange={(e) => set("company", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Company website</label>
              <input type="url" className={inputCls} value={form.companyUrl} onChange={(e) => set("companyUrl", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Role */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray-400 mb-3">Role</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelCls}>Job title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="e.g. Senior Product Designer" />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Role category *</label>
                <select className={selectCls} value={form.role} onChange={(e) => set("role", e.target.value)} required>
                  <option value="">Select…</option>
                  {PRIMARY_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type *</label>
                <select className={selectCls} value={form.typeOfRole} onChange={(e) => set("typeOfRole", e.target.value)} required>
                  {ROLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Experience *</label>
                <select className={selectCls} value={form.experienceLevel} onChange={(e) => set("experienceLevel", e.target.value)} required>
                  <option value="">Select…</option>
                  {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Location *</label>
                <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} required placeholder="e.g. New York, NY" />
              </div>
              <div>
                <label className={labelCls}>Compensation</label>
                <input className={inputCls} value={form.compensation} onChange={(e) => set("compensation", e.target.value)} placeholder="e.g. $120,000–$160,000" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Company size</label>
                <select className={selectCls} value={form.companySize} onChange={(e) => set("companySize", e.target.value)}>
                  <option value="">Select…</option>
                  {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Apply / job URL</label>
                <input type="url" className={inputCls} value={form.jobUrl} onChange={(e) => set("jobUrl", e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-gray-700">
                <input type="checkbox" checked={form.remote} onChange={(e) => set("remote", e.target.checked)} className="w-4 h-4 rounded" />
                Remote-friendly
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-gray-700">
                <input type="checkbox" checked={form.visaSponsorship} onChange={(e) => set("visaSponsorship", e.target.checked)} className="w-4 h-4 rounded" />
                Visa sponsorship
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-gray-700">
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 rounded" />
                Featured
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>Job description</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-brand-gray-200 rounded-lg focus:outline-none focus:border-brand-black bg-white resize-y"
            rows={10}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Paste or write the job description…"
          />
        </div>

        {/* Settings */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray-400 mb-3">Settings</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Expires at</label>
              <input type="date" className={inputCls} value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Match frequency</label>
              <select className={selectCls} value={form.matchFrequency} onChange={(e) => set("matchFrequency", e.target.value)}>
                <option value="once">Once — on publish</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-6 font-medium text-sm rounded-lg bg-brand-black text-white disabled:opacity-40 self-start"
        >
          {submitting ? "Saving…" : "Add Job"}
        </button>
      </form>

      {/* Sidebar: raw text preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-5">
          <p className="font-semibold text-brand-black text-sm mb-2">Imported text</p>
          <p className="text-xs text-brand-gray-500 mb-3">Raw content from the job URL — use this to fill in any missing fields.</p>
          {rawText ? (
            <pre className="text-xs text-brand-gray-600 whitespace-pre-wrap max-h-[600px] overflow-y-auto leading-relaxed">
              {rawText}
            </pre>
          ) : (
            <p className="text-xs text-brand-gray-400 italic">Import a URL to see the raw job text here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
