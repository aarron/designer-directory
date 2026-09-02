"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { JOB_POSTING_PRICE_DOLLARS } from "@/lib/stripe";

export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-gray-200">
      <div className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="hover:opacity-80 transition-opacity py-1">
          <Image src="/DesignBetterCareers.png" alt="Design Better Careers" width={160} height={57} style={{ width: 160, height: "auto" }} />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/talent" className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 transition-colors hover:text-black">
            Designers
          </Link>
          <Link href="/jobs" className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 transition-colors hover:text-black">
            Jobs
          </Link>
          <Link href="/join" className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 transition-colors hover:text-black">
            Create profile
          </Link>
          <Link href="/post-a-job" className="rounded bg-brand-red px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90">
            Post a Job — ${JOB_POSTING_PRICE_DOLLARS}
          </Link>
        </div>

        <button
          className="md:hidden text-brand-black p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-brand-gray-200 px-6 py-4 flex flex-col gap-4">
          <Link href="/talent" className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 py-1" onClick={() => setOpen(false)}>
            Designers
          </Link>
          <Link href="/jobs" className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 py-1" onClick={() => setOpen(false)}>
            Jobs
          </Link>
          <Link href="/join" className="text-xs font-bold uppercase tracking-widest text-brand-gray-500 py-1" onClick={() => setOpen(false)}>
            Create profile
          </Link>
          <Link href="/post-a-job" className="rounded bg-brand-red px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white text-center transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
            Post a Job — ${JOB_POSTING_PRICE_DOLLARS}
          </Link>
        </div>
      )}
    </header>
  );
}
