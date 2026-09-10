"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

import StatCard from "@/components/bnb/dashboard/StatCard";
import QuickActions from "@/components/bnb/dashboard/QuickActions";
import PortfolioChart from "@/components/bnb/dashboard/PortfolioChart";
import TopMovers from "@/components/bnb/dashboard/TopMovers";
import RecentTransactions from "@/components/bnb/dashboard/RecentTransactions";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import DepositModal from "@/components/bnb/wallets/DepositModal";
import WithdrawModal from "@/components/bnb/wallets/WithdrawModal";
import { formatLongDate } from "@/libs/formatter/date";

export default function DashboardPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-zinc-500">{formatLongDate()}</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome Back, Eve 👋
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Here&apos;s what&apos;s happening with your portfolio today.
            </p>
          </div>

          <QuickActions
            onDeposit={() => setDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total Portfolio"
            value="$124,870.26"
            change="+4.34% today"
            positive
            icon={<BriefcaseBusiness size={19} />}
          />

          <StatCard
            title="Available Balance"
            value="$100,250.45"
            icon={<Wallet size={19} />}
          />

          <StatCard
            title="Total Returns"
            value="+$10,564.17"
            change="+6.14% overall"
            positive
            icon={<TrendingUp size={19} />}
          />

          {/* <StatCard
            title="Today's P/L"
            value="+$4,250.00"
            change="+1.43%"
            positive
            icon={<DollarSign size={19} />}
          /> */}
        </section>

        <section>
          <PortfolioChart />
        </section>

        <section className="grid gap-6 xl:grid-cols-1">
          <TopMovers />
          {/* <AISignals /> */}
        </section>

        <section>
          <RecentTransactions />
        </section>
      </div>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </DashboardShell>
  );
}

// "use client";

// import { useState } from "react";
// import { usePathname } from "next/navigation";
// import {
//   TrendingUp,
//   Wallet,
//   Clock,
//   ArrowUpRight,
//   ArrowDownLeft,
//   RefreshCcw,
//   ShieldCheck,
// } from "lucide-react";

// import DesktopNavbar, { MobileNavbar } from "@/components/Navbar";
// import { navigation } from "@/constants/nav";
// import Header from "@/components/Header";

// export default function DashboardPortal() {
//   const pathname = usePathname();
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

//   return (
//     <div className="min-h-screen bg-black text-[#F4F4F5] font-sans antialiased flex selection:bg-[#dabc17]/30 selection:text-white">
//       {/* 1. DESKTOP PERSISTENT STRUCTURAL SIDEBAR */}
//       <DesktopNavbar
//         sidebarOpen={sidebarOpen}
//         navigation={navigation}
//         pathname={pathname}
//       />
//       {/* 2. MOBILE SLIDE-OUT DRAWER OVERLAY PANEL */}
//       {mobileMenuOpen && (
//         <MobileNavbar
//           setMobileMenuOpen={setMobileMenuOpen}
//           navigation={navigation}
//           pathname={pathname}
//         />
//       )}
//       {/* 3. MAIN APP PORTAL CONTAINER */}
//       <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto w-full">
//         {/* VIEWPORT INTERACTION HEADER BANNER */}
//         <Header
//           setSidebarOpen={setSidebarOpen}
//           setMobileMenuOpen={setMobileMenuOpen}
//           sidebarOpen={sidebarOpen}
//         />

//         {/* WORKSPACE INTERACTIVE SCROLL GRID BODY */}
//         <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
//           {/* HIGH-END METRIC KPI GLANCE GRID */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {/* KPI METRIC CARD 1: BALANCE ASSETS */}
//             <div className="p-6 rounded-xl border border-[#1E1E24] bg-linear-to-b from-[#09090B] to-black shadow-sm group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-33.75">
//               <div className="flex items-start justify-between w-full">
//                 <div className="space-y-1">
//                   <p className="text-xs text-zinc-400 font-medium tracking-wide">
//                     Total Liquid Net Balances
//                   </p>
//                   {/* {loadingPortfolio ? (
//                     <div className="h-7 bg-zinc-900 animate-pulse rounded mt-1.5 w-40"></div>
//                   ) : (
//                     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono mt-1">
//                       $
//                       {portfolio?.total_balance?.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                       })}
//                     </h2>
//                   )} */}
//                 </div>
//                 <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 group-hover:text-[#dabc17] group-hover:border-[#dabc17]/30 transition-colors">
//                   <Wallet size={16} />
//                 </div>
//               </div>
//               <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900 w-full">
//                 <span className="text-emerald-400 font-semibold flex items-center">
//                   🛡️ Protected Ledger
//                 </span>
//               </div>
//               <div className="absolute top-0 right-0 w-32 h-32 bg-[#dabc17] opacity-[0.01] group-hover:opacity-[0.02] rounded-full blur-3xl transition-opacity pointer-events-none" />
//             </div>

//             {/* KPI METRIC CARD 2: COMPOUNDING APY REVENUE */}
//             <div className="p-6 rounded-xl border border-[#1E1E24] bg-linear-to-b from-[#09090B] to-black shadow-sm group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-33.75">
//               <div className="flex items-start justify-between w-full">
//                 <div className="space-y-1">
//                   <p className="text-xs text-zinc-400 font-medium tracking-wide">
//                     Compound Performance APY
//                   </p>
//                   {/* {loadingPortfolio ? (
//                     <div className="h-7 bg-zinc-900 animate-pulse rounded mt-1.5 w-24"></div>
//                   ) : (
//                     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#dabc17] font-mono mt-1">
//                       +{portfolio?.active_yield_rate}%
//                     </h2>
//                   )} */}
//                 </div>
//                 <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 group-hover:text-[#dabc17] group-hover:border-[#dabc17]/30 transition-colors">
//                   <TrendingUp size={16} />
//                 </div>
//               </div>
//               <div className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900 w-full flex items-center gap-1">
//                 Real-time algorithmic indexing yield acceleration vectors.
//               </div>
//             </div>

//             {/* KPI METRIC CARD 3: IN FLIGHT BLOCKED ESCROW */}
//             <div className="p-6 rounded-xl border border-[#1E1E24] bg-linear-to-b from-[#09090B] to-black shadow-sm group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-33.75 sm:col-span-2 lg:col-span-1">
//               <div className="flex items-start justify-between w-full">
//                 <div className="space-y-1">
//                   <p className="text-xs text-zinc-400 font-medium tracking-wide">
//                     In-Flight Escrow Assets
//                   </p>
//                   {/* {loadingPortfolio ? (
//                     <div className="h-7 bg-zinc-900 animate-pulse rounded mt-1.5 w-32"></div>
//                   ) : (
//                     <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-300 font-mono mt-1">
//                       $
//                       {portfolio?.pending_allocations?.toLocaleString(
//                         undefined,
//                         { minimumFractionDigits: 2 },
//                       )}
//                     </h2>
//                   )} */}
//                 </div>
//                 <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-zinc-400 group-hover:text-zinc-200 transition-colors">
//                   <Clock size={16} />
//                 </div>
//               </div>
//               <div className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-900 w-full flex items-center gap-1">
//                 Awaiting final cryptographic consensus signature execution.
//               </div>
//             </div>
//           </div>

//           {/* LOWER TWO COLUMN LAYOUT CONTENT GRID MAP */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* PLATFORM CHART PANEL WRAPPER AREA */}
//             <div className="lg:col-span-2 p-6 rounded-xl border border-[#1E1E24] bg-[#09090B] flex flex-col justify-between group hover:border-zinc-800 transition-all min-h-95">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
//                 <div>
//                   <h3 className="font-semibold text-base text-zinc-100 tracking-tight">
//                     Performance Analytics Engine
//                   </h3>
//                   <p className="text-xs text-zinc-400 mt-0.5">
//                     Asset optimization historical trace analytics.
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2 bg-black border border-[#1E1E24] p-1 rounded-lg self-start sm:self-auto">
//                   <button className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#18181B] text-white border border-[#27272A] transition-all">
//                     7 Days
//                   </button>
//                   <button className="px-2.5 py-1 text-[11px] font-medium rounded-md text-zinc-400 hover:text-white transition-all">
//                     30 Days
//                   </button>
//                 </div>
//               </div>

//               {/* Chart Interface Sandbox Mounting Box */}
//               <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#27272A] bg-black/40 rounded-lg mt-5 p-6 group-hover:bg-black/20 transition-all">
//                 <div className="p-3 rounded-full bg-[#18181B] border border-[#27272A] text-zinc-500 mb-2 group-hover:scale-105 transition-transform duration-300">
//                   <RefreshCcw size={18} className="animate-spin-[12s]" />
//                 </div>
//                 <p className="text-xs font-medium text-zinc-300 font-mono tracking-tight">
//                   Awaiting Chart Context Integration
//                 </p>
//                 <p className="text-[11px] text-zinc-500 mt-0.5 text-center max-w-xs">
//                   Mount your tracking components inside this viewport boundary
//                   wrapper block node.
//                 </p>
//               </div>
//             </div>

//             {/* HIGH END LOG AUDIT TRAIL MONITOR */}
//             <div className="p-6 rounded-xl border border-[#1E1E24] bg-[#09090B] flex flex-col group hover:border-zinc-800 transition-all min-h-95">
//               <div className="mb-5">
//                 <h3 className="font-semibold text-base text-zinc-100 tracking-tight">
//                   Recent Audit Trails
//                 </h3>
//                 <p className="text-xs text-zinc-400 mt-0.5">
//                   Real-time immutable ledger operations.
//                 </p>
//               </div>

//               {/* Transactions Execution Log Stream */}
//               <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
//                 {/* {loadingLedger ? (
//                   Array.from({ length: 4 }).map((_, idx) => (
//                     <div
//                       key={idx}
//                       className="h-[62px] bg-[#18181B]/40 border border-[#27272A]/40 animate-pulse rounded-xl w-full"
//                     />
//                   ))
//                 ) : transactions?.length === 0 ? (
//                   <div className="h-full flex flex-col items-center justify-center text-xs text-zinc-500 italic p-6 text-center border border-dashed border-[#27272A] rounded-xl">
//                     No verified operations recorded on this chain profile.
//                   </div>
//                 ) : (
//                   transactions?.map((tx: any) => {
//                     const isWithdrawal = tx.type === "withdrawal";
//                     return (
//                       <div
//                         key={tx.id}
//                         className="p-3 rounded-xl bg-black border border-[#1E1E24] hover:border-zinc-700 flex items-center justify-between transition-all duration-200 group/row"
//                       >
//                         <div className="flex items-center gap-3 min-w-0">
//                           <div
//                             className={`p-2 rounded-lg flex-shrink-0 border ${
//                               isWithdrawal
//                                 ? "bg-red-500/5 border-red-500/10 text-red-400"
//                                 : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
//                             }`}
//                           >
//                             {isWithdrawal ? (
//                               <ArrowDownLeft size={14} />
//                             ) : (
//                               <ArrowUpRight size={14} />
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="font-medium text-xs text-zinc-200 capitalize truncate tracking-tight">
//                               {tx.type.replace("_", " ")}
//                             </p>
//                             <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
//                               {new Date(tx.created_at).toLocaleDateString(
//                                 undefined,
//                                 {
//                                   month: "short",
//                                   day: "numeric",
//                                   year: "numeric",
//                                 },
//                               )}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="text-right flex-shrink-0 pl-3">
//                           <p className="font-semibold font-mono text-xs text-zinc-100">
//                             {isWithdrawal ? "-" : "+"}$
//                             {tx.amount.toLocaleString(undefined, {
//                               minimumFractionDigits: 2,
//                             })}
//                           </p>
//                           <span
//                             className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium tracking-tight font-mono mt-0.5 border uppercase ${
//                               tx.status === "completed"
//                                 ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
//                                 : "bg-amber-500/5 text-amber-400 border-amber-500/10"
//                             }`}
//                           >
//                             {tx.status}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })
//                 )} */}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* STRUCTURAL ARCHITECTURAL FOOTER */}
//         <footer className="h-12 border-t border-[#1E1E24] px-4 sm:px-8 flex items-center justify-between text-[10px] text-zinc-500 font-mono tracking-tight bg-black">
//           <p>© 2026 BNB Investment Group. Confidential Ledger.</p>
//           <div className="flex items-center gap-1 text-zinc-400 font-medium">
//             <ShieldCheck size={12} className="text-[#dabc17]" />
//             <span>FIPS 140-3 Cryptographic Isolation</span>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// }
