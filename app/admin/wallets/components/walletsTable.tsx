import { MoreHorizontal } from "lucide-react";
import { formatRelativeTime } from "@/libs/formatter/relative-time";
import { AdminWalletRow } from "../types/wallet";
import WalletAvatar from "./walletAvatar";
import { formatMoney } from "@/libs/formatter/money";
import WalletStatusBadge from "./walletStatusBadge";

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
      {children}
    </th>
  );
}

export default function WalletsTable({
  wallets,
}: {
  wallets: AdminWalletRow[];
}) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <TableHead>User</TableHead>
            <TableHead>Wallet ID</TableHead>
            <TableHead>Total Balance</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Invested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <th className="w-12 px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr
              key={wallet.wallet_id}
              className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar name={wallet.full_name ?? wallet.email} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {wallet.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-zinc-600">{wallet.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-xs text-zinc-500">
                  {wallet.wallet_id.slice(0, 8)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm font-semibold text-white">
                  {formatMoney(wallet.balance)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm text-emerald-400">
                  {formatMoney(wallet.available_balance)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm text-zinc-300">
                  {formatMoney(wallet.invested_balance)}
                </span>
              </td>
              <td className="px-5 py-4">
                <WalletStatusBadge status={wallet.status} />
              </td>
              <td className="px-5 py-4">
                <span className="text-xs text-zinc-600">
                  {formatRelativeTime(wallet.updated_at)}
                </span>
              </td>
              <td className="px-5 py-4">
                <button className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-white">
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
