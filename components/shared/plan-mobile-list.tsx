import { AdminPlanRow, PlanStatus } from "@/types/plan";
import { TrendingUp } from "lucide-react";
import PlanStatusBadge from "./plan-status-badge";
import PlanActionsMenu from "./plan-menu-action";
import { formatDuration } from "@/libs/formatter/duration";
import { formatPlanAmount } from "@/libs/formatter/format";


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

export default function PlansMobileList({
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
    <div className="space-y-4 lg:hidden">
      {plans.map((plan) => (
        <div
          key={plan.plan_id}
          className="rounded-2xl border border-white/6 bg-[#0b1016] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/10">
                <TrendingUp size={18} className="text-[#f0b90b]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{plan.name}</p>
                <div className="mt-1">
                  <PlanStatusBadge status={plan.status} />
                </div>
              </div>
            </div>
            <PlanActionsMenu
              plan={plan}
              onEdit={() => onEdit(plan)}
              onStatusChange={(status) => onStatusChange(plan, status)}
              onDelete={() => onDelete(plan)}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoBox
              label="ROI"
              value={`${plan.roi_percentage}%`}
              valueClass="text-emerald-400"
            />
            <InfoBox
              label="Duration"
              value={formatDuration(plan.duration_days)}
            />
            <InfoBox
              label="Min. Investment"
              value={formatPlanAmount(plan.minimum_amount)}
            />
            <InfoBox
              label="Max. Investment"
              value={
                plan.maximum_amount === null
                  ? "No maximum"
                  : formatPlanAmount(plan.maximum_amount)
              }
            />
            <InfoBox
              label="Investors"
              value={plan.investor_count.toLocaleString()}
            />
            <InfoBox
              label="Invested"
              value={formatPlanAmount(plan.invested_amount)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
