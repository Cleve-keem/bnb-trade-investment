import { Search } from "lucide-react";

export const PLAN_FILTERS = ["All", "active", "inactive", "archived"] as const;
export type PlanFilter = (typeof PLAN_FILTERS)[number];

const LABEL: Record<PlanFilter, string> = {
  All: "All",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

export default function PlansToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  filter: PlanFilter;
  onFilterChange: (v: PlanFilter) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#0b1016] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search plans..."
            className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {PLAN_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                filter === f
                  ? "bg-[#f0b90b] text-black"
                  : "border border-white/6 bg-white/2 text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {LABEL[f]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
