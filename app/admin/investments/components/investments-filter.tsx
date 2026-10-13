import { STATUS_FILTERS, StatusFilter } from "@/constants/investment";
import { ChevronDown, Filter, Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  planFilter: string;
  onPlanChange: (value: string) => void;
  plans: string[];
};

export function InvestmentsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  planFilter,
  onPlanChange,
  plans,
}: Props) {
  return (
    <div className="mb-5 rounded-2xl border border-white/6 bg-[#0b1016] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search user, reference or plan..."
            className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                  statusFilter === status
                    ? "bg-[#f0b90b] text-black"
                    : "border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <select
              value={planFilter}
              onChange={(event) => onPlanChange(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-white/6 bg-white/2.5 pl-9 pr-9 text-xs text-zinc-300 outline-none focus:border-[#f0b90b]/40 sm:w-44"
            >
              {plans.map((plan) => (
                <option key={plan} value={plan} className="bg-[#0d131a]">
                  {plan}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
