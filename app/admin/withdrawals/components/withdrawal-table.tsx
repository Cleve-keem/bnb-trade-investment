import { formatDateTime } from "@/libs/formatter/date";
import { AdminWithdrawalRow } from "../types/withdrawal";
import WalletAvatar from "../../wallets/components/walletAvatar";
import WithdrawalStatusBadge from "./withdrawal-badge";
import WithdrawalActionsMenu from "./withdrawal-action-menu";
import { formatCurrency } from "@/libs/formatter/money";


export default function WithdrawalsTable({
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
    <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1016] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px]">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.015]">
              {[
                "User",
                "Amount",
                "Asset",
                "Net Amount",
                "Destination",
                "Requested",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600"
                >
                  {h}
                </th>
              ))}
              <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr
                key={w.withdrawal_id}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.015]"
              >
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <WalletAvatar name={w.full_name ?? w.email} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {w.full_name ?? "—"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-600">
                        {w.reference}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5">
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(w.amount, "USD")}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Fee {formatCurrency(w.fee, "USD")}
                  </p>
                </td>
                <td className="px-5 py-5">
                  <span className="text-sm text-zinc-300">
                    {w.asset ?? "—"}
                  </span>
                </td>
                <td className="px-5 py-5">
                  <p className="text-sm font-medium text-zinc-300">
                    {formatCurrency(w.net_amount, "USD")}
                  </p>
                </td>
                <td className="px-5 py-5">
                  <p className="max-w-[170px] truncate text-sm text-zinc-400">
                    {w.destination_address ?? "—"}
                  </p>
                </td>
                <td className="px-5 py-5">
                  <p className="text-sm text-zinc-300">
                    {formatDateTime(w.requested_at)}
                  </p>
                </td>
                <td className="px-5 py-5">
                  <WithdrawalStatusBadge status={w.status} />
                </td>
                <td className="px-5 py-5">
                  <WithdrawalActionsMenu
                    withdrawal={w}
                    onView={() => onView(w)}
                    onApprove={() => onApprove(w.withdrawal_id)}
                    onReject={() => onReject(w)}
                    onComplete={() => onComplete(w.withdrawal_id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
