"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black border-b border-brand-gray-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Image src="/logo-white.png" alt="Design Better" width={130} height={28} className="h-7 w-auto" />
          <span className="text-brand-gray-400 text-sm font-medium hidden sm:block">Careers</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/talent" className="text-brand-gray-300 hover:text-white text-sm font-medium transition-colors">
            Browse Talent
          </Link>
          <Link href="/jobs" className="text-brand-gray-300 hover:text-white text-sm font-medium transition-colors">
            Jobs
          </Link>
          <Link href="/join" className="text-brand-gray-300 hover:text-white text-sm font-medium transition-colors">
            Add Your Profile
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/post-a-job">
            <Button size="sm" className="font-medium">Post a Job — $249</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-brand-black border-t border-brand-gray-800 px-6 py-4 flex flex-col gap-4">
          <Link href="/talent" className="text-brand-gray-300 text-sm font-medium py-1" onClick={() => setOpen(false)}>
            Browse Talent
          </Link>
          <Link href="/jobs" className="text-brand-gray-300 text-sm font-medium py-1" onClick={() => setOpen(false)}>
            Jobs
          </Link>
          <Link href="/join" className="text-brand-gray-300 text-sm font-medium py-1" onClick={() => setOpen(false)}>
            Add Your Profile
          </Link>
          <Link href="/post-a-job" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full font-medium">Post a Job — $249</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
