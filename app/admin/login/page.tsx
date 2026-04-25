"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });

    if (res.ok) {
      window.location.href = "/admin";
    } else {
      setError("Invalid secret.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-display text-display-sm font-bold text-brand-black mb-8">Admin access</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="secret"
          label="Admin secret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={loading}>{loading ? "Verifying..." : "Sign in"}</Button>
      </form>
    </div>
  );
}
