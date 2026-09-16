import StatCard from "@/components/bnb/dashboard/StatCard";
import { BriefcaseBusiness, TrendingUp, Wallet } from "lucide-react";

type Wallet = {
  id: string;
  balance: number;
  locked_balance: number;
  version: number;
  user_id: string;
  status: string;
  currency: string;
};

type UserStatsCardPropType = {
  totalPortfolio?: number;
  wallet?: Wallet;
  totalReturns?: number;
};

export default function UserStatsCard({
  totalPortfolio = 0,
  wallet,
  totalReturns = 0,
}: UserStatsCardPropType) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Total Portfolio"
        value={`$${totalPortfolio.toLocaleString()}`}
        change="+4.34% today"
        positive
        icon={<BriefcaseBusiness size={19} />}
      />

      <StatCard
        title="Available Balance"
        value={`$${Number(wallet?.balance ?? 0).toLocaleString()}`}
        icon={<Wallet size={19} />}
      />

      <StatCard
        title="Total Returns"
        value={`+$${totalReturns.toLocaleString()}`}
        change="+6.14% overall"
        positive
        icon={<TrendingUp size={19} />}
      />
    </section>
  );
}
