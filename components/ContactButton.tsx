"use client";

import { useState } from "react";
import { Mail, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  designerId: string;
  firstName: string;
}

export function ContactButton({ designerId, firstName }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designerId,
          name: data.get("name"),
          company: data.get("company"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function close() {
    setOpen(false);
    setTimeout(() => { setSent(false); setError(""); }, 300);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm font-medium rounded hover:bg-brand-red/90 transition-colors"
      >
        <Mail className="w-4 h-4" />
        Contact
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={close}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <button
              onClick={close}
              className="absolute top-4 right-4 text-brand-gray-400 hover:text-brand-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="font-display font-bold text-brand-black text-lg mb-2">Message sent!</h2>
                <p className="text-brand-gray-500 text-sm">
                  {firstName} will receive your message and can reply directly to your email.
                </p>
                <button
                  onClick={close}
                  className="mt-6 text-sm text-brand-gray-500 hover:text-brand-black transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display font-bold text-brand-black text-lg mb-1">
                  Contact {firstName}
                </h2>
                <p className="text-brand-gray-500 text-sm mb-5">
                  Your message goes directly to {firstName}. They'll reply to your email.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Your name</label>
                      <input
                        name="name"
                        required
                        placeholder="Jane Smith"
                        className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Company</label>
                      <input
                        name="company"
                        required
                        placeholder="Acme Inc."
                        className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Your email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className="w-full h-9 px-3 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-brand-gray-700 mb-1 block">Message</label>
                    <textarea
                      name="message"
                      required
                      minLength={10}
                      rows={4}
                      placeholder={`Hi ${firstName}, I came across your profile and...`}
                      className="w-full px-3 py-2 text-sm border border-brand-gray-200 rounded focus:border-brand-black focus:outline-none resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <Button type="submit" disabled={sending} className="w-full">
                    {sending ? "Sending…" : "Send message"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
