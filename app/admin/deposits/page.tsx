"use client";

import { useEffect, useMemo, useState } from "react";
import { useDepositList } from "./hooks/desposit";
import DepositsLoadingState from "./components/depositsLoadingState";
import DepositsMobileList from "./components/depositsMobileList";
import DepositsTable from "./components/depositsTable";
import DepositsToolbar, { DepositFilter } from "./components/DepositsToolbar";
import DepositsErrorState from "./components/depositsErrorState";
import DepositsSummary from "./components/depositsSummary";
import DepositsEmptyState from "./components/depositsEmptyState";
import { usePagination } from "@/hooks/usePagination";
import PaginationFooter from "@/components/shared/paginationFooter";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<Exclude<DepositFilter, "All">, string> = {
  Completed: "completed",
  Pending: "pending",
  Failed: "failed",
};

export default function AdminDepositsPage() {
  const {
    deposits,
    isPending,
    isError,
    error,
    refetch,
    confirmDeposit,
    isConfirming,
    rejectDeposit,
    isRejecting,
  } = useDepositList();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<DepositFilter>("All");

  const filteredDeposits = useMemo(() => {
    const q = search.toLowerCase();
    return deposits.filter((d) => {
      const matchesSearch =
        (d.full_name ?? "").toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.deposit_id.toLowerCase().includes(q);
      const matchesFilter = filter === "All" || d.status === STATUS_MAP[filter];
      return matchesSearch && matchesFilter;
    });
  }, [deposits, search, filter]);

  const {
    paginated: pagedDeposits,
    page,
    totalPages,
    setPage,
  } = usePagination(filteredDeposits, PAGE_SIZE);

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
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
          Finance
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Deposits
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Monitor and review user deposit activity.
        </p>
      </div>

      {!isPending && !isError && <DepositsSummary deposits={deposits} />}

      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]">
        <DepositsToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        {isPending ? (
          <DepositsLoadingState />
        ) : isError ? (
          <DepositsErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={refetch}
          />
        ) : filteredDeposits.length === 0 ? (
          <DepositsEmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <>
            <DepositsTable
              deposits={pagedDeposits}
              onConfirm={confirmDeposit}
              onReject={(id, reason) =>
                rejectDeposit({ depositId: id, reason })
              }
              isConfirming={isConfirming}
              isRejecting={isRejecting}
            />
            <DepositsMobileList
              deposits={pagedDeposits}
              onConfirm={confirmDeposit}
              onReject={(id, reason) =>
                rejectDeposit({ depositId: id, reason })
              }
              isConfirming={isConfirming}
              isRejecting={isRejecting}
            />
            <PaginationFooter
              page={page}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              totalItems={filteredDeposits.length}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </main>
  );
}
