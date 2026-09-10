"use client";

import AdminOverviewChart from "@/components/admin/AdminOverviewChart";
import RecentActivity from "@/components/admin/RecentActivity";
import PendingActions from "@/components/admin/PendingAction";
import { useAdminDashboard } from "@/hooks/admin";
import PageHeader from "@/components/admin/dashboard/PageHeader";
import PrimaryStats from "@/components/admin/dashboard/PrimaryStats";
import SecondaryStats from "@/components/admin/dashboard/SecondaryStats";
import { Loader2, RefreshCw, XCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const { dashboard, isError, isPending, error, refetch } = useAdminDashboard();

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

  if (isError || !dashboard) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1016] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error instanceof Error
              ? error.message
              : "The requested user could not be found."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#d9a600]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-8">
      <PageHeader />
      <PrimaryStats stats={dashboard.stats} />
      <SecondaryStats stats={dashboard.stats} />
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <AdminOverviewChart />
        <RecentActivity recentActivity={dashboard.recentActivity} />
      </section>
      <section>
        <PendingActions />
      </section>
    </main>
  );
}
