"use client";

import { useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";

type InvestmentStatus = "Active" | "Completed" | "Pending" | "Cancelled";

type Investment = {
  id: string;
  reference: string;
  userId: string;
  fullName: string;
  email: string;
  plan: string;
  amount: number;
  roi: number;
  expectedReturn: number;
  profit: number;
  duration: number;
  durationUnit: "Days" | "Months";
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
};

const initialInvestments: Investment[] = [
  {
    id: "INV-001",
    reference: "INV-8A72F1",
    userId: "USR-001",
    fullName: "Elisa Eve",
    email: "elisa@example.com",
    plan: "Premium Plan",
    amount: 50000,
    roi: 20,
    expectedReturn: 60000,
    profit: 10000,
    duration: 6,
    durationUnit: "Months",
    startDate: "Aug 12, 2026",
    endDate: "Feb 12, 2027",
    status: "Active",
  },
  {
    id: "INV-002",
    reference: "INV-7B61D4",
    userId: "USR-002",
    fullName: "John Smith",
    email: "john@example.com",
    plan: "Growth Plan",
    amount: 12000,
    roi: 12,
    expectedReturn: 13440,
    profit: 1440,
    duration: 90,
    durationUnit: "Days",
    startDate: "Aug 18, 2026",
    endDate: "Nov 16, 2026",
    status: "Active",
  },
  {
    id: "INV-003",
    reference: "INV-6C42A8",
    userId: "USR-003",
    fullName: "David James",
    email: "david@example.com",
    plan: "Starter Plan",
    amount: 2500,
    roi: 5,
    expectedReturn: 2625,
    profit: 125,
    duration: 30,
    durationUnit: "Days",
    startDate: "Aug 25, 2026",
    endDate: "Sep 24, 2026",
    status: "Active",
  },
  {
    id: "INV-004",
    reference: "INV-5D92E3",
    userId: "USR-004",
    fullName: "Sarah Adams",
    email: "sarah@example.com",
    plan: "Elite Plan",
    amount: 100000,
    roi: 35,
    expectedReturn: 135000,
    profit: 35000,
    duration: 12,
    durationUnit: "Months",
    startDate: "Jul 10, 2026",
    endDate: "Jul 10, 2027",
    status: "Active",
  },
  {
    id: "INV-005",
    reference: "INV-4E83B7",
    userId: "USR-005",
    fullName: "Michael Brown",
    email: "michael@example.com",
    plan: "Growth Plan",
    amount: 8000,
    roi: 12,
    expectedReturn: 8960,
    profit: 960,
    duration: 90,
    durationUnit: "Days",
    startDate: "May 20, 2026",
    endDate: "Aug 18, 2026",
    status: "Completed",
  },
  {
    id: "INV-006",
    reference: "INV-3F71C2",
    userId: "USR-006",
    fullName: "Daniel Williams",
    email: "daniel@example.com",
    plan: "Premium Plan",
    amount: 30000,
    roi: 20,
    expectedReturn: 36000,
    profit: 6000,
    duration: 6,
    durationUnit: "Months",
    startDate: "Aug 28, 2026",
    endDate: "Feb 28, 2027",
    status: "Pending",
  },
  {
    id: "INV-007",
    reference: "INV-2G64A9",
    userId: "USR-007",
    fullName: "Grace Johnson",
    email: "grace@example.com",
    plan: "Starter Plan",
    amount: 1000,
    roi: 5,
    expectedReturn: 1050,
    profit: 50,
    duration: 30,
    durationUnit: "Days",
    startDate: "Aug 05, 2026",
    endDate: "Sep 04, 2026",
    status: "Cancelled",
  },
  {
    id: "INV-008",
    reference: "INV-1H58D6",
    userId: "USR-008",
    fullName: "Robert Wilson",
    email: "robert@example.com",
    plan: "Growth Plan",
    amount: 18000,
    roi: 12,
    expectedReturn: 20160,
    profit: 2160,
    duration: 90,
    durationUnit: "Days",
    startDate: "Aug 15, 2026",
    endDate: "Nov 13, 2026",
    status: "Active",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function InvestmentsPage() {
  const [investments, setInvestments] =
    useState<Investment[]>(initialInvestments);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"All" | InvestmentStatus>(
    "All",
  );

  const [planFilter, setPlanFilter] = useState("All");

  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const plans = [
    "All",
    ...Array.from(new Set(investments.map((investment) => investment.plan))),
  ];

  const filteredInvestments = useMemo(() => {
    return investments.filter((investment) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        investment.fullName.toLowerCase().includes(searchTerm) ||
        investment.email.toLowerCase().includes(searchTerm) ||
        investment.reference.toLowerCase().includes(searchTerm) ||
        investment.plan.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "All" || investment.status === statusFilter;

      const matchesPlan =
        planFilter === "All" || investment.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [investments, search, statusFilter, planFilter]);

  const totalInvested = investments
    .filter((investment) => investment.status !== "Cancelled")
    .reduce((total, investment) => total + investment.amount, 0);

  const expectedReturns = investments
    .filter((investment) => investment.status !== "Cancelled")
    .reduce((total, investment) => total + investment.expectedReturn, 0);

  const totalProfit = investments
    .filter((investment) => investment.status !== "Cancelled")
    .reduce((total, investment) => total + investment.profit, 0);

  const activeCount = investments.filter(
    (investment) => investment.status === "Active",
  ).length;

  const pendingCount = investments.filter(
    (investment) => investment.status === "Pending",
  ).length;

  const completedCount = investments.filter(
    (investment) => investment.status === "Completed",
  ).length;

  const cancelInvestment = (id: string) => {
    setInvestments((current) =>
      current.map((investment) =>
        investment.id === id
          ? {
              ...investment,
              status: "Cancelled",
            }
          : investment,
      ),
    );

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
              <span className="text-zinc-300">Investments</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Investments
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Monitor and manage user investments across the platform.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Invested"
            value={formatCurrency(totalInvested)}
            icon={DollarSign}
            description={`${investments.length} total investment records`}
          />

          <SummaryCard
            label="Expected Returns"
            value={formatCurrency(expectedReturns)}
            icon={TrendingUp}
            description="Projected investment value"
          />

          <SummaryCard
            label="Expected Profit"
            value={formatCurrency(totalProfit)}
            icon={ArrowUp}
            description="Projected ROI earnings"
            valueClass="text-emerald-400"
          />

          <SummaryCard
            label="Active Investments"
            value={activeCount.toString()}
            icon={BriefcaseBusiness}
            description={`${pendingCount} pending • ${completedCount} completed`}
          />
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user, reference or plan..."
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Status */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {(
                  [
                    "All",
                    "Active",
                    "Pending",
                    "Completed",
                    "Cancelled",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
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

              {/* Plan filter */}
              <div className="relative shrink-0">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <select
                  value={planFilter}
                  onChange={(event) => setPlanFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.025] pl-9 pr-9 text-xs text-zinc-300 outline-none focus:border-[#f0b90b]/40 sm:w-44"
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

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1016] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.015]">
                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Investor
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Plan
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    ROI
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Expected Return
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Duration
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    End Date
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
                {filteredInvestments.map((investment) => (
                  <tr
                    key={investment.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.015]"
                  >
                    {/* Investor */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-semibold text-zinc-300">
                          {getInitials(investment.fullName)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {investment.fullName}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-zinc-600">
                            {investment.reference}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-5">
                      <p className="text-sm text-zinc-300">{investment.plan}</p>

                      <p className="mt-0.5 text-xs text-zinc-600">
                        {investment.duration} {investment.durationUnit}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(investment.amount)}
                      </p>
                    </td>

                    {/* ROI */}
                    <td className="px-5 py-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                        <ArrowUp size={13} />
                        {investment.roi}%
                      </span>
                    </td>

                    {/* Return */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(investment.expectedReturn)}
                      </p>

                      <p className="mt-0.5 text-xs text-emerald-400">
                        +{formatCurrency(investment.profit)}
                      </p>
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Clock3 size={14} className="text-zinc-600" />
                        {investment.duration} {investment.durationUnit}
                      </div>
                    </td>

                    {/* End Date */}
                    <td className="px-5 py-5">
                      <p className="text-sm text-zinc-300">
                        {investment.endDate}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-600">
                        Started {investment.startDate}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-5">
                      <StatusBadge status={investment.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-5">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === investment.id ? null : investment.id,
                            )
                          }
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenu === investment.id && (
                          <InvestmentMenu
                            investment={investment}
                            onView={() => {
                              setSelectedInvestment(investment);
                              setOpenMenu(null);
                            }}
                            onCancel={() => cancelInvestment(investment.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvestments.length === 0 && <EmptyState />}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 lg:hidden">
          {filteredInvestments.map((investment) => (
            <div
              key={investment.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-semibold text-zinc-300">
                    {getInitials(investment.fullName)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {investment.fullName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-zinc-600">
                      {investment.reference}
                    </p>
                  </div>
                </div>

                <StatusBadge status={investment.status} />
              </div>

              <div className="mt-5 rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/[0.025] p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Investment Plan
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {investment.plan}
                    </p>
                  </div>

                  <TrendingUp size={18} className="text-[#f0b90b]" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <InfoBox
                  label="Amount"
                  value={formatCurrency(investment.amount)}
                />

                <InfoBox
                  label="ROI"
                  value={`${investment.roi}%`}
                  valueClass="text-emerald-400"
                />

                <InfoBox
                  label="Expected Return"
                  value={formatCurrency(investment.expectedReturn)}
                />

                <InfoBox
                  label="Profit"
                  value={`+${formatCurrency(investment.profit)}`}
                  valueClass="text-emerald-400"
                />

                <InfoBox
                  label="Duration"
                  value={`${investment.duration} ${investment.durationUnit}`}
                />

                <InfoBox label="End Date" value={investment.endDate} />
              </div>

              <div className="mt-4 flex gap-2 border-t border-white/[0.05] pt-4">
                <button
                  onClick={() => setSelectedInvestment(investment)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Eye size={15} />
                  View Details
                </button>

                {investment.status === "Active" && (
                  <button
                    onClick={() => cancelInvestment(investment.id)}
                    className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredInvestments.length === 0 && <EmptyState />}
        </div>

        {/* Pagination */}
        {filteredInvestments.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="text-zinc-300">
                {filteredInvestments.length}
              </span>{" "}
              of <span className="text-zinc-300">{investments.length}</span>{" "}
              investments
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

      {/* Investment Details Modal */}
      {selectedInvestment && (
        <InvestmentDetailsModal
          investment={selectedInvestment}
          onClose={() => setSelectedInvestment(null)}
        />
      )}
    </div>
  );
}

/* =================================================
   SUMMARY CARD
================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
  description,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>

          <p className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}>
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

/* =================================================
   STATUS BADGE
================================================= */

function StatusBadge({ status }: { status: InvestmentStatus }) {
  const styles: Record<InvestmentStatus, string> = {
    Active: "bg-emerald-500/10 text-emerald-400",
    Completed: "bg-blue-500/10 text-blue-400",
    Pending: "bg-[#f0b90b]/10 text-[#f0b90b]",
    Cancelled: "bg-red-500/10 text-red-400",
  };

  const dotStyles: Record<InvestmentStatus, string> = {
    Active: "bg-emerald-400",
    Completed: "bg-blue-400",
    Pending: "bg-[#f0b90b]",
    Cancelled: "bg-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status]}`} />

      {status}
    </span>
  );
}

/* =================================================
   INFO BOX
================================================= */

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

/* =================================================
   INVESTMENT ACTION MENU
================================================= */

function InvestmentMenu({
  investment,
  onView,
  onCancel,
}: {
  investment: Investment;
  onView: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11171f] p-1.5 shadow-2xl">
      <button
        onClick={onView}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
      >
        <Eye size={15} />
        View Details
      </button>

      {investment.status === "Active" && (
        <button
          onClick={onCancel}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
        >
          <X size={15} />
          Cancel Investment
        </button>
      )}
    </div>
  );
}

/* =================================================
   DETAILS MODAL
================================================= */

function InvestmentDetailsModal({
  investment,
  onClose,
}: {
  investment: Investment;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d131a] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Investment Details
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              {investment.reference}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* User */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0b90b] text-sm font-bold text-black">
                {getInitials(investment.fullName)}
              </div>

              <div>
                <p className="text-sm font-semibold">{investment.fullName}</p>

                <p className="mt-0.5 text-xs text-zinc-600">
                  {investment.email}
                </p>
              </div>

              <div className="ml-auto">
                <StatusBadge status={investment.status} />
              </div>
            </div>
          </div>

          {/* Main Investment */}
          <div className="rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/[0.025] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-600">Investment Plan</p>

                <p className="mt-1 text-lg font-semibold">{investment.plan}</p>
              </div>

              <TrendingUp size={22} className="text-[#f0b90b]" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailItem
                label="Amount"
                value={formatCurrency(investment.amount)}
              />

              <DetailItem
                label="ROI"
                value={`${investment.roi}%`}
                valueClass="text-emerald-400"
              />

              <DetailItem
                label="Profit"
                value={`+${formatCurrency(investment.profit)}`}
                valueClass="text-emerald-400"
              />

              <DetailItem
                label="Expected Return"
                value={formatCurrency(investment.expectedReturn)}
              />

              <DetailItem
                label="Duration"
                value={`${investment.duration} ${investment.durationUnit}`}
              />

              <DetailItem label="Investment ID" value={investment.id} />
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Investment Timeline
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <TimelineItem
                icon={CalendarDays}
                label="Start Date"
                value={investment.startDate}
              />

              <TimelineItem
                icon={CalendarDays}
                label="End Date"
                value={investment.endDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================
   DETAIL ITEM
================================================= */

function DetailItem({
  label,
  value,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

/* =================================================
   TIMELINE ITEM
================================================= */

function TimelineItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon size={15} className="text-zinc-500" />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
          {label}
        </p>

        <p className="mt-1 text-sm text-zinc-300">{value}</p>
      </div>
    </div>
  );
}

/* =================================================
   EMPTY STATE
================================================= */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
        <BriefcaseBusiness size={20} className="text-zinc-600" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        No investments found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-zinc-600">
        Try changing your search or filters to find investment records.
      </p>
    </div>
  );
}

/* =================================================
   HELPERS
================================================= */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
