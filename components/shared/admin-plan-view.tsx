// components/admin-plans-view.tsx
"use client";

import { useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import PaginationFooter from "@/components/shared/paginationFooter";
import {
  TableEmptyState,
  TableErrorState,
  TableLoadingState,
} from "@/components/shared/TableStates";
import PlanFormModal from "./plan-form-modal";
import { useAdminPlans } from "@/hooks/admin";
import PlansToolbar, { PlanFilter } from "./plan-toolbar";
import { AdminPlanRow, PlanInput, PlanStatus } from "@/types/plan";
import PlansSummary from "./plan-summary";
import PlansTable from "./plan-table";
import PlansMobileList from "./plan-mobile-list";

const PAGE_SIZE = 10;

export default function AdminPlansView() {
  const {
    plans,
    isPending,
    isError,
    error,
    refetch,
    createPlan,
    updatePlan,
    setPlanStatus,
    deletePlan,
    isSaving,
    isBusy,
  } = useAdminPlans();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PlanFilter>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlanRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return plans.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchesFilter = filter === "All" || p.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [plans, search, filter]);

  const { paginated, page, totalPages, setPage } = usePagination(
    filtered,
    PAGE_SIZE,
  );
  const hasActiveFilters = search.trim() !== "" || filter !== "All";

  function changeSearch(v: string) {
    setSearch(v);
    setPage(1);
  }
  function changeFilter(v: PlanFilter) {
    setFilter(v);
    setPage(1);
  }
  function clearFilters() {
    setSearch("");
    setFilter("All");
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(plan: AdminPlanRow) {
    setEditing(plan);
    setFormOpen(true);
  }
  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  // Throws on failure so the modal stays open. The hook has already toasted why.
  async function handleSave(input: PlanInput, status: PlanStatus) {
    if (editing) await updatePlan({ id: editing.plan_id, input });
    else await createPlan({ input, status });
    closeForm();
  }

  async function handleStatusChange(plan: AdminPlanRow, status: PlanStatus) {
    if (isBusy) return;
    if (
      status === "archived" &&
      !window.confirm(
        `Archive "${plan.name}"?\n\nIt stops accepting new investments and is hidden from users. ` +
          `Existing investments aren't affected, and you can restore it later.`,
      )
    ) {
      return;
    }
    try {
      await setPlanStatus({ id: plan.plan_id, status });
    } catch {}
  }

  async function handleDelete(plan: AdminPlanRow) {
    if (isBusy) return;
    if (!window.confirm(`Delete "${plan.name}"?\n\nThis can't be undone.`))
      return;
    try {
      await deletePlan(plan.plan_id);
    } catch {}
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
            Products
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Investment Plans
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Create and manage the plans users can invest in.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f6c62f]"
        >
          <Plus size={17} />
          Create Plan
        </button>
      </div>

      {!isPending && !isError && <PlansSummary plans={plans} />}

      <PlansToolbar
        search={search}
        onSearchChange={changeSearch}
        filter={filter}
        onFilterChange={changeFilter}
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
            icon={Wallet}
            title={
              hasActiveFilters
                ? "No plans match your search"
                : "No investment plans yet"
            }
            description={
              hasActiveFilters
                ? "Try a different search or clear your filters."
                : "Create your first plan so users have something to invest in."
            }
            action={
              hasActiveFilters
                ? { label: "Clear filters", onClick: clearFilters }
                : { label: "Create plan", onClick: openCreate }
            }
          />
        </div>
      ) : (
        <>
          <PlansTable
            plans={paginated}
            onEdit={openEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
          <PlansMobileList
            plans={paginated}
            onEdit={openEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
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

      {formOpen && (
        <PlanFormModal
          plan={editing}
          isSaving={isSaving}
          onClose={closeForm}
          onSubmit={handleSave}
        />
      )}
    </main>
  );
}
