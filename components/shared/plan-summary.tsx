import { formatPlanAmount } from "@/libs/formatter/format";
import { AdminPlanRow } from "@/types/plan";
import { Activity, Clock3, DollarSign, TrendingUp } from "lucide-react";


export default function PlansSummary({ plans }: { plans: AdminPlanRow[] }) {
  const active = plans.filter((p) => p.status === "active").length;
  const notAccepting = plans.length - active;
  const invested = plans.reduce((sum, p) => sum + p.invested_amount, 0);

  const cards = [
    {
      label: "Total Plans",
      value: plans.length.toString(),
      icon: Activity,
      description: "Including inactive and archived",
    },
    {
      label: "Accepting Investments",
      value: active.toString(),
      icon: TrendingUp,
      description: "Visible to users",
    },
    {
      label: "Capital Invested",
      value: formatPlanAmount(invested),
      icon: DollarSign,
      description: "Active and pending positions",
    },
    {
      label: "Not Accepting",
      value: notAccepting.toString(),
      icon: Clock3,
      description: "Inactive or archived",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, description }) => (
        <div
          key={label}
          className="rounded-2xl border border-white/6 bg-[#0b1016] p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                {value}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/4">
              <Icon size={17} className="text-[#f0b90b]" />
            </div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-600">{description}</p>
        </div>
      ))}
    </div>
  );
}
