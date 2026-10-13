import { formatCurrency } from "@/libs/formatter/money";
import { Plan } from "@/types/investment";

export function PlanCard({
  plan,
  onInvest,
}: {
  plan: Plan;
  onInvest: (plan: Plan) => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/6 bg-[#0d131a] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{plan.name}</p>
        <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
          {plan.roi}% ROI
        </span>
      </div>

      {plan.description && (
        <p className="mt-2 text-xs text-zinc-500">{plan.description}</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-zinc-600">Duration</p>
          <p className="mt-1 text-sm font-medium">{plan.durationDays} days</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-600">Amount range</p>
          <p className="mt-1 text-sm font-medium">
            {formatCurrency(plan.minimumAmount)}
            {plan.maximumAmount
              ? ` – ${formatCurrency(plan.maximumAmount)}`
              : "+"}
          </p>
        </div>
      </div>

      <button
        onClick={() => onInvest(plan)}
        className="mt-6 rounded-xl bg-[#f0b90b] py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
      >
        Invest
      </button>
    </div>
  );
}
