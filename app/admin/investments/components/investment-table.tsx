"use client";

import { useState } from "react";
import { ArrowUp, Clock3, MoreHorizontal } from "lucide-react";
import { Investment } from "@/types/investment";
import { getInitials } from "@/libs/formatter/format";
import { formatCurrency } from "@/libs/formatter/money";
import { StatusBadge } from "./status-badge";
import { InvestmentActionMenu } from "./investment-action-menu";
import { EmptyState } from "./empty-state";


const COLUMNS = [
  "Investor",
  "Plan",
  "Amount",
  "ROI",
  "Expected Return",
  "Duration",
  "End Date",
  "Status",
];

const headerClass =
  "px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600";

type Props = {
  investments: Investment[];
  cancellingId: string | null;
  onView: (investment: Investment) => void;
  onCancel: (id: string) => void;
};

export function InvestmentsTable({
  investments,
  cancellingId,
  onView,
  onCancel,
}: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/6 bg-[#0b1016] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-312.5">
          <thead>
            <tr className="border-b border-white/6 bg-white/1.5">
              {COLUMNS.map((column) => (
                <th key={column} className={headerClass}>
                  {column}
                </th>
              ))}
              <th className={`${headerClass} text-right`}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {investments.map((investment) => (
              <tr
                key={investment.id}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.015]"
              >
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-semibold text-zinc-300">
                      {getInitials(investment.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {investment.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-600">
                        {investment.reference}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-5">
                  <p className="text-sm text-zinc-300">{investment.plan}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {investment.duration} {investment.durationUnit}
                  </p>
                </td>

                <td className="px-5 py-5">
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(investment.amount)}
                  </p>
                </td>

                <td className="px-5 py-5">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <ArrowUp size={13} />
                    {investment.roi}%
                  </span>
                </td>

                <td className="px-5 py-5">
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(investment.expectedReturn)}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-400">
                    +{formatCurrency(investment.profit)}
                  </p>
                </td>

                <td className="px-5 py-5">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Clock3 size={14} className="text-zinc-600" />
                    {investment.duration} {investment.durationUnit}
                  </div>
                </td>

                <td className="px-5 py-5">
                  <p className="text-sm text-zinc-300">{investment.endDate}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Started {investment.startDate}
                  </p>
                </td>

                <td className="px-5 py-5">
                  <StatusBadge status={investment.status} />
                </td>

                <td className="px-5 py-5">
                  <div className="relative flex justify-end">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === investment.id ? null : investment.id,
                        )
                      }
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenu === investment.id && (
                      <InvestmentActionMenu
                        investment={investment}
                        cancelling={cancellingId === investment.id}
                        onView={() => {
                          onView(investment);
                          setOpenMenu(null);
                        }}
                        onCancel={() => {
                          setOpenMenu(null);
                          onCancel(investment.id);
                        }}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {investments.length === 0 && <EmptyState />}
    </div>
  );
}
