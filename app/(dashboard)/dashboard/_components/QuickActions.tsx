"use client";

import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export default function QuickActions({
  onDeposit,
  onWithdraw,
}: {
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDeposit}
        className="flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f5c52c]"
      >
        <ArrowDownToLine size={16} />
        Add Funds
      </button>
      <button
        type="button"
        onClick={onWithdraw}
        className="flex items-center gap-2 rounded-xl border border-white/7 bg-white/3 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/6"
      >
        <ArrowUpFromLine size={16} />
        Withdraw
      </button>
    </div>
  );
}
