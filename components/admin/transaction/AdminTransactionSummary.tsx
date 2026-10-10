"use client";

import { ArrowUpRight, Clock3, Wallet, XCircle } from "lucide-react";
import { useAdminTransactionStats } from "@/hooks/transaction";
import { formatCurrency } from "@/libs/formatter/money";

export default function AdminTransactionsSummary() {
  const { data, isPending } = useAdminTransactionStats();
  const show = (value: string | undefined) => (isPending || value === undefined ? "—" : value);

  const cards = [
    { title: "Completed Volume", value: show(data && formatCurrency(data.completedVolume)), icon: Wallet },
    { title: "Transactions", value: show(data?.totalCount.toLocaleString()), icon: ArrowUpRight },
    { title: "Pending", value: show(data?.pendingCount.toLocaleString()), icon: Clock3 },
    { title: "Failed", value: show(data?.failedCount.toLocaleString()), icon: XCircle },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
        <div key={title} className="rounded-2xl border border-white/6 bg-white/2.5 p-5">
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