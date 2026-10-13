import type { ElementType } from "react";

type Props = {
  label: string;
  value: string;
  icon: ElementType;
  description: string;
  valueClass?: string;
};

export function SummaryCard({
  label,
  value,
  icon: Icon,
  description,
  valueClass = "text-white",
}: Props) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#0b1016] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}>
            {value}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/4">
          <Icon size={17} className="text-[#f0b90b]" />
        </div>
      </div>
      <p className="mt-3 text-[11px] text-zinc-600">{description}</p>
    </div>
  );
}