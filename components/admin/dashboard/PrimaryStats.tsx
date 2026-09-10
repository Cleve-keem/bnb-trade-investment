import AdminStatCard from "../AdminStatCard";
import {
  ArrowUpFromLine,
  BriefcaseBusiness,
  Users,
  Wallet,
} from "lucide-react";
import { AdminDashboardStats } from "@/types/admin";

export default function PrimaryStats({
  stats,
}: {
  stats: AdminDashboardStats;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        change="12.4%"
        positive
        icon={Users}
      />

      <AdminStatCard
        title="Total Wallet Balance"
        value={stats.totalWalletBalance.toLocaleString()}
        change="5.7%"
        positive
        icon={Wallet}
      />

      <AdminStatCard
        title="Total Investments"
        value={stats.totalInvestments.toLocaleString()}
        change="8.2%"
        positive
        icon={BriefcaseBusiness}
      />

      <AdminStatCard
        title="Pending Withdrawals"
        value={stats.pendingWithdrawals.toLocaleString()}
        change="4.8%"
        positive={false}
        icon={ArrowUpFromLine}
      />
    </section>
  );
}
