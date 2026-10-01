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
import {
  Eye,
  EyeOff,
  Loader2,
  Wallet,
  TrendingUp,
  BriefcaseBusiness,
} from "lucide-react";
import PortfolioMetric from "./_components/PortfolioMetric";
import PortfolioSparkline from "./_components/PortfolioSparkline";
import { formatMoney } from "@/libs/formatter/money";

export default function DashboardPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
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
        <div>
          <p className="text-sm text-zinc-500">{formatLongDate()}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome Back, {dashboard?.firstname} 👋
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Here&apos;s what&apos;s happening with your portfolio today.
          </p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="relative overflow-hidden border-b border-white/6 p-5 sm:p-6 lg:p-7">
            {/* subtle gold glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#f0b90b]/5 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* LEFT */}
              <div>
                {/* Label */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-400">
                    Total Portfolio Value
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBalance((value) => !value)}
                    className="rounded-md p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    aria-label={
                      showBalance
                        ? "Hide portfolio balance"
                        : "Show portfolio balance"
                    }
                  >
                    {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>

                {/* Balance */}
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-[82px]">
                    {showBalance
                      ? formatMoney(dashboard?.wallet.balance)
                      : "******"}
                  </span>
                  <span className="text-sm sm:text-lg lg:text-xl font-bold text-white">
                    {dashboard?.wallet.currency}
                  </span>
                </div>
                {/* Today's performance */}
                <div className="mt-3 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    +{formatMoney(dashboard?.wallet.balance)}
                  </span>
                  <span className="text-sm text-emerald-400">
                    ({dashboard?.total_portfolio.toFixed(2)}%)
                  </span>
                  <span className="text-sm text-zinc-500">today</span>
                </div>
              </div>
              {/* chart */}
              <PortfolioSparkline />
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/6 lg:grid-cols-3">
            <PortfolioMetric
              icon={Wallet}
              label="Available Balance"
              value={dashboard?.wallet.balance}
            />
            <PortfolioMetric
              icon={TrendingUp}
              label="Expected Profit"
              value={dashboard?.total_return}
              positive
            />
            <PortfolioMetric
              icon={BriefcaseBusiness}
              label="Portfolio"
              value={dashboard?.total_portfolio}
            />
          </div>
        </div>
        <section>
          <PortfolioChart />
        </section>
        <section className="grid gap-6 xl:grid-cols-1">
          <TopMovers />
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
