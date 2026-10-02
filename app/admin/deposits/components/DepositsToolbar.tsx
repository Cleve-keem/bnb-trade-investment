import { Search, SlidersHorizontal } from "lucide-react";

export const DEPOSIT_FILTERS = [
  "All",
  "Completed",
  "Pending",
  "Failed",
] as const;
export type DepositFilter = (typeof DEPOSIT_FILTERS)[number];

export default function DepositsToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  filter: DepositFilter;
  onFilterChange: (v: DepositFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search deposits..."
          className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto">
        <SlidersHorizontal size={14} className="shrink-0 text-zinc-600" />
        {DEPOSIT_FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => onFilterChange(item)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
              filter === item
                ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
