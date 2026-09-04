"use client";

import { useMemo, useState } from "react";

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit3,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

type PlanStatus = "Active" | "Inactive";

type InvestmentPlan = {
  id: string;
  name: string;
  description: string;
  roi: number;
  duration: number;
  durationUnit: "Days" | "Months";
  minInvestment: number;
  maxInvestment: number;
  investors: number;
  totalInvested: number;
  status: PlanStatus;
  createdAt: string;
};

const initialPlans: InvestmentPlan[] = [
  {
    id: "PLAN-001",
    name: "Starter Plan",
    description: "Low-entry investment plan for new investors.",
    roi: 5,
    duration: 30,
    durationUnit: "Days",
    minInvestment: 100,
    maxInvestment: 5000,
    investors: 248,
    totalInvested: 48600,
    status: "Active",
    createdAt: "Aug 12, 2026",
  },
  {
    id: "PLAN-002",
    name: "Growth Plan",
    description: "Balanced plan designed for medium-term growth.",
    roi: 12,
    duration: 90,
    durationUnit: "Days",
    minInvestment: 1000,
    maxInvestment: 25000,
    investors: 126,
    totalInvested: 218500,
    status: "Active",
    createdAt: "Aug 08, 2026",
  },
  {
    id: "PLAN-003",
    name: "Premium Plan",
    description: "Higher-tier plan for larger portfolio allocations.",
    roi: 20,
    duration: 6,
    durationUnit: "Months",
    minInvestment: 10000,
    maxInvestment: 100000,
    investors: 74,
    totalInvested: 582000,
    status: "Active",
    createdAt: "Jul 28, 2026",
  },
  {
    id: "PLAN-004",
    name: "Elite Plan",
    description: "Long-term premium investment opportunity.",
    roi: 35,
    duration: 12,
    durationUnit: "Months",
    minInvestment: 50000,
    maxInvestment: 500000,
    investors: 31,
    totalInvested: 920000,
    status: "Active",
    createdAt: "Jul 20, 2026",
  },
  {
    id: "PLAN-005",
    name: "Legacy Plan",
    description: "Archived investment plan for existing investors.",
    roi: 28,
    duration: 12,
    durationUnit: "Months",
    minInvestment: 25000,
    maxInvestment: 250000,
    investors: 19,
    totalInvested: 310000,
    status: "Inactive",
    createdAt: "Jun 15, 2026",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function InvestmentPlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>(initialPlans);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PlanStatus>("All");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.description.toLowerCase().includes(search.toLowerCase()) ||
        plan.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || plan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  const totalInvested = plans.reduce(
    (total, plan) => total + plan.totalInvested,
    0,
  );

  const totalInvestors = plans.reduce(
    (total, plan) => total + plan.investors,
    0,
  );

  const activePlans = plans.filter((plan) => plan.status === "Active").length;

  const inactivePlans = plans.filter(
    (plan) => plan.status === "Inactive",
  ).length;

  const togglePlanStatus = (id: string) => {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              status: plan.status === "Active" ? "Inactive" : "Active",
            }
          : plan,
      ),
    );

    setOpenMenu(null);
  };

  const deletePlan = (id: string) => {
    setPlans((current) => current.filter((plan) => plan.id !== id));

    setOpenMenu(null);
  };

  return (
    <div className="min-h-screen bg-[#080c11] text-white">
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
              <span>Admin</span>
              <span>/</span>
              <span className="text-zinc-300">Investment Plans</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Investment Plans
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Create and manage investment plans available to users.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f6c62f]"
          >
            <Plus size={17} />
            Create Plan
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Plans"
            value={plans.length.toString()}
            icon={Activity}
            description={`${activePlans} currently active`}
          />

          <SummaryCard
            label="Total Investors"
            value={totalInvestors.toLocaleString()}
            icon={Users}
            description="Across all plans"
          />

          <SummaryCard
            label="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={DollarSign}
            description="Current plan allocations"
          />

          <SummaryCard
            label="Inactive Plans"
            value={inactivePlans.toString()}
            icon={Clock3}
            description="Not accepting new investments"
          />
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search plans..."
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(["All", "Active", "Inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    statusFilter === status
                      ? "bg-[#f0b90b] text-black"
                      : "border border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1016] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.015]">
                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Plan
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    ROI
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Duration
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Investment Range
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Investors
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Total Invested
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPlans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.015]"
                  >
                    {/* Plan */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/10">
                          <TrendingUp size={18} className="text-[#f0b90b]" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {plan.name}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-zinc-600">
                            {plan.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ROI */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                        <ArrowUp size={14} />
                        {plan.roi}%
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Clock3 size={14} className="text-zinc-600" />
                        {plan.duration} {plan.durationUnit}
                      </div>
                    </td>

                    {/* Range */}
                    <td className="px-5 py-5">
                      <div className="text-sm text-zinc-300">
                        {formatCurrency(plan.minInvestment)}
                      </div>

                      <div className="mt-0.5 text-xs text-zinc-600">
                        to {formatCurrency(plan.maxInvestment)}
                      </div>
                    </td>

                    {/* Investors */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-zinc-600" />

                        <span className="text-sm text-zinc-300">
                          {plan.investors.toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(plan.totalInvested)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-5">
                      <StatusBadge status={plan.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-5">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === plan.id ? null : plan.id)
                          }
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenu === plan.id && (
                          <ActionMenu
                            plan={plan}
                            onEdit={() => {
                              setEditingPlan(plan);
                              setShowCreateModal(true);
                              setOpenMenu(null);
                            }}
                            onToggle={() => togglePlanStatus(plan.id)}
                            onDelete={() => deletePlan(plan.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPlans.length === 0 && <EmptyState />}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 lg:hidden">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/10">
                    <TrendingUp size={18} className="text-[#f0b90b]" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {plan.name}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-600">{plan.id}</p>
                  </div>
                </div>

                <StatusBadge status={plan.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <InfoBox
                  label="ROI"
                  value={`${plan.roi}%`}
                  valueClass="text-emerald-400"
                />

                <InfoBox
                  label="Duration"
                  value={`${plan.duration} ${plan.durationUnit}`}
                />

                <InfoBox
                  label="Min. Investment"
                  value={formatCurrency(plan.minInvestment)}
                />

                <InfoBox
                  label="Max. Investment"
                  value={formatCurrency(plan.maxInvestment)}
                />

                <InfoBox
                  label="Investors"
                  value={plan.investors.toLocaleString()}
                />

                <InfoBox
                  label="Total Invested"
                  value={formatCurrency(plan.totalInvested)}
                />
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-4">
                <button
                  onClick={() => {
                    setEditingPlan(plan);
                    setShowCreateModal(true);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Edit3 size={15} />
                  Edit
                </button>

                <button
                  onClick={() => togglePlanStatus(plan.id)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    plan.status === "Active"
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/15"
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                  }`}
                >
                  {plan.status === "Active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))}

          {filteredPlans.length === 0 && <EmptyState />}
        </div>

        {/* Pagination */}
        {filteredPlans.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="text-zinc-300">{filteredPlans.length}</span> of{" "}
              <span className="text-zinc-300">{plans.length}</span> plans
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled
                className="rounded-lg border border-white/[0.06] p-2 text-zinc-700"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="rounded-lg bg-white/[0.05] px-3 py-2 text-zinc-300">
                1
              </span>

              <button
                disabled
                className="rounded-lg border border-white/[0.06] p-2 text-zinc-700"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPlan(null);
          }}
          onSave={(plan) => {
            if (editingPlan) {
              setPlans((current) =>
                current.map((item) =>
                  item.id === editingPlan.id ? plan : item,
                ),
              );
            } else {
              setPlans((current) => [plan, ...current]);
            }

            setShowCreateModal(false);
            setEditingPlan(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------
   Summary Card
------------------------------------------------- */

function SummaryCard({
  label,
  value,
  icon: Icon,
  description,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon size={17} className="text-[#f0b90b]" />
        </div>
      </div>

      <p className="mt-3 text-[11px] text-zinc-600">{description}</p>
    </div>
  );
}

/* -------------------------------------------------
   Status Badge
------------------------------------------------- */

function StatusBadge({ status }: { status: PlanStatus }) {
  const active = status === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-zinc-500/10 text-zinc-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-zinc-500"
        }`}
      />

      {status}
    </span>
  );
}

/* -------------------------------------------------
   Info Box
------------------------------------------------- */

function InfoBox({
  label,
  value,
  valueClass = "text-zinc-200",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

/* -------------------------------------------------
   Action Menu
------------------------------------------------- */

function ActionMenu({
  plan,
  onEdit,
  onToggle,
  onDelete,
}: {
  plan: InvestmentPlan;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11171f] p-1.5 shadow-2xl">
      <button
        onClick={onEdit}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
      >
        <Edit3 size={15} />
        Edit Plan
      </button>

      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
      >
        {plan.status === "Active" ? (
          <>
            <X size={15} />
            Deactivate
          </>
        ) : (
          <>
            <Check size={15} />
            Activate
          </>
        )}
      </button>

      <div className="my-1 border-t border-white/[0.05]" />

      <button
        onClick={onDelete}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
      >
        <X size={15} />
        Delete Plan
      </button>
    </div>
  );
}

/* -------------------------------------------------
   Empty State
------------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Wallet size={20} className="text-zinc-600" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        No investment plans found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-zinc-600">
        Try changing your search or filter to find investment plans.
      </p>
    </div>
  );
}

/* -------------------------------------------------
   Create / Edit Modal
------------------------------------------------- */

function PlanModal({
  plan,
  onClose,
  onSave,
}: {
  plan: InvestmentPlan | null;
  onClose: () => void;
  onSave: (plan: InvestmentPlan) => void;
}) {
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [roi, setRoi] = useState(plan?.roi.toString() ?? "");
  const [duration, setDuration] = useState(plan?.duration.toString() ?? "");
  const [durationUnit, setDurationUnit] = useState<"Days" | "Months">(
    plan?.durationUnit ?? "Days",
  );

  const [minInvestment, setMinInvestment] = useState(
    plan?.minInvestment.toString() ?? "",
  );

  const [maxInvestment, setMaxInvestment] = useState(
    plan?.maxInvestment.toString() ?? "",
  );

  const [status, setStatus] = useState<PlanStatus>(plan?.status ?? "Active");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newPlan: InvestmentPlan = {
      id: plan?.id ?? `PLAN-${String(Date.now()).slice(-4)}`,
      name,
      description,
      roi: Number(roi),
      duration: Number(duration),
      durationUnit,
      minInvestment: Number(minInvestment),
      maxInvestment: Number(maxInvestment),
      investors: plan?.investors ?? 0,
      totalInvested: plan?.totalInvested ?? 0,
      status,
      createdAt: plan?.createdAt ?? "Sep 3, 2026",
    };

    onSave(newPlan);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d131a] shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#0d131a] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              {plan ? "Edit Investment Plan" : "Create Investment Plan"}
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Configure the investment plan details.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {/* Name */}
          <FormField label="Plan Name">
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Growth Plan"
              className="form-input"
            />
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Describe this investment plan..."
              className="form-input resize-none py-3"
            />
          </FormField>

          {/* ROI + Duration */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="ROI (%)">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={roi}
                onChange={(event) => setRoi(event.target.value)}
                placeholder="12"
                className="form-input"
              />
            </FormField>

            <FormField label="Duration">
              <div className="flex gap-2">
                <input
                  required
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="90"
                  className="form-input"
                />

                <select
                  value={durationUnit}
                  onChange={(event) =>
                    setDurationUnit(event.target.value as "Days" | "Months")
                  }
                  className="w-28 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 text-sm text-white outline-none focus:border-[#f0b90b]/40"
                >
                  <option value="Days">Days</option>
                  <option value="Months">Months</option>
                </select>
              </div>
            </FormField>
          </div>

          {/* Investment Range */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Minimum Investment">
              <input
                required
                type="number"
                min="0"
                value={minInvestment}
                onChange={(event) => setMinInvestment(event.target.value)}
                placeholder="1000"
                className="form-input"
              />
            </FormField>

            <FormField label="Maximum Investment">
              <input
                required
                type="number"
                min="0"
                value={maxInvestment}
                onChange={(event) => setMaxInvestment(event.target.value)}
                placeholder="25000"
                className="form-input"
              />
            </FormField>
          </div>

          {/* Status */}
          <FormField label="Status">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PlanStatus)}
              className="form-input"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FormField>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#f0b90b] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f6c62f]"
            >
              {plan ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          height: 44px;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.025);
          padding: 0 0.875rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
        }

        .form-input::placeholder {
          color: rgb(82 82 91);
        }

        .form-input:focus {
          border-color: rgba(240, 185, 11, 0.4);
        }

        select.form-input {
          appearance: auto;
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------
   Form Field
------------------------------------------------- */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-zinc-400">
        {label}
      </span>

      {children}
    </label>
  );
}
