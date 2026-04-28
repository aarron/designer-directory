"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { CheckCircle, Heart } from "lucide-react";
import { Suspense } from "react";

function SuccessStoryForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quote, setQuote] = useState("");
  const [company, setCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/success-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, quote, company, newRole, public: isPublic }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-24 text-brand-gray-400">
        <p>Invalid link. Check your email for the correct URL.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
          Thank you so much! 🎉
        </h1>
        <p className="text-brand-gray-500">
          Your story means a lot to us and to the designers who come after you. We&apos;ll review it
          and share it with our community. Wishing you all the best in your new role!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <Heart className="w-5 h-5 text-brand-red" />
        </div>
        <p className="text-sm font-medium text-brand-red uppercase tracking-wide">Success story</p>
      </div>
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-2">
        Tell us what happened
      </h1>
      <p className="text-brand-gray-500 mb-8">
        We&apos;d love to celebrate you and inspire other designers. This takes about 2 minutes.
        Your story may be featured in the Design Better newsletter (230k+ readers).
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Textarea
          id="quote"
          label="What would you like to share? *"
          placeholder="e.g. I updated my profile on a Tuesday and had three interviews by Friday. Landed a senior product design role at a company I'd been following for years."
          rows={5}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          required
        />
        <Input
          id="company"
          label="Company you joined (optional)"
          placeholder="e.g. Figma, Stripe, a stealth startup..."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Input
          id="newRole"
          label="Your new title (optional)"
          placeholder="e.g. Senior Product Designer"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded border-brand-gray-300 mt-0.5"
          />
          <div>
            <span className="text-sm font-medium text-brand-gray-700">
              I&apos;m happy for this story to be shared publicly
            </span>
            <p className="text-xs text-brand-gray-400 mt-0.5">
              We may feature it in our newsletter and on the website. Uncheck to share privately
              with the team only.
            </p>
          </div>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={submitting || !quote.trim()}>
          {submitting ? "Submitting..." : "Share my story →"}
        </Button>
      </form>
    </div>
  );
}

export default function SuccessStoryPage() {
  return (
    <div className="min-h-screen bg-brand-gray-50">
      <Suspense
        fallback={
          <div className="max-w-xl mx-auto px-6 py-24 text-center text-brand-gray-400">
            Loading...
          </div>
        }
      >
        <SuccessStoryForm />
      </Suspense>
    </div>
  );
}
