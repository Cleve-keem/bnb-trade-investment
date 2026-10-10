"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  wrap?: boolean;
};

export default function DetailItem({
  icon,
  label,
  value,
  copyable = false,
  mono = false,
  wrap = false,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="flex items-start gap-3 px-5 py-5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/4 text-zinc-500">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-zinc-600">
          {label}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <p
            className={`min-w-0 text-sm text-zinc-300 ${wrap ? "break-all" : "truncate"} ${
              mono ? "font-mono text-xs" : ""
            }`}
          >
            {value}
          </p>
          {copyable && value !== "—" && (
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 text-zinc-600 transition hover:text-zinc-300"
              title={`Copy ${label}`}
            >
              {copied ? (
                <Check size={13} className="text-emerald-400" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
