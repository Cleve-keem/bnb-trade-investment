import { Wallet, SearchX } from "lucide-react";

export default function WalletsEmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] text-zinc-600">
          <SearchX size={22} />
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            No wallets match your search
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Try a different name, email, or wallet ID — or clear your filters.
          </p>
        </div>
        <button
          onClick={onClearFilters}
          className="mt-1 rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-medium text-white hover:bg-white/[0.1]"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0b90b]/10 text-[#f0b90b]">
        <Wallet size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-white">No wallets yet</p>
        <p className="mt-1 max-w-sm text-xs text-zinc-500">
          Wallets are created automatically when a user signs up — once someone
          registers, they'll show up here.
        </p>
      </div>
    </div>
  );
}
