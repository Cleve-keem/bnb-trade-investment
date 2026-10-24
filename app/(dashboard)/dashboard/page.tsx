"use client";

import { useState } from "react";
import PortfolioChart from "@/components/bnb/dashboard/PortfolioChart";
import TopMovers from "@/components/bnb/dashboard/TopMovers";
import RecentTransactions from "@/components/bnb/dashboard/RecentTransactions";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import DepositModal from "@/components/bnb/wallets/DepositModal";
import WithdrawModal from "@/components/bnb/wallets/WithdrawModal";
import { formatLongDate } from "@/libs/formatter/date";
import { useUserDashboard } from "@/hooks/user";
import { usePortfolioSummaryQuery } from "@/hooks/usePortfolio";
import { Loader2, Wallet, TrendingUp, BriefcaseBusiness } from "lucide-react";
import PortfolioSummaryCard from "@/components/bnb/portfolio/portfolioSummaryCard";
import QuickActions from "./_components/QuickActions";

export default function DashboardPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { dashboard, isPending, isError, error, refetch } = useUserDashboard();
  const summaryQuery = usePortfolioSummaryQuery();
  const summary = summaryQuery.data;

  const retry = () => {
    refetch();
    summaryQuery.refetch();
  };

  if (isPending || summaryQuery.isPending) {
    return (
      <DashboardShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin text-[#f0b90b]" />
            Loading dashboard overview...
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (isError || summaryQuery.isError || !dashboard || !summary) {
    return (
      <DashboardShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-400">
            {error?.message ??
              summaryQuery.error?.message ??
              "Couldn't load your dashboard."}
          </p>
          <button
            onClick={retry}
            className="rounded-lg bg-white/6 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-zinc-500">{formatLongDate()}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome Back, {dashboard.firstname} 👋
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Here&apos;s what&apos;s happening with your portfolio today.
            </p>
          </div>
          <QuickActions
            onDeposit={() => setDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
          />
        </div>

        <PortfolioSummaryCard
          label="Total Portfolio Value"
          value={summary.total_value}
          currencyLabel={summary.currency}
          metrics={[
            {
              icon: Wallet,
              label: "Available Balance",
              value: summary.available_balance,
            },
            {
              icon: BriefcaseBusiness,
              label: "Total Invested",
              value: summary.total_invested,
            },
            {
              icon: TrendingUp,
              label: "Total Return",
              value: summary.total_return,
              positive: summary.total_return >= 0,
            },
          ]}
        />

        <TopMovers />
        <PortfolioChart />
        <RecentTransactions
          recentTransaction={dashboard.recentTransactions ?? []}
          isError={isError}
          onRetry={retry}
          errorMessage={error?.message}
          isLoading={isPending}
        />
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
// import PortfolioChart from "@/components/bnb/dashboard/PortfolioChart";
// import TopMovers from "@/components/bnb/dashboard/TopMovers";
// import RecentTransactions from "@/components/bnb/dashboard/RecentTransactions";
// import DashboardShell from "@/components/bnb/layout/DashBoardShell";
// import DepositModal from "@/components/bnb/wallets/DepositModal";
// import WithdrawModal from "@/components/bnb/wallets/WithdrawModal";
// import { formatLongDate } from "@/libs/formatter/date";
// import { useUserDashboard } from "@/hooks/user";
// import { Loader2, Wallet, TrendingUp, BriefcaseBusiness } from "lucide-react";
// import PortfolioSummaryCard from "@/components/bnb/portfolio/portfolioSummaryCard";
// import QuickActions from "./_components/QuickActions";

// export default function DashboardPage() {
//   const [depositOpen, setDepositOpen] = useState(false);
//   const [withdrawOpen, setWithdrawOpen] = useState(false);
//   const { dashboard, isPending, isError, error, refetch } = useUserDashboard();

//   if (isPending) {
//     return (
//       <div className="flex min-h-[70vh] items-center justify-center">
//         <div className="flex items-center gap-3 text-gray-400">
//           <Loader2 className="h-5 w-5 animate-spin text-[#f0b90b]" />
//           Loading dashboard overview...
//         </div>
//       </div>
//     );
//   }

//   if (isError || !dashboard) {
//     return (
//       <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
//         <p className="text-sm text-red-400">
//           {error?.message ?? "Couldn't load your dashboard."}
//         </p>
//         <button
//           onClick={() => refetch()}
//           className="rounded-lg bg-white/6 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
//         >
//           Try again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <DashboardShell>
//       <div className="space-y-6">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p className="text-sm text-zinc-500">{formatLongDate()}</p>
//             <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
//               Welcome Back, {dashboard.firstname} 👋
//             </h1>
//             <p className="mt-2 text-sm text-zinc-500">
//               Here&apos;s what&apos;s happening with your portfolio today.
//             </p>
//           </div>
//           <QuickActions
//             onDeposit={() => setDepositOpen(true)}
//             onWithdraw={() => setWithdrawOpen(true)}
//           />
//         </div>

//         <PortfolioSummaryCard
//           label="Total Portfolio Value"
//           value={dashboard.wallet.balance}
//           currencyLabel={dashboard.wallet.currency}
//           metrics={[
//             {
//               icon: Wallet,
//               label: "Available Balance",
//               value: dashboard.wallet.balance,
//             },
//             {
//               icon: TrendingUp,
//               label: "Expected Profit",
//               value: dashboard.total_return,
//               positive: dashboard.total_return >= 0,
//             },
//             {
//               icon: BriefcaseBusiness,
//               label: "Portfolio",
//               value: dashboard.total_portfolio,
//             },
//           ]}
//         />

//         <TopMovers />
//         <PortfolioChart />
//         <RecentTransactions
//           recentTransaction={dashboard.recentTransactions ?? []}
//           isError={isError}
//           onRetry={refetch}
//           errorMessage={error?.message}
//           isLoading={isPending}
//         />
//       </div>
//       <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
//       <WithdrawModal
//         open={withdrawOpen}
//         onClose={() => setWithdrawOpen(false)}
//       />
//     </DashboardShell>
//   );
// }
