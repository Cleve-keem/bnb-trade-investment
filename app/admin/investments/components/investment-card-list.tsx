import { getInitials } from "@/libs/formatter/format";
import { Investment } from "@/types/investment";
import { Eye, TrendingUp } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { formatCurrency } from "@/libs/formatter/money";
import { EmptyState } from "./empty-state";


function InfoBox({
  label,
  value,
  valueClass = "text-zinc-200",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/1.5 p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

type Props = {
  investments: Investment[];
  cancellingId: string | null;
  onView: (investment: Investment) => void;
  onCancel: (id: string) => void;
};

export function InvestmentCardList({
  investments,
  cancellingId,
  onView,
  onCancel,
}: Props) {
  return (
    <div className="space-y-4 lg:hidden">
      {investments.map((investment) => (
        <div
          key={investment.id}
          className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-semibold text-zinc-300">
                {getInitials(investment.fullName)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {investment.fullName}
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-600">
                  {investment.reference}
                </p>
              </div>
            </div>
            <StatusBadge status={investment.status} />
          </div>

          <div className="mt-5 rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/[0.025] p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                  Investment Plan
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {investment.plan}
                </p>
              </div>
              <TrendingUp size={18} className="text-[#f0b90b]" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <InfoBox label="Amount" value={formatCurrency(investment.amount)} />
            <InfoBox
              label="ROI"
              value={`${investment.roi}%`}
              valueClass="text-emerald-400"
            />
            <InfoBox
              label="Expected Return"
              value={formatCurrency(investment.expectedReturn)}
            />
            <InfoBox
              label="Profit"
              value={`+${formatCurrency(investment.profit)}`}
              valueClass="text-emerald-400"
            />
            <InfoBox
              label="Duration"
              value={`${investment.duration} ${investment.durationUnit}`}
            />
            <InfoBox label="End Date" value={investment.endDate} />
          </div>

          <div className="mt-4 flex gap-2 border-t border-white/[0.05] pt-4">
            <button
              onClick={() => onView(investment)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Eye size={15} />
              View Details
            </button>

            {investment.status === "Active" && (
              <button
                onClick={() => onCancel(investment.id)}
                disabled={cancellingId === investment.id}
                className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15 disabled:opacity-50"
              >
                {cancellingId === investment.id ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        </div>
      ))}

      {investments.length === 0 && <EmptyState />}
    </div>
  );
}
