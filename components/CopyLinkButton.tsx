"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 text-sm text-brand-gray-500 hover:text-brand-black transition-colors py-1"
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
