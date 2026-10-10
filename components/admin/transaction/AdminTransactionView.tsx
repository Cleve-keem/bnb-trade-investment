"use client";

import { useEffect, useState } from "react";
import { Search, Wallet } from "lucide-react";

import {
  useAdminTransactions,
} from "@/hooks/transaction";
import type { TransactionTypeFilterValue } from "@/types/transaction";
import { useDebouncedValue } from "@/hooks/useDebounceValue";
import AdminTransactionsSummary from "./AdminTransactionSummary";
import AdminTransactionsTable from "./AdminTransactionTable";
import AdminTransactionsMobileList from "./AdminTransactionMobileList";
import PaginationFooter from "@/components/shared/paginationFooter";
import TransactionTypeFilter from "@/components/bnb/Transaction/TransactionTypeFilter";
import {
  TableEmptyState,
  TableErrorState,
  TableLoadingState,
} from "@/components/shared/TableStates";
import { ADMIN_TRANSACTIONS_PAGE_SIZE } from "@/hooks/admin";

export default function AdminTransactionsView() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TransactionTypeFilterValue>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { rows, total, isPending, isFetching, isError, error, refetch } =
    useAdminTransactions({
      type: type === "all" ? null : type,
      search: debouncedSearch,
      page,
    });

  const totalPages = Math.max(
    1,
    Math.ceil(total / ADMIN_TRANSACTIONS_PAGE_SIZE),
  );
  const hasActiveFilters = search.trim() !== "" || type !== "all";

  useEffect(() => {
    if (!isPending && rows.length === 0 && page > 1) setPage(1);
  }, [isPending, rows.length, page]);

  function changeType(next: TransactionTypeFilterValue) {
    setType(next);
    setPage(1);
  }

  function changeSearch(next: string) {
    setSearch(next);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setType("all");
    setPage(1);
  }

  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
          Finance
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Every financial activity across the platform, including requests still
          awaiting review.
        </p>
      </div>

      <AdminTransactionsSummary />

      <section className="overflow-hidden rounded-2xl border border-white/6 bg-white/2.5">
        <div className="flex flex-col gap-4 border-b border-white/6 p-4 sm:p-5">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Search reference, description, name or email..."
              className="h-11 w-full rounded-xl border border-white/7 bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
            />
          </div>
          <TransactionTypeFilter value={type} onChange={changeType} />
        </div>

        {isPending ? (
          <TableLoadingState />
        ) : isError ? (
          <TableErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        ) : rows.length === 0 ? (
          <TableEmptyState
            icon={Wallet}
            title={
              hasActiveFilters
                ? "No transactions match your search"
                : "No transactions yet"
            }
            description={
              hasActiveFilters
                ? "Try a different search or clear your filters."
                : "Activity will appear here as users deposit, withdraw and invest."
            }
            action={
              hasActiveFilters
                ? { label: "Clear filters", onClick: clearFilters }
                : undefined
            }
          />
        ) : (
          <div
            className={
              isFetching
                ? "opacity-60 transition-opacity"
                : "transition-opacity"
            }
          >
            <AdminTransactionsTable transactions={rows} />
            <AdminTransactionsMobileList transactions={rows} />
            <PaginationFooter
              page={page}
              totalPages={totalPages}
              pageSize={ADMIN_TRANSACTIONS_PAGE_SIZE}
              totalItems={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>
    </main>
  );
}
