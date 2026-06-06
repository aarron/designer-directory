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

interface Props {
  subscriberLabel: string | null;
}

export function PostAJobClient({ subscriberLabel }: Props) {
  const readerTitle = subscriberLabel ? `${subscriberLabel} readers` : "Newsletter readers";
  const readerHeroCopy = subscriberLabel
    ? `One post. ${subscriberLabel} readers. A curated shortlist of senior designers delivered to your inbox.`
    : "One post. A curated shortlist of senior designers delivered to your inbox.";

  const perks = [
    {
      icon: Users,
      title: readerTitle,
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
      <section data-theme="dark" className="py-20 px-6" style={{ background: "#0A0A0A" }}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p className="font-mono text-[11px] font-normal uppercase tracking-[0.12em] mb-4" style={{ color: "var(--signal-text)" }}>Post a job</p>
            <h1 className="font-display text-display-md font-bold mb-4 text-balance" style={{ color: "var(--text-1)" }}>
              Find your next designer through Design Better.
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-2)" }}>
              {readerHeroCopy}
            </p>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="py-16 px-6" style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--divider)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5" style={{ background: "var(--surface-1)" }}>
                <div className="w-9 h-9 rounded flex items-center justify-center mb-4" style={{ background: "rgba(255,71,37,0.1)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#FF4725" }} />
                </div>
                <p className="font-bold mb-2" style={{ color: "var(--text-1)" }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6" style={{ background: "var(--bg)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-display-sm font-bold mb-2" style={{ color: "var(--text-1)" }}>
                Tell us about the role
              </h2>
              <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
                Fill in the details below. After submitting, you&apos;ll be taken to checkout —{" "}
                {couponResult?.valid && !couponResult.isFree && couponResult.discountedPrice !== undefined ? (
                  <><s style={{ color: "var(--text-3)" }}>${JOB_POSTING_PRICE_DOLLARS}</s> <span className="font-medium" style={{ color: "var(--newsletter-fg)" }}>${couponResult.discountedPrice}</span></>
                ) : couponResult?.valid && couponResult.isFree ? (
                  <><s style={{ color: "var(--text-3)" }}>${JOB_POSTING_PRICE_DOLLARS}</s> <span className="font-medium" style={{ color: "var(--newsletter-fg)" }}>free!</span></>
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

                <hr style={{ borderColor: "var(--divider)" }} />

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
                    <input type="checkbox" name="remote" className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Remote-friendly</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="visaSponsorship" className="w-4 h-4 rounded" />
                    <span className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Visa sponsorship available</span>
                  </label>
                </div>

                <hr style={{ borderColor: "var(--divider)" }} />

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
                <div className="p-4" style={{ background: "var(--surface-1)" }}>
                  <p className="text-sm font-medium mb-1 flex items-center gap-2" style={{ color: "var(--text-1)" }}>
                    <Zap className="w-4 h-4" style={{ color: "#FF4725" }} /> Automated candidate matching
                  </p>
                  <p className="text-xs mb-3" style={{ color: "var(--text-3)" }}>
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
                          className="w-4 h-4"
                          style={{ accentColor: "#FF4725" }}
                        />
                        <span className="text-sm" style={{ color: "var(--text-2)" }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coupon code */}
                <div className="p-4" style={{ background: "var(--surface-1)" }}>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: "var(--text-1)" }}>
                    <Tag className="w-4 h-4" /> Have a coupon code?
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Enter code"
                      className="flex-1 h-9 px-3 text-sm focus:outline-none uppercase tracking-widest"
                      style={{ border: "1px solid var(--input-border)", background: "var(--surface-2)", color: "var(--text-1)" }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || couponValidating}
                      className="h-9 px-4 text-sm font-medium rounded-md transition-colors duration-[120ms] disabled:opacity-40"
                      style={{ background: "#0A0A0A", color: "#F5F2EC" }}
                    >
                      {couponValidating ? "Checking…" : "Apply"}
                    </button>
                  </div>
                  {couponResult && (
                    <p className="text-sm mt-2 font-medium" style={{ color: couponResult.valid ? "var(--newsletter-fg)" : "var(--video-fg)" }}>
                      {couponResult.valid ? "✓" : "✗"} {couponResult.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-md px-4 py-3 text-sm" style={{ background: "var(--video-bg)", borderLeft: "3px solid var(--video-fg)", color: "var(--video-fg)" }}>
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
              <div className="p-6 sticky top-24" style={{ background: "var(--surface-1)" }}>
                <p className="font-display font-bold text-lg mb-1" style={{ color: "var(--text-1)" }}>One-time post</p>
                {couponResult?.valid && !couponResult.isFree && couponResult.discountedPrice !== undefined ? (
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-display-sm font-display font-bold" style={{ color: "#FF4725" }}>${couponResult.discountedPrice}</p>
                    <p className="text-lg font-display line-through" style={{ color: "var(--text-3)" }}>${JOB_POSTING_PRICE_DOLLARS}</p>
                  </div>
                ) : couponResult?.valid && couponResult.isFree ? (
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-display-sm font-display font-bold" style={{ color: "var(--newsletter-fg)" }}>Free</p>
                    <p className="text-lg font-display line-through" style={{ color: "var(--text-3)" }}>${JOB_POSTING_PRICE_DOLLARS}</p>
                  </div>
                ) : (
                  <p className="text-display-sm font-display font-bold mb-4" style={{ color: "#FF4725" }}>${JOB_POSTING_PRICE_DOLLARS}</p>
                )}
                <ul className="flex flex-col gap-3 text-sm" style={{ color: "var(--text-2)" }}>
                  {[
                    "Active for 60 days",
                    "Listed in the talent directory",
                    "Featured in The Roundup newsletter",
                    "Curated candidate shortlist delivered",
                    "View count analytics via email",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FF4725" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--divider)" }}>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    Questions? Email{" "}
                    <a href="mailto:careers@thecuriositydepartment.com" className="underline transition-colors duration-[120ms]" style={{ color: "var(--text-2)" }}>
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
