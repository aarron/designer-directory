"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * "Load N more" for the jobs table. The URL's ?page=N means "the first N pages",
 * so this is a soft navigation to page N+1: the server re-renders with more
 * rows, React keeps the rows already on screen (keyed by job id) and appends
 * the new ones, and the URL updates as it goes. That keeps what pagination is
 * good for — a shareable link, a working back button, a reachable footer,
 * indexable deep pages — without the hard stop between pages.
 */
export function LoadMoreButton({ href, remaining, step }: {
  href: string;
  remaining: number;
  step: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const n = Math.min(step, remaining);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.push(href, { scroll: false }))}
      className="inline-flex items-center gap-2 font-mono text-[11px] font-normal uppercase tracking-[0.12em] px-6 py-3 rounded-md transition-colors duration-[120ms] disabled:opacity-60"
      style={{ background: "#0A0A0A", color: "#F5F2EC" }}
    >
      {pending ? "Loading…" : `Load ${n} more`}
      {!pending && (
        <span style={{ color: "#FF4725" }}>· {remaining} remaining</span>
      )}
    </button>
  );
}
