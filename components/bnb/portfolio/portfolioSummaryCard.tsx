"use client";

import { useState } from "react";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PortfolioSparkline from "./portfolioSparkline";
import { formatAmount } from "@/libs/formatter/display";

export type PortfolioSummaryMetric = {
  icon: LucideIcon;
  label: string;
  value: number;
  positive?: boolean;
};

export type PortfolioSummaryCardProps = {
  label: string;
  value: number;
  currencyLabel?: string;
  hideable?: boolean;
  changeAmount?: number;
  changePercent?: number;
  changeTimeframe?: string;
  showSparkline?: boolean;
  metrics?: PortfolioSummaryMetric[];
};

const METRIC_GRID: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export default function PortfolioSummaryCard({
  label,
  value,
  currencyLabel = "USD",
  hideable = true,
  changeAmount,
  changePercent,
  changeTimeframe = "today",
  showSparkline = true,
  metrics = [],
}: PortfolioSummaryCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const isRevealed = !hideable || showBalance;
  const hasChange = changeAmount !== undefined || changePercent !== undefined;
  const isPositive = (changeAmount ?? changePercent ?? 0) >= 0;

  return (
    <div className="relative rounded-2xl border border-white/6 bg-[#0d131a]">
      <div className="z-20 bg-[#0d131a]">
        <div className="relative z-20 overflow-hidden border-b border-white/6 p-5 sm:p-6 lg:p-7">
          {/* Brand glow, top-right */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f0b90b]/5 blur-3xl" />
          {/* Brand glow, bottom-left */}
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#f0b90b]/5 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-400">
                  {label}
                </span>
                {hideable && (
                  <button
                    type="button"
                    onClick={() => setShowBalance((v) => !v)}
                    className="rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-[82px]">
                  {isRevealed ? formatAmount(value) : "******"}
                </span>
                <span className="text-sm font-bold text-white sm:text-lg lg:text-xl">
                  {currencyLabel}
                </span>
              </div>

              {hasChange && isRevealed && (
                <div className="mt-3 flex items-center gap-2">
                  <TrendingUp
                    size={18}
                    className={
                      isPositive
                        ? "text-emerald-400"
                        : "rotate-180 text-red-400"
                    }
                  />
                  {changeAmount !== undefined && (
                    <span
                      className={`text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {isPositive ? "+" : ""}
                      {formatAmount(changeAmount)} {currencyLabel}
                    </span>
                  )}
                  {changePercent !== undefined && (
                    <span
                      className={`text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                    >
                      ({isPositive ? "+" : ""}
                      {changePercent.toFixed(2)}%)
                    </span>
                  )}
                  <span className="text-sm text-zinc-500">
                    {changeTimeframe}
                  </span>
                </div>
              )}
            </div>

            {showSparkline && <PortfolioSparkline />}
          </div>
        </div>

        {metrics.length > 0 && (
          <div
            className={`grid divide-x divide-white/6 ${METRIC_GRID[metrics.length] ?? "grid-cols-3"}`}
          >
            {metrics.map((metric) => (
              <PortfolioMetricItem
                key={metric.label}
                {...metric}
                currency={currencyLabel}
                revealed={isRevealed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioMetricItem({
  icon: Icon,
  label,
  value,
  positive,
  currency,
  revealed,
}: PortfolioSummaryMetric & { currency: string; revealed: boolean }) {
  const tone =
    positive === undefined
      ? "text-white"
      : positive
        ? "text-emerald-400"
        : "text-red-400";

  return (
    <div className="px-3 py-4 sm:px-5">
      <div className="mb-2 flex items-center gap-2 text-zinc-500">
        <Icon size={14} />
        <span className="text-xs font-medium">{label}</span>
      </div>

      <p className={`text-sm tracking-tight sm:text-xl ${tone}`}>
        {revealed ? (
          <>
            {positive !== undefined && value >= 0 ? "+" : ""}
            {formatAmount(value)}
            <span className="block text-[10px] font-semibold text-zinc-500 sm:ml-1 sm:inline sm:text-xs">
              {currency}
            </span>
          </>
        ) : (
          "******"
        )}
      </p>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Eye, EyeOff, TrendingUp } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
// import { formatMoney } from "@/libs/formatter/money";
// import PortfolioSparkline from "./portfolioSparkline";

// export type PortfolioSummaryMetric = {
//   icon: LucideIcon;
//   label: string;
//   value: number;
//   positive?: boolean;
// };

// export type PortfolioSummaryCardProps = {
//   label: string;
//   value: number;
//   currencyLabel?: string;
//   hideable?: boolean;
//   changeAmount?: number;
//   changePercent?: number;
//   changeTimeframe?: string;
//   showSparkline?: boolean;
//   metrics?: PortfolioSummaryMetric[];
// };

// const METRIC_GRID: Record<number, string> = {
//   2: "grid-cols-2",
//   3: "grid-cols-3",
//   4: "grid-cols-2 lg:grid-cols-4",
// };

// export default function PortfolioSummaryCard({
//   label,
//   value,
//   currencyLabel,
//   hideable = true,
//   changeAmount,
//   changePercent,
//   changeTimeframe = "today",
//   showSparkline = true,
//   metrics = [],
// }: PortfolioSummaryCardProps) {
//   const [showBalance, setShowBalance] = useState(true);
//   const isRevealed = !hideable || showBalance;
//   const hasChange = changeAmount !== undefined || changePercent !== undefined;
//   const isPositive = (changeAmount ?? changePercent ?? 0) >= 0;

//   return (
//     <div className="relative rounded-2xl border border-white/6 bg-[#0d131a]">
//       {/* <div className="pointer-events-none absolute -right-0.5 -top-0.5 h-60 w-20 rounded-tr-2xl z-0 bg-[#e9ce39]" /> */}
//       {/* <div className="pointer-events-none absolute -left-0.5 -bottom-0.5 h-60 w-20 rounded-bl-2xl z-0 bg-[#e9ce39]" /> */}
//       <div className="z-20 bg-[#0d131a]">
//         <div className="relative overflow-hidden border-b border-white/6 p-5 sm:p-6 lg:p-7 z-20">
//           {/* Brand glow — top-right */}
//           <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f0b90b]/5 blur-3xl" />
//           {/* Brand glow — bottom-left, mirrors the one above */}
//           <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-[#f0b90b]/5 blur-3xl" />
//           <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
//             <div>
//               <div className="mb-3 flex items-center gap-2">
//                 <span className="text-sm font-medium text-zinc-400">
//                   {label}
//                 </span>
//                 {hideable && (
//                   <button
//                     type="button"
//                     onClick={() => setShowBalance((v) => !v)}
//                     className="rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
//                     aria-label={showBalance ? "Hide balance" : "Show balance"}
//                   >
//                     {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
//                   </button>
//                 )}
//               </div>

//               <div className="flex items-baseline gap-2">
//                 <span className="text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-[82px]">
//                   {isRevealed ? formatMoney(value) : "******"}
//                 </span>
//                 {currencyLabel && (
//                   <span className="text-sm sm:text-lg lg:text-xl font-bold text-white">
//                     {currencyLabel}
//                   </span>
//                 )}
//               </div>

//               {hasChange && isRevealed && (
//                 <div className="mt-3 flex items-center gap-2">
//                   <TrendingUp
//                     size={18}
//                     className={
//                       isPositive
//                         ? "text-emerald-400"
//                         : "text-red-400 rotate-180"
//                     }
//                   />
//                   {changeAmount !== undefined && (
//                     <span
//                       className={`text-sm font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
//                     >
//                       {isPositive ? "+" : ""}
//                       {formatMoney(changeAmount)}
//                     </span>
//                   )}
//                   {changePercent !== undefined && (
//                     <span
//                       className={`text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}
//                     >
//                       ({isPositive ? "+" : ""}
//                       {changePercent.toFixed(2)}%)
//                     </span>
//                   )}
//                   <span className="text-sm text-zinc-500">
//                     {changeTimeframe}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {showSparkline && <PortfolioSparkline />}
//           </div>
//         </div>

//         {metrics.length > 0 && (
//           <div
//             className={`grid divide-x divide-white/6 ${METRIC_GRID[metrics.length] ?? "grid-cols-3"}`}
//           >
//             {metrics.map((metric) => (
//               <PortfolioMetricItem key={metric.label} {...metric} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function PortfolioMetricItem({
//   icon: Icon,
//   label,
//   value,
//   positive,
// }: PortfolioSummaryMetric) {
//   const tone =
//     positive === undefined
//       ? "text-white"
//       : positive
//         ? "text-emerald-400"
//         : "text-red-400";
//   return (
//     <div className="px-5 py-4">
//       <div className="mb-2 flex items-center gap-2 text-zinc-500">
//         <Icon size={14} />
//         <span className="text-xs font-medium">{label}</span>
//       </div>
//       <p className={`text-sm tracking-tight sm:text-xl ${tone}`}>
//         {positive !== undefined && value >= 0 ? "+" : ""}
//         {formatMoney(value)}
//       </p>
//     </div>
//   );
// }
