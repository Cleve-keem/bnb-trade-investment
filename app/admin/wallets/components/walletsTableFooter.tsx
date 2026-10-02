import { ChevronLeft, ChevronRight } from "lucide-react";

export default function WalletsTableFooter({
  count,
  total,
}: {
  count: number;
  total: number;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-zinc-600">
        Showing <span className="text-zinc-400">{count}</span> of{" "}
        <span className="text-zinc-400">{total}</span> wallets
      </p>

      {/* Placeholder only — no server-side pagination wired up yet, so these
          are disabled rather than pretending to page through results. */}
      <div className="flex items-center gap-1">
        <button
          disabled
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-700 opacity-50"
        >
          <ChevronLeft size={15} />
        </button>
        <button className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#f0b90b]/10 px-2 text-xs text-[#f0b90b]">
          1
        </button>
        <button
          disabled
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-700 opacity-50"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
