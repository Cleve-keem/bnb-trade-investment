"use client";

import { useState } from "react";
import QuickActions from "@/components/bnb/dashboard/QuickActions";
import PortfolioChart from "@/components/bnb/dashboard/PortfolioChart";
import TopMovers from "@/components/bnb/dashboard/TopMovers";
import RecentTransactions from "@/components/bnb/dashboard/RecentTransactions";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import DepositModal from "@/components/bnb/wallets/DepositModal";
import WithdrawModal from "@/components/bnb/wallets/WithdrawModal";
import { formatLongDate } from "@/libs/formatter/date";
import { useUserDashboard } from "@/hooks/user";
import UserStatsCard from "./_components/UserStatsCard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { dashboard, isPending, isError, error, refetch } = useUserDashboard();

  if (isPending) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-[#f0b90b]" />
          Loading dashboard overview...
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-zinc-500">{formatLongDate()}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome Back, {dashboard?.firstname} 👋
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
        <UserStatsCard
          totalPortfolio={dashboard?.total_portfolio}
          wallet={dashboard?.wallet}
          totalReturns={dashboard?.total_return ?? 0}
        />
        <section>
          <PortfolioChart />
        </section>
        <section className="grid gap-6 xl:grid-cols-1">
          <TopMovers />
          {/* <AISignals /> */}
        </section>
        <RecentTransactions
          recentTransaction={dashboard?.recentTransactions ?? []}
          isError={isError}
          onRetry={refetch}
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
