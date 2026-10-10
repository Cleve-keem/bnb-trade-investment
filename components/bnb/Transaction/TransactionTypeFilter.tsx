"use client";

import { TYPE_META } from "@/libs/formatter/transaction-meta";
import type { TransactionTypeFilterValue } from "@/types/transaction";

const FILTERS: TransactionTypeFilterValue[] = [
  "all",
  "deposit",
  "withdrawal",
  "investment",
  "return",
  "adjustment",
  "bonus",
];

function labelFor(value: TransactionTypeFilterValue) {
  if (value === "all") return "All";
  return (
    TYPE_META[value]?.label ?? value.charAt(0).toUpperCase() + value.slice(1)
  );
}

export default function TransactionTypeFilter({
  value,
  onChange,
}: {
  value: TransactionTypeFilterValue;
  onChange: (value: TransactionTypeFilterValue) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {FILTERS.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
            value === item
              ? "bg-[#f0b90b]/10 text-[#f0b90b]"
              : "text-zinc-500 hover:bg-white/4 hover:text-white"
          }`}
        >
          {labelFor(item)}
        </button>
      ))}
    </div>
  );
}
