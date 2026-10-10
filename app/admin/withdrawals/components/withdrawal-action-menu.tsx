// components/bnb/admin/withdrawals/WithdrawalActionsMenu.tsx
"use client";

import { useState } from "react";
import { Eye, Check, XCircle, MoreHorizontal } from "lucide-react";
import { AdminWithdrawalRow } from "../types/withdrawal";

export default function WithdrawalActionsMenu({
  withdrawal,
  onView,
  onApprove,
  onReject,
  onComplete,
}: {
  withdrawal: AdminWithdrawalRow;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end gap-1">
      <button
        onClick={onView}
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
        title="View details"
      >
        <Eye size={17} />
      </button>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11171f] p-1.5 shadow-2xl">
            <button
              onClick={() => {
                onView();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Eye size={15} /> View Details
            </button>
            {withdrawal.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    onApprove();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-emerald-400 transition hover:bg-emerald-500/10"
                >
                  <Check size={15} /> Approve
                </button>
                <button
                  onClick={() => {
                    onReject();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <XCircle size={15} /> Reject
                </button>
              </>
            )}
            {withdrawal.status === "approved" && (
              <button
                onClick={() => {
                  onComplete();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-emerald-400 transition hover:bg-emerald-500/10"
              >
                <Check size={15} /> Mark Completed
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
