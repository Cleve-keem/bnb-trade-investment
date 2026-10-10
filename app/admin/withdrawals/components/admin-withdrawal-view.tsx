"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, Clock3 } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import PaginationFooter from "@/components/shared/paginationFooter";
import {
  TableEmptyState,
  TableErrorState,
  TableLoadingState,
} from "@/components/shared/TableStates";
import { formatCurrency } from "@/libs/formatter/money";
import type { AdminWithdrawalRow } from "../types/withdrawal";
import WithdrawalsSummary from "./withdrawals-summary";
import WithdrawalDetailsModal from "./withdrawal-details-modal";
import { useWithdrawalList } from "../hooks/withdrawal-list";
import WithdrawalsToolbar, { AssetFilterType, StatusFilter } from "./withdrawal-toolbar";
import WithdrawalsTable from "./withdrawal-table";
import WithdrawalsMobileList from "./withdrawal-mobile-list";
import RejectReasonPrompt from "./withdrawal-reason-prompt";

const PAGE_SIZE = 10;

export default function AdminWithdrawalsView() {
  const {
    withdrawals,
    isPending,
    isError,
    error,
    refetch,
    approve,
    isApproving,
    reject,
    isRejecting,
    complete,
    isCompleting,
  } = useWithdrawalList();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [asset, setAsset] = useState<AssetFilterType>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<AdminWithdrawalRow | null>(null);

  // The modal reads from the live list, not a snapshot, so after an action
  // it shows the real status, review time and rejection reason.
  const selected = useMemo(
    () => withdrawals.find((w) => w.withdrawal_id === selectedId) ?? null,
    [withdrawals, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withdrawals.filter((w) => {
      const matchesSearch =
        q === "" ||
        (w.full_name ?? "").toLowerCase().includes(q) ||
        w.email.toLowerCase().includes(q) ||
        w.reference.toLowerCase().includes(q) ||
        (w.destination_address ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "All" || w.status === status;
      const matchesAsset =
        asset === "All" ||
        (asset === "Bank" ? w.asset === null : w.asset === asset);
      return matchesSearch && matchesStatus && matchesAsset;
    });
  }, [withdrawals, search, status, asset]);

  const { paginated, page, totalPages, setPage } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  const hasActiveFilters =
    search.trim() !== "" || status !== "All" || asset !== "All";
  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
  const isActing = isApproving || isRejecting || isCompleting;

  function changeSearch(v: string) {
    setSearch(v);
    setPage(1);
  }
  function changeStatus(v: StatusFilter) {
    setStatus(v);
    setPage(1);
  }
  function changeAsset(v: AssetFilterType) {
    setAsset(v);
    setPage(1);
  }
  function clearFilters() {
    setSearch("");
    setStatus("All");
    setAsset("All");
    setPage(1);
  }

  // The hook already shows a toast when a call fails, so these only need to
  // keep the rejection from surfacing as an unhandled promise.
  async function handleApprove(id: string) {
    if (isActing) return;
    try {
      await approve(id);
    } catch {}
  }

  async function handleComplete(id: string) {
    if (isActing) return;
    const w = withdrawals.find((row) => row.withdrawal_id === id);
    if (!w) return;

    const ok = window.confirm(
      `Confirm you've sent ${formatCurrency(w.net_amount, "USD")} to ${w.destination_address ?? "the user"}?\n\n` +
        `This debits ${formatCurrency(w.amount, "USD")} from the user's wallet and can't be undone.`,
    );
    if (!ok) return;

    try {
      await complete(id);
    } catch {}
  }

  async function handleRejectConfirm(reason: string) {
    if (!rejecting || isRejecting) return;
    try {
      await reject({ id: rejecting.withdrawal_id, reason });
      setRejecting(null); // stays open on failure so the admin can retry
    } catch {}
  }

  const view = (w: AdminWithdrawalRow) => setSelectedId(w.withdrawal_id);

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
            Finance
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Withdrawals
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Review and manage user withdrawal requests.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/5 px-3 py-2 text-xs text-[#f0b90b]">
            <Clock3 size={14} />
            {pendingCount} request{pendingCount === 1 ? "" : "s"} awaiting
            review
          </div>
        )}
      </div>

      {!isPending && !isError && (
        <WithdrawalsSummary withdrawals={withdrawals} />
      )}

      <WithdrawalsToolbar
        search={search}
        onSearchChange={changeSearch}
        status={status}
        onStatusChange={changeStatus}
        asset={asset}
        onAssetChange={changeAsset}
      />

      {isPending ? (
        <div className="rounded-2xl border border-white/6 bg-[#0b1016]">
          <TableLoadingState />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-white/6 bg-[#0b1016]">
          <TableErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/6 bg-[#0b1016]">
          <TableEmptyState
            icon={ArrowDownLeft}
            title={
              hasActiveFilters
                ? "No withdrawals match your search"
                : "No withdrawals yet"
            }
            description={
              hasActiveFilters
                ? "Try different search terms or clear your filters."
                : "Withdrawal requests will appear here once users submit them."
            }
            action={
              hasActiveFilters
                ? { label: "Clear filters", onClick: clearFilters }
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <WithdrawalsTable
            withdrawals={paginated}
            onView={view}
            onApprove={handleApprove}
            onReject={setRejecting}
            onComplete={handleComplete}
          />
          <WithdrawalsMobileList
            withdrawals={paginated}
            onView={view}
            onApprove={handleApprove}
            onReject={setRejecting}
            onComplete={handleComplete}
          />
          <PaginationFooter
            page={page}
            totalPages={totalPages}
            pageSize={PAGE_SIZE}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </>
      )}

      {selected && (
        <WithdrawalDetailsModal
          withdrawal={selected}
          onClose={() => setSelectedId(null)}
          onApprove={() => handleApprove(selected.withdrawal_id)}
          onReject={() => setRejecting(selected)}
          onComplete={() => handleComplete(selected.withdrawal_id)}
        />
      )}

      {rejecting && (
        <RejectReasonPrompt
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejecting(null)}
          isSubmitting={isRejecting}
        />
      )}
    </main>
  );
}
