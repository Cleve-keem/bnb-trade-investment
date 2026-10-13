import { InvestmentSummary } from "@/types/investment";
import {
  ArrowUp,
  BriefcaseBusiness,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { SummaryCard } from "./summary-card";
import { formatCurrency } from "@/libs/formatter/money";


type Props = {
  summary: InvestmentSummary;
  totalRecords: number;
};

export function InvestmentsSummary({ summary, totalRecords }: Props) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total Invested"
        value={formatCurrency(summary.totalInvested)}
        icon={DollarSign}
        description={`${totalRecords} total investment records`}
      />
      <SummaryCard
        label="Expected Returns"
        value={formatCurrency(summary.expectedReturns)}
        icon={TrendingUp}
        description="Projected investment value"
      />
      <SummaryCard
        label="Expected Profit"
        value={formatCurrency(summary.totalProfit)}
        icon={ArrowUp}
        description="Projected ROI earnings"
        valueClass="text-emerald-400"
      />
      <SummaryCard
        label="Active Investments"
        value={summary.activeCount.toString()}
        icon={BriefcaseBusiness}
        description={`${summary.pendingCount} pending • ${summary.completedCount} completed`}
      />
    </div>
  );
}
