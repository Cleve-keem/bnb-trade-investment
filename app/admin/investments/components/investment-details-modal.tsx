import type { ElementType } from "react";
import { CalendarDays, TrendingUp, X } from "lucide-react";
import { Investment } from "@/types/investment";
import { getInitials } from "@/libs/formatter/format";
import { StatusBadge } from "./status-badge";
import { formatCurrency } from "@/libs/formatter/money";

function DetailItem({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon size={15} className="text-zinc-500" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
          {label}
        </p>
        <p className="mt-1 text-sm text-zinc-300">{value}</p>
      </div>
    </div>
  );
}

type Props = {
  investment: Investment;
  onClose: () => void;
};

export function InvestmentDetailsModal({ investment, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d131a] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Investment Details
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              {investment.reference}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0b90b] text-sm font-bold text-black">
                {getInitials(investment.fullName)}
              </div>
              <div>
                <p className="text-sm font-semibold">{investment.fullName}</p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {investment.email}
                </p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={investment.status} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/[0.025] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-600">Investment Plan</p>
                <p className="mt-1 text-lg font-semibold">{investment.plan}</p>
              </div>
              <TrendingUp size={22} className="text-[#f0b90b]" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailItem
                label="Amount"
                value={formatCurrency(investment.amount)}
              />
              <DetailItem
                label="ROI"
                value={`${investment.roi}%`}
                valueClass="text-emerald-400"
              />
              <DetailItem
                label="Profit"
                value={`+${formatCurrency(investment.profit)}`}
                valueClass="text-emerald-400"
              />
              <DetailItem
                label="Expected Return"
                value={formatCurrency(investment.expectedReturn)}
              />
              <DetailItem
                label="Duration"
                value={`${investment.duration} ${investment.durationUnit}`}
              />
              <DetailItem label="Investment ID" value={investment.id} />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Investment Timeline
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <TimelineItem
                icon={CalendarDays}
                label="Start Date"
                value={investment.startDate}
              />
              <TimelineItem
                icon={CalendarDays}
                label="End Date"
                value={investment.endDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
