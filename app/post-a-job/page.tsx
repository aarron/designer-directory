"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS, COMPANY_SIZES } from "@/lib/utils";
import { JOB_POSTING_PRICE_DOLLARS } from "@/lib/stripe";
import { Users, Mail, Briefcase, ArrowRight, CheckCircle, Tag, Zap } from "lucide-react";

const roleTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Contract", label: "Contract" },
  { value: "Part-time", label: "Part-time" },
];

const perks = [
  {
    icon: Users,
    title: "230,000+ readers",
    desc: "Your job reaches the full Design Better newsletter audience — the largest design-focused readership online.",
  },
  {
    icon: Mail,
    title: "Featured in The Roundup",
    desc: "New jobs appear in our Friday newsletter, The Roundup, sent to every subscriber.",
  },
  {
    icon: Briefcase,
    title: "Curated candidate shortlist",
    desc: "After you post, we send you a hand-matched shortlist of senior designers actively looking.",
  },
  {
    icon: CheckCircle,
    title: "60% senior talent",
    desc: "Our directory skews heavily senior — 60%+ of designers have 9+ years of experience.",
  },
];

export default function PostAJobPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponValidating, setCouponValidating] = useState(false);
  const [matchFrequency, setMatchFrequency] = useState("weekly");
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    isFree?: boolean;
    discountType?: string;
    discountValue?: number;
    discountedPrice?: number;
    message: string;
  } | null>(null);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponValidating(true);
    setCouponResult(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      setCouponResult(data);
    } catch {
      setCouponResult({ valid: false, message: "Could not validate coupon." });
    } finally {
      setCouponValidating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const body = {
      posterFirstName: data.get("posterFirstName"),
      posterLastName: data.get("posterLastName"),
      posterEmail: data.get("posterEmail"),
      company: data.get("company"),
      title: data.get("title"),
      role: data.get("role"),
      location: data.get("location"),
      remote: data.get("remote") === "on",
      typeOfRole: data.get("typeOfRole"),
      experienceLevel: data.get("experienceLevel"),
      compensation: data.get("compensation"),
      companyUrl: data.get("companyUrl"),
      companySize: data.get("companySize"),
      visaSponsorship: data.get("visaSponsorship") === "on",
      jobUrl: data.get("jobUrl"),
      description: data.get("description"),
      matchFrequency,
      ...(couponResult?.valid ? { couponCode: couponCode.trim().toUpperCase() } : {}),
    };

    const isFree = couponResult?.valid && couponResult?.isFree;

    try {
      const endpoint = isFree ? "/api/jobs/free" : "/api/stripe/checkout";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      if (isFree) {
        window.location.href = `/post-a-job/success?job_id=${json.jobId}`;
      } else {
        window.location.href = json.url;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-black text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="text-brand-red font-medium text-sm tracking-wide uppercase mb-4">Post a job</p>
            <h1 className="font-display text-display-md font-bold text-white mb-4 text-balance">
              Find your next designer through Design Better.
            </h1>
            <p className="text-brand-gray-300 text-lg leading-relaxed">
              One post. 230,000+ readers. A curated shortlist of senior designers delivered to your inbox.
            </p>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 px-6 bg-brand-gray-50 border-b border-brand-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-brand-gray-100 rounded-xl p-5">
                <div className="w-9 h-9 rounded bg-brand-red/10 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-brand-red" />
                </div>
                <p className="font-semibold text-brand-black mb-2">{title}</p>
                <p className="text-sm text-brand-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-display-sm font-bold text-brand-black mb-2">
                Tell us about the role
              </h2>
              <p className="text-brand-gray-500 text-sm mb-8">
                Fill in the details below. After submitting, you&apos;ll be taken to checkout —{" "}
                {couponResult?.valid && !couponResult.isFree && couponResult.discountedPrice !== undefined ? (
                  <><s className="text-brand-gray-400">${JOB_POSTING_PRICE_DOLLARS}</s> <span className="text-green-600 font-medium">${couponResult.discountedPrice}</span></>
                ) : couponResult?.valid && couponResult.isFree ? (
                  <><s className="text-brand-gray-400">${JOB_POSTING_PRICE_DOLLARS}</s> <span className="text-green-600 font-medium">free!</span></>
                ) : `$${JOB_POSTING_PRICE_DOLLARS}`}{" "}
                for 60 days.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input id="posterFirstName" name="posterFirstName" label="Your first name" required />
                  <Input id="posterLastName" name="posterLastName" label="Your last name" required />
                </div>
                <Input
                  id="posterEmail"
                  name="posterEmail"
                  type="email"
                  label="Your work email"
                  hint="We'll send your candidate shortlist here."
                  required
                />
                <Input id="company" name="company" label="Company name" required />
                <Input
                  id="companyUrl"
                  name="companyUrl"
                  type="url"
                  label="Company website"
                  placeholder="https://yourcompany.com"
                  hint="Used to display your company logo on your listing automatically."
                />

                <hr className="border-brand-gray-100" />

                <Input id="title" name="title" label="Job title" placeholder="e.g. Senior Product Designer" required />
                <Select
                  id="role"
                  name="role"
                  label="Role category"
                  placeholder="Select a category"
                  options={PRIMARY_ROLES.map((r) => ({ value: r, label: r }))}
                  required
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    id="typeOfRole"
                    name="typeOfRole"
                    label="Type of role"
                    placeholder="Select type"
                    options={roleTypeOptions}
                    required
                  />
                  <Select
                    id="experienceLevel"
                    name="experienceLevel"
                    label="Experience level"
                    placeholder="Select level"
                    options={EXPERIENCE_LEVELS.map((l) => ({ value: l, label: l }))}
                    required
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input id="location" name="location" label="Location" placeholder="e.g. New York, NY or Remote" required />
                  <Select
                    id="companySize"
                    name="companySize"
                    label="Company size"
                    placeholder="Select size"
                    options={COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))}
                  />
                </div>
                <Input
                  id="compensation"
                  name="compensation"
                  label="Compensation range (optional)"
                  placeholder="e.g. $120,000–$160,000"
                  hint="Listings with compensation get more qualified applicants."
                />
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="remote" className="w-4 h-4 rounded border-brand-gray-300" />
                    <span className="text-sm font-medium text-brand-gray-700">Remote-friendly</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="visaSponsorship" className="w-4 h-4 rounded border-brand-gray-300" />
                    <span className="text-sm font-medium text-brand-gray-700">Visa sponsorship available</span>
                  </label>
                </div>

                <hr className="border-brand-gray-100" />

                <Input
                  id="jobUrl"
                  name="jobUrl"
                  type="url"
                  label="Link to full job description (optional)"
                  placeholder="https://..."
                  hint="Candidates will be sent here to apply."
                />
                <Textarea
                  id="description"
                  name="description"
                  label="Job description (optional if you have a URL)"
                  placeholder="Paste your job description here..."
                  rows={8}
                />

                {/* Candidate matching */}
                <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-brand-gray-700 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-red" /> Automated candidate matching
                  </p>
                  <p className="text-xs text-brand-gray-500 mb-3">
                    We match your role against our talent pool and deliver ranked profiles to your inbox automatically. No manual searching required.
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "once", label: "Once — a shortlist when my job goes live" },
                      { value: "weekly", label: "Weekly — fresh matches every 7 days" },
                      { value: "biweekly", label: "Bi-weekly — new matches every two weeks" },
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="matchFrequency"
                          value={value}
                          checked={matchFrequency === value}
                          onChange={() => setMatchFrequency(value)}
                          className="w-4 h-4 accent-brand-red"
                        />
                        <span className="text-sm text-brand-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coupon code */}
                <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-lg p-4">
                  <p className="text-sm font-medium text-brand-gray-700 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Have a coupon code?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Enter code"
                      className="flex-1 h-9 px-3 text-sm border border-brand-gray-200 rounded bg-white focus:border-brand-black focus:outline-none uppercase tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponValidating}
                      className="h-9 px-4 text-sm font-medium rounded border border-brand-gray-200 hover:border-brand-black transition-colors disabled:opacity-40"
                    >
                      {couponValidating ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  {couponResult && (
                    <p className={`text-sm mt-2 font-medium ${couponResult.valid ? "text-green-600" : "text-red-600"}`}>
                      {couponResult.valid ? "✓" : "✗"} {couponResult.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={loading} className="gap-2">
                  {loading
                    ? "Submitting..."
                    : couponResult?.valid && couponResult?.isFree
                    ? "Post for free"
                    : couponResult?.valid && couponResult?.discountedPrice !== undefined
                    ? `Continue to payment — $${couponResult.discountedPrice}`
                    : `Continue to payment — $${JOB_POSTING_PRICE_DOLLARS}`}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-6 sticky top-24">
                <p className="font-display font-bold text-brand-black text-lg mb-1">One-time post</p>
                {couponResult?.valid && !couponResult.isFree && couponResult.discountedPrice !== undefined ? (
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-display-sm font-display font-bold text-brand-red">${couponResult.discountedPrice}</p>
                    <p className="text-lg font-display text-brand-gray-400 line-through">${JOB_POSTING_PRICE_DOLLARS}</p>
                  </div>
                ) : couponResult?.valid && couponResult.isFree ? (
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-display-sm font-display font-bold text-green-600">Free</p>
                    <p className="text-lg font-display text-brand-gray-400 line-through">${JOB_POSTING_PRICE_DOLLARS}</p>
                  </div>
                ) : (
                  <p className="text-display-sm font-display font-bold text-brand-red mb-4">${JOB_POSTING_PRICE_DOLLARS}</p>
                )}
                <ul className="flex flex-col gap-3 text-sm text-brand-gray-600">
                  {[
                    "Active for 60 days",
                    "Listed in the talent directory",
                    "Featured in The Roundup newsletter",
                    "Curated candidate shortlist delivered",
                    "View count analytics via email",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-brand-gray-200">
                  <p className="text-xs text-brand-gray-400">
                    Questions? Email{" "}
                    <a href="mailto:careers@thecuriositydepartment.com" className="underline hover:text-brand-black">
                      careers@thecuriositydepartment.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
