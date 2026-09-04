import { ArrowDown, ArrowUp, LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
};

export default function AdminStatCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
}: Props) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition hover:border-white/[0.1] hover:bg-white/[0.035]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">{title}</p>

          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
          <Icon size={19} />
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 text-xs font-medium ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}

            {change}
          </div>

          <span className="text-xs text-zinc-600">vs last month</span>
        </div>
      )}
    </div>
  );
}
