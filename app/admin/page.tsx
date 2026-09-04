"use client";

import {
  Users,
  Wallet,
  BriefcaseBusiness,
  ArrowUpFromLine,
  ArrowDownToLine,
  Activity,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminOverviewChart from "@/components/admin/AdminOverviewChart";
import RecentActivity from "@/components/admin/RecentActivity";
import PendingActions from "@/components/admin/PendingAction";

export default function AdminDashboardPage() {
  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
              Admin Overview
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Monitor users, investments, transactions and platform activity
              from one place.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-xs text-zinc-400">System operational</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Total Users"
          value="12,482"
          change="12.4%"
          positive
          icon={Users}
        />

        <AdminStatCard
          title="Total Wallet Balance"
          value="$8.12M"
          change="5.7%"
          positive
          icon={Wallet}
        />

        <AdminStatCard
          title="Total Investments"
          value="$4.82M"
          change="8.2%"
          positive
          icon={BriefcaseBusiness}
        />

        <AdminStatCard
          title="Pending Withdrawals"
          value="24"
          change="4.8%"
          positive={false}
          icon={ArrowUpFromLine}
        />
      </section>

      {/* Secondary stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Deposits Today"
          value="$182,450"
          change="14.2%"
          positive
          icon={ArrowDownToLine}
        />

        <AdminStatCard
          title="Transactions Today"
          value="1,284"
          change="9.6%"
          positive
          icon={Activity}
        />

        <AdminStatCard
          title="Platform Returns"
          value="$742K"
          change="11.3%"
          positive
          icon={TrendingUp}
        />

        <AdminStatCard
          title="Active Alerts"
          value="7"
          change="2 new"
          positive={false}
          icon={AlertTriangle}
        />
      </section>

      {/* Chart + Activity */}
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <AdminOverviewChart />

        <RecentActivity />
      </section>

      {/* Pending actions */}
      <section>
        <PendingActions />
      </section>
    </main>
  );
}
