import { PlanStatus } from "@/types/plan";

const CONFIG: Record<PlanStatus, { label: string; pill: string; dot: string }> = {
  active: { label: "Active", pill: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400" },
  inactive: { label: "Inactive", pill: "bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  archived: { label: "Archived", pill: "bg-zinc-500/10 text-zinc-500", dot: "bg-zinc-500" },
};

export default function PlanStatusBadge({ status }: { status: PlanStatus }) {
  const { label, pill, dot } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}