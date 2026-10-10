import { Search, Filter, ChevronDown } from "lucide-react";

export const STATUS_FILTERS = [
  "All",
  "pending",
  "approved",
  "completed",
  "rejected",
] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];
export const ASSET_FILTERS = [
  "All",
  "BTC",
  "ETH",
  "BNB",
  "USDT",
  "Bank",
] as const;
export type AssetFilterType = (typeof ASSET_FILTERS)[number];

const STATUS_LABEL: Record<StatusFilter, string> = {
  All: "All",
  pending: "Pending",
  approved: "Approved",
  completed: "Completed",
  rejected: "Rejected",
};

export default function WithdrawalsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  asset,
  onAssetChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  asset: AssetFilterType;
  onAssetChange: (v: AssetFilterType) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search user, reference or wallet..."
            className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                  status === s
                    ? "bg-[#f0b90b] text-black"
                    : "border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <select
              value={asset}
              onChange={(e) => onAssetChange(e.target.value as AssetFilterType)}
              className="h-10 w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.025] pl-9 pr-9 text-xs text-zinc-300 outline-none focus:border-[#f0b90b]/40 sm:w-44"
            >
              {ASSET_FILTERS.map((a) => (
                <option key={a} value={a} className="bg-[#0d131a]">
                  {a}
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
