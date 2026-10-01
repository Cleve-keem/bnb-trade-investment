import StatCard from "@/components/bnb/dashboard/StatCard";
import { BriefcaseBusiness, TrendingUp, Wallet } from "lucide-react";

type WalletSummary = {
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
  wallet?: WalletSummary;
  totalReturns?: number;
  // Optional — only render a change badge when the caller actually has a
  // real number to show. TODO: wire these once the dashboard hook exposes
  // day-over-day deltas (e.g. comparing today's total_value against
  // yesterday's point from get_portfolio_history).
  totalPortfolioChangePercent?: number;
  totalReturnsChangePercent?: number;
};

function formatChange(percent?: number): string | undefined {
  if (percent === undefined) return undefined;
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

export default function UserStatsCard({
  totalPortfolio = 0,
  wallet,
  totalReturns = 0,
  totalPortfolioChangePercent,
  totalReturnsChangePercent,
}: UserStatsCardPropType) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="Total Portfolio"
        value={totalPortfolio}
        change={formatChange(totalPortfolioChangePercent)}
        positive={(totalPortfolioChangePercent ?? 0) >= 0}
        icon={<BriefcaseBusiness size={19} />}
      />

      <StatCard
        title="Available Balance"
        value={Number(wallet?.balance ?? 0)}
        icon={<Wallet size={19} />}
      />

      <StatCard
        title="Total Returns"
        value={totalReturns}
        change={formatChange(totalReturnsChangePercent)}
        positive={(totalReturnsChangePercent ?? 0) >= 0}
        icon={<TrendingUp size={19} />}
      />
    </section>
  );
}

// import StatCard from "@/components/bnb/dashboard/StatCard";
// import { BriefcaseBusiness, TrendingUp, Wallet } from "lucide-react";

// type Wallet = {
//   id: string;
//   balance: number;
//   locked_balance: number;
//   version: number;
//   user_id: string;
//   status: string;
//   currency: string;
// };

// type UserStatsCardPropType = {
//   totalPortfolio?: number;
//   wallet?: Wallet;
//   totalReturns?: number;
// };

// export default function UserStatsCard({
//   totalPortfolio = 0,
//   wallet,
//   totalReturns = 0,
// }: UserStatsCardPropType) {
//   return (
//     <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//       <StatCard
//         title="Total Portfolio"
//         value={`$${totalPortfolio.toLocaleString()}`}
//         change="+4.34% today"
//         positive
//         icon={<BriefcaseBusiness size={19} />}
//       />

//       <StatCard
//         title="Available Balance"
//         value={`$${Number(wallet?.balance ?? 0).toLocaleString()}`}
//         icon={<Wallet size={19} />}
//       />

//       <StatCard
//         title="Total Returns"
//         value={`+$${totalReturns.toLocaleString()}`}
//         change="+6.14% overall"
//         positive
//         icon={<TrendingUp size={19} />}
//       />
//     </section>
//   );
// }
