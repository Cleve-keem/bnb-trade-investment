// components/bnb/admin/deposits/DepositActions.tsx
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { AdminDepositRow } from "../types/deposit";

export default function DepositActions({
  deposit,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
}: {
  deposit: AdminDepositRow;
  onConfirm: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isConfirming: boolean;
  isRejecting: boolean;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  if (deposit.status !== "pending") {
    return <span className="text-xs text-zinc-700">—</span>;
  }

  if (rejecting) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason..."
          className="h-8 w-32 rounded-lg border border-white/[0.07] bg-black/20 px-2 text-xs text-white outline-none placeholder:text-zinc-600"
        />
        <button
          disabled={!reason.trim() || isRejecting}
          onClick={() => onReject(deposit.deposit_id, reason.trim())}
          className="rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 disabled:opacity-40"
        >
          {isRejecting ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setRejecting(false)}
          className="text-xs text-zinc-600 hover:text-white"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={isConfirming}
        onClick={() => onConfirm(deposit.deposit_id)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
        aria-label="Confirm deposit"
      >
        <Check size={15} />
      </button>
      <button
        onClick={() => setRejecting(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
        aria-label="Reject deposit"
      >
        <X size={15} />
      </button>
    </div>
  );
}
