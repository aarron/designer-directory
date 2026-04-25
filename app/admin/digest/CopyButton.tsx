"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button size="sm" variant={copied ? "secondary" : "primary"} onClick={handleCopy} className="gap-1.5">
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy HTML"}
    </Button>
  );
}
