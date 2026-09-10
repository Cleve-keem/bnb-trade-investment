import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  TrendingUp,
} from "lucide-react";
import AdminStatCard from "../AdminStatCard";
import { AdminDashboardStats } from "@/types/admin";

export default function SecondaryStats({
  stats,
}: {
  stats: AdminDashboardStats;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        title="Deposits Today"
        value={`$${stats.depositsToday.toLocaleString()}`}
        change="14.2%"
        positive
        icon={ArrowDownToLine}
      />

      <AdminStatCard
        title="Transactions Today"
        value={`$${stats.transactionsToday.toLocaleString()}`}
        change="9.6%"
        positive
        icon={Activity}
      />

      <AdminStatCard
        title="Platform Returns"
        value={`$${stats.platformReturns.toLocaleString()}`}
        change="11.3%"
        positive
        icon={TrendingUp}
      />

      <AdminStatCard
        title="Active Alerts"
        value={stats.activeAlerts.toLocaleString()}
        change="2 new"
        positive={false}
        icon={AlertTriangle}
      />
    </section>
  );
}
