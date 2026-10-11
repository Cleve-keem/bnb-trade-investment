"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  DollarSign,
  ShieldCheck,
  X,
  XCircle,
  Clock3,
} from "lucide-react";
import { formatDateTime } from "@/libs/formatter/date";
import { AdminWithdrawalRow } from "../types/withdrawal";
import WithdrawalStatusBadge from "./withdrawal-badge";
import { formatCurrency } from "@/libs/formatter/money";

export default function WithdrawalDetailsModal({
  withdrawal,
  onClose,
  onApprove,
  onReject,
  onComplete,
}: {
  withdrawal: AdminWithdrawalRow;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    if (!withdrawal.destination_address) return;
    await navigator.clipboard.writeText(withdrawal.destination_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/8 bg-[#0d131a] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Withdrawal Request
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-lg font-semibold">{withdrawal.reference}</h2>
              <WithdrawalStatusBadge status={withdrawal.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="rounded-xl border border-white/6 bg-white/2 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0b90b] text-sm font-bold text-black">
                {(withdrawal.full_name ?? withdrawal.email)
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {withdrawal.full_name ?? "—"}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {withdrawal.email}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/2.5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-600">Requested Amount</p>
                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(withdrawal.amount, "USD")}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b]/10">
                <DollarSign size={19} className="text-[#f0b90b]" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Fee
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {formatCurrency(withdrawal.fee, "USD")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Net Amount
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-400">
                  {formatCurrency(withdrawal.net_amount, "USD")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Asset
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {withdrawal.asset ?? "—"}
                  {withdrawal.network ? ` (${withdrawal.network})` : ""}
                </p>
              </div>
            </div>
          </div>

          {withdrawal.destination_address && (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
                Destination
              </p>
              <div className="rounded-xl border border-white/6 bg-white/2 p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Wallet Address
                    </p>
                    <p className="mt-1 break-all font-mono text-sm text-zinc-300">
                      {withdrawal.destination_address}
                    </p>
                  </div>
                  <button
                    onClick={copyAddress}
                    className="shrink-0 rounded-lg border border-white/6 p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                  >
                    {copied ? (
                      <Check size={15} className="text-emerald-400" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Timeline
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/1.5 p-3">
                <Clock3 size={15} className="shrink-0 text-zinc-500" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Requested
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-300">
                    {formatDateTime(withdrawal.requested_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/1.5 p-3">
                <ShieldCheck size={15} className="shrink-0 text-zinc-500" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Processed
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-300">
                    {withdrawal.processed_at
                      ? formatDateTime(withdrawal.processed_at)
                      : "Awaiting completion"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {withdrawal.status === "rejected" && withdrawal.rejection_reason && (
            <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4 text-sm text-red-300">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400/70">
                Rejection reason
              </p>
              <p className="mt-1">{withdrawal.rejection_reason}</p>
            </div>
          )}

          {withdrawal.status === "pending" && (
            <div className="rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/2.5 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#f0b90b]"
                />
                <div>
                  <p className="text-sm font-medium">Review this withdrawal</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    Verify the request and destination before approving.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={onReject}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                >
                  <XCircle size={16} /> Reject Withdrawal
                </button>
                <button
                  onClick={onApprove}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/15"
                >
                  <Check size={16} /> Approve Withdrawal
                </button>
              </div>
            </div>
          )}

          {withdrawal.status === "approved" && (
            <div className="rounded-xl border border-blue-500/10 bg-blue-500/2.5 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-400"
                />
                <div>
                  <p className="text-sm font-medium">
                    Approved — awaiting settlement
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    Once you've actually sent the funds, mark this completed to
                    debit the wallet.
                  </p>
                </div>
              </div>
              <button
                onClick={onComplete}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/15"
              >
                <Check size={16} /> Mark Completed
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
