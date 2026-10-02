import { formatMoney } from "@/libs/formatter/money";
import { DollarSign, Wallet, LockKeyhole, Users } from "lucide-react";
import { AdminWalletRow } from "../types/wallet";

export default function WalletsSummary({
  wallets,
}: {
  wallets: AdminWalletRow[];
}) {
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const availableBalance = wallets.reduce(
    (sum, w) => sum + w.available_balance,
    0,
  );
  const investedBalance = wallets.reduce(
    (sum, w) => sum + w.invested_balance,
    0,
  );

  const cards = [
    {
      title: "Total Wallet Balance",
      value: formatMoney(totalBalance),
      icon: DollarSign,
    },
    {
      title: "Available Balance",
      value: formatMoney(availableBalance),
      icon: Wallet,
    },
    {
      title: "Invested Funds",
      value: formatMoney(investedBalance),
      icon: LockKeyhole,
    },
    {
      title: "Wallet Holders",
      value: wallets.length.toLocaleString(),
      icon: Users,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
        <div
          key={title}
          className="rounded-2xl border border-white/6 bg-white/2.5 p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">{title}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
              <Icon size={17} />
            </div>
          </div>
          <p className="mt-3 text-xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </section>
  );
}
