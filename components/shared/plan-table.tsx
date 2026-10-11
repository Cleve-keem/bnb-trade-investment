import { formatPlanAmount } from "@/libs/formatter/format";
import { AdminPlanRow, PlanStatus } from "@/types/plan";
import { ArrowUp, Clock3, TrendingUp, Users } from "lucide-react";
import PlanStatusBadge from "./plan-status-badge";
import PlanActionsMenu from "./plan-menu-action";
import { formatDuration } from "@/libs/formatter/duration";


const HEADERS = [
  "Plan",
  "ROI",
  "Duration",
  "Investment Range",
  "Investors",
  "Invested",
  "Status",
];

export default function PlansTable({
  plans,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  plans: AdminPlanRow[];
  onEdit: (plan: AdminPlanRow) => void;
  onStatusChange: (plan: AdminPlanRow, status: PlanStatus) => void;
  onDelete: (plan: AdminPlanRow) => void;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/6 bg-[#0b1016] lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-275">
          <thead>
            <tr className="border-b border-white/6 bg-white/1.5">
              {HEADERS.map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600"
                >
                  {h}
                </th>
              ))}
              <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.plan_id}
                className="border-b border-white/4 transition hover:bg-white/1.5"
              >
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/10">
                      <TrendingUp size={18} className="text-[#f0b90b]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {plan.name}
                      </p>
                      <p className="mt-0.5 max-w-60 truncate text-xs text-zinc-600">
                        {plan.description ?? "No description"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                    <ArrowUp size={14} />
                    {plan.roi_percentage}%
                  </div>
                </td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Clock3 size={14} className="text-zinc-600" />
                    {formatDuration(plan.duration_days)}
                  </div>
                </td>
                <td className="px-5 py-5">
                  <p className="text-sm text-zinc-300">
                    {formatPlanAmount(plan.minimum_amount)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {plan.maximum_amount === null
                      ? "no maximum"
                      : `to ${formatPlanAmount(plan.maximum_amount)}`}
                  </p>
                </td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <Users size={14} className="text-zinc-600" />
                    {plan.investor_count.toLocaleString()}
                  </div>
                </td>
                <td className="px-5 py-5">
                  <p className="text-sm font-medium text-white">
                    {formatPlanAmount(plan.invested_amount)}
                  </p>
                </td>
                <td className="px-5 py-5">
                  <PlanStatusBadge status={plan.status} />
                </td>
                <td className="px-5 py-5">
                  <PlanActionsMenu
                    plan={plan}
                    onEdit={() => onEdit(plan)}
                    onStatusChange={(status) => onStatusChange(plan, status)}
                    onDelete={() => onDelete(plan)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
