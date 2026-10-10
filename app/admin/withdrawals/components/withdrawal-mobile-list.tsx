// features/withdrawals/components/withdrawals-mobile-list.tsx
import { ArrowDownLeft } from "lucide-react";
import { formatDateTime } from "@/libs/formatter/date";
import { formatCurrency } from "@/libs/formatter/money";
import type { AdminWithdrawalRow } from "../types/withdrawal";
import WithdrawalStatusBadge from "./withdrawal-badge";
import WalletAvatar from "../../wallets/components/walletAvatar";

function InfoBox({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/1.5 p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium text-zinc-200 ${truncate ? "truncate" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function WithdrawalsMobileList({
  withdrawals,
  onView,
  onApprove,
  onReject,
  onComplete,
}: {
  withdrawals: AdminWithdrawalRow[];
  onView: (w: AdminWithdrawalRow) => void;
  onApprove: (id: string) => void;
  onReject: (w: AdminWithdrawalRow) => void;
  onComplete: (id: string) => void;
}) {
  return (
    <div className="space-y-4 lg:hidden">
      {withdrawals.map((w) => (
        <div
          key={w.withdrawal_id}
          className="rounded-2xl border border-white/6 bg-[#0b1016] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <WalletAvatar name={w.full_name ?? w.email} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {w.full_name ?? "—"}
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-600">
                  {w.reference}
                </p>
              </div>
            </div>
            <WithdrawalStatusBadge status={w.status} />
          </div>

          <div className="mt-5 rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/2.5 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Withdrawal Amount
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCurrency(w.amount, "USD")}
                </p>
              </div>
              <ArrowDownLeft size={20} className="text-[#f0b90b]" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-zinc-600">Fee</span>
              <span className="text-zinc-400">
                {formatCurrency(w.fee, "USD")}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-zinc-600">User receives</span>
              <span className="font-medium text-emerald-400">
                {formatCurrency(w.net_amount, "USD")}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <InfoBox label="Asset" value={w.asset ?? "—"} />
            <InfoBox label="Requested" value={formatDateTime(w.requested_at)} />
            <InfoBox
              label="Destination"
              value={w.destination_address ?? "—"}
              truncate
            />
            <InfoBox label="User Email" value={w.email} truncate />
          </div>

          <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => onView(w)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/6 bg-white/2 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Details
            </button>
            {w.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => onReject(w)}
                  className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(w.withdrawal_id)}
                  className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/15"
                >
                  Approve
                </button>
              </>
            )}
            {w.status === "approved" && (
              <button
                type="button"
                onClick={() => onComplete(w.withdrawal_id)}
                className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/15"
              >
                Mark Completed
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
