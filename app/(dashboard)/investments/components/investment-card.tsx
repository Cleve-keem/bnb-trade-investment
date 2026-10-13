import { formatCurrency } from "@/libs/formatter/money";
import { MyInvestment, MyInvestmentStatus } from "@/types/investment";


const BADGE: Record<MyInvestmentStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Completed: "bg-blue-500/10 text-blue-400",
  Pending: "bg-[#f0b90b]/10 text-[#f0b90b]",
  Cancelled: "bg-red-500/10 text-red-400",
};

function MetricSmall({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-600">{title}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

export function MyInvestmentCard({ investment }: { investment: MyInvestment }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{investment.plan}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {investment.maturityLabel} · {investment.reference}
          </p>
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${BADGE[investment.status]}`}
        >
          {investment.status}
        </span>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3">
        <MetricSmall
          title="Invested"
          value={formatCurrency(investment.invested)}
        />
        <MetricSmall
          title="Expected Return"
          value={formatCurrency(investment.expectedReturn)}
        />
        <MetricSmall
          title="Profit"
          value={`+${formatCurrency(investment.profit)}`}
        />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-zinc-600">Progress</span>
          <span>{investment.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-[#f0b90b]"
            style={{ width: `${investment.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
