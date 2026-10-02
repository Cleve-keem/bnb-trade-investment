import { formatMoney } from "@/libs/formatter/money";
import { AdminWalletRow } from "../types/wallet";
import WalletAvatar from "./walletAvatar";
import WalletStatusBadge from "./walletStatusBadge";

function InfoBox({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${positive ? "text-emerald-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function WalletsMobileList({
  wallets,
}: {
  wallets: AdminWalletRow[];
}) {
  return (
    <div className="divide-y divide-white/[0.05] lg:hidden">
      {wallets.map((wallet) => (
        <div key={wallet.wallet_id} className="p-4">
          <div className="flex items-center gap-3">
            <WalletAvatar name={wallet.full_name ?? wallet.email} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {wallet.full_name ?? "—"}
              </p>
              <p className="truncate text-xs text-zinc-600">{wallet.email}</p>
            </div>
            <WalletStatusBadge status={wallet.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="Balance" value={formatMoney(wallet.balance)} />
            <InfoBox
              label="Available"
              value={formatMoney(wallet.available_balance)}
              positive
            />
            <InfoBox
              label="Invested"
              value={formatMoney(wallet.invested_balance)}
            />
            <InfoBox label="Wallet ID" value={wallet.wallet_id.slice(0, 8)} />
          </div>
        </div>
      ))}
    </div>
  );
}
