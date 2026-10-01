import { Copy } from "lucide-react";

export default function DetailItem({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  }

  return (
    <div className="flex items-start gap-3 px-5 py-5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-zinc-600">
          {label}
        </p>

        <div className="mt-1.5 flex items-center gap-2">
          <p
            className={`min-w-0 truncate text-sm text-zinc-300 ${
              label === "Transaction ID" || label === "Reference"
                ? "font-mono text-xs"
                : ""
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
              <Copy size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
