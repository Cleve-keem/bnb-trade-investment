// components/bnb/admin/deposits/DepositsSummary.tsx
import { DollarSign, Clock3, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminDepositRow } from "../types/deposit";
import { formatMoney } from "@/libs/formatter/money";

export default function DepositsSummary({
  deposits,
}: {
  deposits: AdminDepositRow[];
}) {
  const totalDeposited = deposits.reduce(
    (sum, d) => (d.status === "completed" ? sum + d.amount : sum),
    0,
  );
  const pendingAmount = deposits.reduce(
    (sum, d) => (d.status === "pending" ? sum + d.amount : sum),
    0,
  );
  const completedCount = deposits.filter(
    (d) => d.status === "completed",
  ).length;
  const failedCount = deposits.filter((d) => d.status === "failed").length;

  const cards = [
    {
      title: "Completed Deposits",
      value: formatMoney(totalDeposited),
      icon: DollarSign,
    },
    {
      title: "Pending Amount",
      value: formatMoney(pendingAmount),
      icon: Clock3,
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      icon: CheckCircle2,
    },
    { title: "Failed", value: failedCount.toString(), icon: AlertCircle },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, value, icon: Icon }) => (
        <div
          key={title}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5"
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
