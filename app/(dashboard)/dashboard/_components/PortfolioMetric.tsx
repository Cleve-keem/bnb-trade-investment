"use client";

import { formatMoney } from "@/libs/formatter/money";
import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

type PortfolioMetricProps = {
  icon?: LucideIcon;
  label: string;
  value?: number;
  currency?: string;
  positive?: boolean;
  percentage?: number;
};

export default function PortfolioMetric({
  icon: Icon,
  label,
  value,
  currency = "USD",
  positive = false,
  percentage,
}: PortfolioMetricProps) {
  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center gap-2.5">
        {Icon && (
          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0b90b]/10">
            <Icon size={15} className="text-[#f0b90b]" />
          </div>
        )}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>

      {positive && percentage !== undefined && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <TrendingUp size={13} className="text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">
            {percentage.toFixed(2)}%
          </span>
        </div>
      )}

      {value !== undefined && (
        <p className="text-xs tracking-tight text-white sm:text-xl">
          {formatMoney(value)} {currency}
        </p>
      )}
    </div>
  );
}
