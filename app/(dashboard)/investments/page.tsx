"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import { Plan } from "@/types/investment";
import { useAvailablePlans, useMyInvestments } from "@/hooks/investment";
import { MyInvestmentCard } from "./components/investment-card";
import { PlanCard } from "./components/plan-card";
import { InvestModal } from "./components/invest-modal";

type Tab = "mine" | "plans";

function InvestmentsContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "plans" ? "plans" : "mine",
  );
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const mine = useMyInvestments();
  const available = useAvailablePlans();

  const tabClass = (active: boolean) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      active
        ? "bg-[#f0b90b] text-black"
        : "border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:text-white"
    }`;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Investments</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Monitor your investments or start a new one.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTab("mine")}
            className={tabClass(tab === "mine")}
          >
            My Investments
          </button>
          <button
            onClick={() => setTab("plans")}
            className={tabClass(tab === "plans")}
          >
            Available Plans
          </button>
        </div>

        {tab === "mine" && (
          <>
            {mine.loading && (
              <p className="text-sm text-zinc-500">Loading...</p>
            )}
            {mine.error && <p className="text-sm text-red-400">{mine.error}</p>}

            {!mine.loading && !mine.error && mine.investments.length === 0 && (
              <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-10 text-center">
                <p className="font-medium">No investments yet</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Pick a plan to start earning.
                </p>
                <button
                  onClick={() => setTab("plans")}
                  className="mt-5 rounded-xl bg-[#f0b90b] px-5 py-2.5 text-sm font-semibold text-black"
                >
                  Browse plans
                </button>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              {mine.investments.map((investment) => (
                <MyInvestmentCard key={investment.id} investment={investment} />
              ))}
            </div>
          </>
        )}

        {tab === "plans" && (
          <>
            {available.loading && (
              <p className="text-sm text-zinc-500">Loading...</p>
            )}
            {available.error && (
              <p className="text-sm text-red-400">{available.error}</p>
            )}
            {!available.loading &&
              !available.error &&
              available.plans.length === 0 && (
                <p className="text-sm text-zinc-500">
                  No plans are available right now.
                </p>
              )}

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {available.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onInvest={setSelectedPlan}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPlan && (
        <InvestModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={async () => {
            setSelectedPlan(null);
            await mine.refresh();
            setTab("mine");
          }}
        />
      )}
    </DashboardShell>
  );
}

export default function InvestmentsPage() {
  return (
    <Suspense fallback={null}>
      <InvestmentsContent />
    </Suspense>
  );
}

// import DashboardShell from "@/components/bnb/layout/DashBoardShell";
// import { investments } from "@/libs/bnb/demo-data";

// export default function InvestmentsPage() {
//   return (
//     <DashboardShell>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-semibold">Investments</h1>
//           <p className="mt-2 text-sm text-zinc-500">
//             Monitor your active and completed investments.
//           </p>
//         </div>

//         {/* <div className="grid gap-4 sm:grid-cols-3">
//           <Metric title="Invested" value="$240,000" />
//           <Metric title="Current Value" value="$261,840" />
//           <Metric title="Total Return" value="+$21,840" />
//         </div> */}

//         <div className="grid gap-5 lg:grid-cols-2">
//           {investments.map((investment) => (
//             <div
//               key={investment.name}
//               className="rounded-2xl border border-white/6 bg-[#0d131a] p-5"
//             >
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="font-medium">{investment.name}</p>
//                   <p className="mt-1 text-xs text-zinc-600">
//                     Maturity in {investment.maturity}
//                   </p>
//                 </div>

//                 <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
//                   {investment.status}
//                 </span>
//               </div>

//               <div className="mt-7 grid grid-cols-3 gap-3">
//                 <MetricSmall
//                   title="Invested"
//                   value={`$${investment.invested.toLocaleString()}`}
//                 />

//                 <MetricSmall
//                   title="Value"
//                   value={`$${investment.currentValue.toLocaleString()}`}
//                 />

//                 <MetricSmall
//                   title="Return"
//                   value={`+$${investment.return.toLocaleString()}`}
//                 />
//               </div>

//               <div className="mt-6">
//                 <div className="mb-2 flex justify-between text-xs">
//                   <span className="text-zinc-600">Progress</span>
//                   <span>{investment.progress}%</span>
//                 </div>

//                 <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
//                   <div
//                     className="h-full rounded-full bg-[#f0b90b]"
//                     style={{ width: `${investment.progress}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </DashboardShell>
//   );
// }

// function Metric({ title, value }: { title: string; value: string }) {
//   return (
//     <div className="rounded-2xl border border-white/[0.06] bg-[#0d131a] p-5">
//       <p className="text-xs text-zinc-500">{title}</p>
//       <p className="mt-3 text-2xl font-semibold">{value}</p>
//     </div>
//   );
// }

// function MetricSmall({ title, value }: { title: string; value: string }) {
//   return (
//     <div>
//       <p className="text-[10px] text-zinc-600">{title}</p>
//       <p className="mt-1 text-sm font-medium">{value}</p>
//     </div>
//   );
// }
