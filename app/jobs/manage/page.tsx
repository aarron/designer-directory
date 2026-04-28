"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Mail } from "lucide-react";

export default function ManageJobPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobs/manage-resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {submitted ? (
          <div className="bg-white border border-brand-gray-100 rounded-xl p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="font-display text-xl font-bold text-brand-black mb-3">Check your inbox</h1>
            <p className="text-brand-gray-500 text-sm leading-relaxed">
              If any listings are associated with <strong className="text-brand-black">{email}</strong>, we&apos;ve sent you an email with links to manage each one.
            </p>
            <button
              onClick={() => { setSubmitted(false); setEmail(""); }}
              className="mt-6 text-sm text-brand-gray-400 hover:text-brand-black transition-colors underline"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <div className="bg-white border border-brand-gray-100 rounded-xl p-8">
            <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center mb-5">
              <Mail className="w-5 h-5 text-brand-red" />
            </div>
            <h1 className="font-display text-xl font-bold text-brand-black mb-2">Manage your job listing</h1>
            <p className="text-brand-gray-500 text-sm mb-7 leading-relaxed">
              Enter the email address you used when posting the job. We&apos;ll send you a link to view and manage your listings.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Sending…" : "Send manage link"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
