"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetch("/api/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success — don't reveal whether email exists
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
    <div className="max-w-lg mx-auto px-6 py-20">
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
            Check your inbox
          </h1>
          <p className="text-brand-gray-500 leading-relaxed">
            If we found a profile for <span className="font-medium text-brand-black">{email}</span>, we&apos;ve sent you a link to view and edit it.
          </p>
          <p className="text-sm text-brand-gray-400 mt-4">
            Don&apos;t see it? Check your spam folder or{" "}
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="underline hover:text-brand-black transition-colors"
            >
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-display-sm font-bold text-brand-black mb-3">
            Find and edit your profile
          </h1>
          <p className="text-brand-gray-500 mb-8 leading-relaxed">
            Enter the email address you used when you joined. We&apos;ll send you a link to view and update your profile.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-brand-gray-700 mb-1.5 block">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending…" : "Send my edit link"}
            </Button>
          </form>

          <p className="text-sm text-brand-gray-400 mt-6">
            Not in the directory yet?{" "}
            <a href="/join" className="underline hover:text-brand-black transition-colors">
              Add your profile — it&apos;s free
            </a>
            .
          </p>
        </>
      )}
    </div>
    </div>
  );
}
