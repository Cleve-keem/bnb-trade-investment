"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { useWalletList } from "@/hooks/wallet";
import { usePagination } from "@/hooks/usePagination";
import WalletsToolbar, { WalletFilter } from "./components/walletsToolbar";
import WalletsSummary from "./components/walletsSummary";
import WalletsLoadingState from "./components/walletsLoadingState";
import WalletsErrorState from "./components/walletsErrorState";
import WalletsEmptyState from "./components/walletEmptyState";
import WalletsTable from "./components/walletsTable";
import WalletsMobileList from "./components/walletsMobileList";
import PaginationFooter from "@/components/shared/paginationFooter";

const PAGE_SIZE = 10;

export default function AdminWalletsPage() {
  const { wallets, isPending, isError, error, refetch } = useWalletList();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<WalletFilter>("All");

  const filteredWallets = useMemo(() => {
    const q = search.toLowerCase();
    return wallets.filter((wallet) => {
      const matchesSearch =
        (wallet.full_name ?? "").toLowerCase().includes(q) ||
        wallet.email.toLowerCase().includes(q) ||
        wallet.wallet_id.toLowerCase().includes(q);
      const matchesFilter =
        filter === "All" || wallet.status === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [wallets, search, filter]);

  const {
    paginated: pagedWallets,
    page,
    totalPages,
    setPage,
  } = usePagination(filteredWallets, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filter, setPage]);

  function clearFilters() {
    setSearch("");
    setFilter("All");
  }

  const hasActiveFilters = search.trim() !== "" || filter !== "All";

  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Wallets
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Monitor user wallet balances and virtual funds.
          </p>
        </div>
        <button className="flex w-fit items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f5c52c]">
          <Wallet size={17} />
          Wallet Adjustment
        </button>
      </div>

      {!isPending && !isError && <WalletsSummary wallets={wallets} />}

      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]">
        <WalletsToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        {isPending ? (
          <WalletsLoadingState />
        ) : isError ? (
          <WalletsErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={refetch}
          />
        ) : filteredWallets.length === 0 ? (
          <WalletsEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <WalletsTable wallets={pagedWallets} />
            <WalletsMobileList wallets={pagedWallets} />
            <PaginationFooter
              page={page}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={filteredWallets.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </main>
  );
}
