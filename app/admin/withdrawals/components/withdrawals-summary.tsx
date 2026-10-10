// features/withdrawals/components/withdrawals-summary.tsx
import { Check, Clock3, DollarSign, Send } from "lucide-react";
import { formatCurrency } from "@/libs/formatter/money";
import type { AdminWithdrawalRow } from "../types/withdrawal";

export default function WithdrawalsSummary({
  withdrawals,
}: {
  withdrawals: AdminWithdrawalRow[];
}) {
  const total = (
    rows: AdminWithdrawalRow[],
    pick: (w: AdminWithdrawalRow) => number,
  ) => rows.reduce((sum, w) => sum + pick(w), 0);

  const pending = withdrawals.filter((w) => w.status === "pending");
  const approved = withdrawals.filter((w) => w.status === "approved");
  const completed = withdrawals.filter((w) => w.status === "completed");
  const plural = (n: number) => (n === 1 ? "" : "s");

  const cards = [
    {
      label: "Pending Review",
      value: formatCurrency(
        total(pending, (w) => w.amount),
        "USD",
      ),
      icon: Clock3,
      valueClass: "text-[#f0b90b]",
      description: `${pending.length} request${plural(pending.length)} to review`,
    },
    {
      label: "Awaiting Settlement",
      value: formatCurrency(
        total(approved, (w) => w.amount),
        "USD",
      ),
      icon: Send,
      valueClass: "text-blue-400",
      description: `${approved.length} approved, funds not sent yet`,
    },
    {
      label: "Completed",
      value: formatCurrency(
        total(completed, (w) => w.amount),
        "USD",
      ),
      icon: Check,
      valueClass: "text-emerald-400",
      description: `${completed.length} paid out`,
    },
    {
      label: "Fees Collected",
      value: formatCurrency(
        total(completed, (w) => w.fee),
        "USD",
      ),
      icon: DollarSign,
      valueClass: "text-white",
      description: "From completed withdrawals",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, valueClass, description }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/6 bg-[#0b1016] p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">{label}</p>
              <p
                className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}
              >
                {value}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/4">
              <Icon size={17} className="text-[#f0b90b]" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">{description}</p>
        </div>
      ))}
    </div>
  );
}

// import { Clock3, Check, ArrowDownLeft, DollarSign } from "lucide-react";
// import { AdminWithdrawalRow } from "../types/withdrawal";
// import { formatMoney } from "@/libs/formatter/money";

// export default function WithdrawalsSummary({
//   withdrawals,
// }: {
//   withdrawals: AdminWithdrawalRow[];
// }) {
//   const pending = withdrawals.filter((w) => w.status === "pending");
//   const pendingAmount = pending.reduce((sum, w) => sum + w.amount, 0);
//   const completedAmount = withdrawals
//     .filter((w) => w.status === "completed")
//     .reduce((sum, w) => sum + w.amount, 0);
//   const totalFees = withdrawals.reduce((sum, w) => sum + w.fee, 0);

//   const cards = [
//     {
//       label: "Pending Amount",
//       value: formatMoney(pendingAmount, "USD"),
//       icon: Clock3,
//       valueClass: "text-[#f0b90b]",
//       description: `${pending.length} pending requests`,
//     },
//     {
//       label: "Completed Withdrawals",
//       value: formatMoney(completedAmount, "USD"),
//       icon: Check,
//       valueClass: "text-emerald-400",
//       description: "Successfully completed",
//     },
//     {
//       label: "Total Requests",
//       value: withdrawals.length.toString(),
//       icon: ArrowDownLeft,
//       valueClass: "text-white",
//       description: "All withdrawal requests",
//     },
//     {
//       label: "Total Fees",
//       value: formatMoney(totalFees, "USD"),
//       icon: DollarSign,
//       valueClass: "text-white",
//       description: "Fees generated",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//       {cards.map(({ label, value, icon: Icon, valueClass, description }) => (
//         <div
//           key={label}
//           className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-5"
//         >
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-xs font-medium text-zinc-500">{label}</p>
//               <p
//                 className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}
//               >
//                 {value}
//               </p>
//             </div>
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
//               <Icon size={17} className="text-[#f0b90b]" />
//             </div>
//           </div>
//           <p className="mt-3 text-[11px] text-zinc-600">{description}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
