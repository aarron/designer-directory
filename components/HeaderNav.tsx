"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { JOB_POSTING_PRICE_DOLLARS } from "@/lib/stripe";

export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      data-theme="dark"
      className="sticky top-0 z-50 border-b backdrop-blur-[12px] backdrop-saturate-[180%]"
      style={{
        background: "rgba(10,10,10,0.92)",
        borderColor: "var(--divider)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
      }}
    >
      <div className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="hover:opacity-75 transition-opacity duration-[120ms] py-1">
          <Image
            src="/DesignBetterCareers.png"
            alt="Design Better Careers"
            width={148}
            height={52}
            style={{ width: 148, height: "auto" }}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <Link
            href="/talent"
            className="text-[14px] font-medium transition-colors duration-[120ms]"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          >
            Designers
          </Link>
          <Link
            href="/jobs"
            className="text-[14px] font-medium transition-colors duration-[120ms]"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          >
            Jobs
          </Link>
          <Link
            href="/join"
            className="text-[14px] font-medium transition-colors duration-[120ms]"
            style={{ color: "var(--text-2)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          >
            Create profile
          </Link>
          {/* CTA — rounded-md, signal bg, DARK text (never white on orange) */}
          <Link
            href="/post-a-job"
            className="rounded-md bg-[#FF4725] px-5 py-2 text-[14px] font-semibold text-[#0A0A0A] hover:bg-[#e03d1e] transition-colors duration-[120ms] whitespace-nowrap"
          >
            Post a Job — ${JOB_POSTING_PRICE_DOLLARS}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 transition-opacity duration-[120ms] hover:opacity-60"
          style={{ color: "var(--text-1)" }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t px-6 py-5 flex flex-col gap-5"
          style={{
            background: "rgba(10,10,10,0.97)",
            borderColor: "var(--divider)",
          }}
        >
          <Link
            href="/talent"
            className="text-[15px] font-medium"
            style={{ color: "var(--text-2)" }}
            onClick={() => setOpen(false)}
          >
            Designers
          </Link>
          <Link
            href="/jobs"
            className="text-[15px] font-medium"
            style={{ color: "var(--text-2)" }}
            onClick={() => setOpen(false)}
          >
            Jobs
          </Link>
          <Link
            href="/join"
            className="text-[15px] font-medium"
            style={{ color: "var(--text-2)" }}
            onClick={() => setOpen(false)}
          >
            Create profile
          </Link>
          <Link
            href="/post-a-job"
            className="rounded-md bg-[#FF4725] px-5 py-2.5 text-[14px] font-semibold text-[#0A0A0A] text-center hover:bg-[#e03d1e] transition-colors duration-[120ms]"
            onClick={() => setOpen(false)}
          >
            Post a Job — ${JOB_POSTING_PRICE_DOLLARS}
          </Link>
        </div>
      )}
    </header>
  );
}
