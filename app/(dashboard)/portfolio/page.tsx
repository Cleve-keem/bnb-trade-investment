"use client";

import PortfolioChart from "@/components/bnb/dashboard/PortfolioChart";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import { usePortfolioSummary } from "@/hooks/usePortfolio";

export default function PortfolioPage() {
  const { summary, holdings, isPending, isError, fmt } = usePortfolioSummary();
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Portfolio</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Detailed overview of your asset allocation.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric
            title="Total Value"
            value={summary ? fmt(summary.total_value) : "—"}
          />
          <Metric
            title="Total Invested"
            value={summary ? fmt(summary.total_invested) : "—"}
          />
          <Metric
            title="Total Return"
            value={
              summary
                ? `${summary.total_return >= 0 ? "+" : ""}${fmt(summary.total_return)}`
                : "—"
            }
          />
        </div>
        <PortfolioChart />
        <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="border-b border-white/6 p-5">
            <h2 className="font-medium">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-162.5">
              <thead className="border-b border-white/5 text-left text-xs text-zinc-600">
                <tr>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Invested</th>
                  <th className="px-5 py-4">Current Value</th>
                  <th className="px-5 py-4">Allocation</th>
                  <th className="px-5 py-4">Return</th>
                </tr>
              </thead>
              <tbody>
                {isPending ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-sm text-zinc-600"
                    >
                      Loading holdings…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-sm text-red-400"
                    >
                      Couldn't load holdings.
                    </td>
                  </tr>
                ) : holdings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-sm text-zinc-600"
                    >
                      No active investments yet.
                    </td>
                  </tr>
                ) : (
                  holdings.map((h) => (
                    <tr
                      key={h.investment_id}
                      className="border-b border-white/4 last:border-0"
                    >
                      <td className="px-5 py-5">
                        <p className="text-sm font-medium">{h.plan_name}</p>
                        <p className="text-xs text-zinc-600 capitalize">
                          {h.status}
                        </p>
                      </td>
                      <td className="px-5 py-5 text-sm text-zinc-400">
                        {fmt(h.amount)}
                      </td>
                      <td className="px-5 py-5 text-sm">
                        {fmt(h.current_value)}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full bg-[#f0b90b]"
                              style={{ width: `${h.allocation_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">
                            {h.allocation_percentage}%
                          </span>
                        </div>
                      </td>
                      <td
                        className={`px-5 py-5 text-sm ${h.change_percentage >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {h.change_percentage >= 0 ? "+" : ""}
                        {h.change_percentage}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

//   return (
//     <DashboardShell>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-semibold">Portfolio</h1>
//           <p className="mt-2 text-sm text-zinc-500">
//             Detailed overview of your asset allocation.
//           </p>
//         </div>
//         <div className="grid gap-4 sm:grid-cols-3">
//           <Metric title="Total Value" value="$324,719.26" />
//           <Metric title="Total Invested" value="$322,609.45" />
//           <Metric title="Total Return" value="+$18,420" />
//         </div>
//         <PortfolioChart />
//         <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0d131a]">
//           <div className="border-b border-white/6 p-5">
//             <h2 className="font-medium">Holdings</h2>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-162.5">
//               <thead className="border-b border-white/5 text-left text-xs text-zinc-600">
//                 <tr>
//                   <th className="px-5 py-4">Asset</th>
//                   <th className="px-5 py-4">Amount</th>
//                   <th className="px-5 py-4">Value</th>
//                   <th className="px-5 py-4">Allocation</th>
//                   <th className="px-5 py-4">24h</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {holdings.map((holding) => (
//                   <tr
//                     key={holding.symbol}
//                     className="border-b border-white/4 last:border-0"
//                   >
//                     <td className="px-5 py-5">
//                       <p className="text-sm font-medium">{holding.symbol}</p>
//                       <p className="text-xs text-zinc-600">{holding.name}</p>
//                     </td>

//                     <td className="px-5 py-5 text-sm text-zinc-400">
//                       {holding.amount}
//                     </td>

//                     <td className="px-5 py-5 text-sm">
//                       ${holding.value.toLocaleString()}
//                     </td>

//                     <td className="px-5 py-5">
//                       <div className="flex items-center gap-3">
//                         <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/6">
//                           <div
//                             className="h-full rounded-full bg-[#f0b90b]"
//                             style={{ width: `${holding.allocation}%` }}
//                           />
//                         </div>

//                         <span className="text-xs text-zinc-500">
//                           {holding.allocation}%
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-5 py-5 text-sm text-emerald-400">
//                       +{holding.change}%
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </DashboardShell>
//   );
// }

// function Metric({ title, value }: { title: string; value: string }) {
//   return (
//     <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
//       <p className="text-xs text-zinc-500">{title}</p>
//       <p className="mt-3 text-2xl font-semibold">{value}</p>
//     </div>
//   );
// }
