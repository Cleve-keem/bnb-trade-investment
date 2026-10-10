// components/bnb/admin/withdrawals/RejectReasonPrompt.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function RejectReasonPrompt({
  onConfirm,
  onCancel,
  isSubmitting,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onCancel}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d131a] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Reject withdrawal</h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection (shown to the user)"
          rows={3}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/[0.06] py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim() || isSubmitting}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 rounded-xl bg-red-500/10 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/15 disabled:opacity-40"
          >
            {isSubmitting ? "Rejecting..." : "Confirm reject"}
          </button>
        </div>
      </div>
    </div>
  );
}
