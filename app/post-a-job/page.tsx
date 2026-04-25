"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PRIMARY_ROLES, EXPERIENCE_LEVELS, COMPANY_SIZES } from "@/lib/utils";
import { Users, Mail, Briefcase, ArrowRight, CheckCircle } from "lucide-react";

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
      companySize: data.get("companySize"),
      visaSponsorship: data.get("visaSponsorship") === "on",
      jobUrl: data.get("jobUrl"),
      description: data.get("description"),
    };

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      window.location.href = json.url;
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
                Fill in the details below. After submitting, you&apos;ll be taken to checkout — $249 for 60 days.
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

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={loading} className="gap-2">
                  {loading ? "Preparing checkout..." : "Continue to payment — $249"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-6">
              <div className="bg-brand-gray-50 border border-brand-gray-100 rounded-xl p-6 sticky top-24">
                <p className="font-display font-bold text-brand-black text-lg mb-1">One-time post</p>
                <p className="text-display-sm font-display font-bold text-brand-red mb-4">$249</p>
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
                    <a href="mailto:jobs@thecuriositydepartment.com" className="underline hover:text-brand-black">
                      jobs@thecuriositydepartment.com
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
