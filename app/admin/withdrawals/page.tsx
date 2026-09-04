"use client";

import { useMemo, useState } from "react";

import {
  ArrowDownLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  DollarSign,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  ShieldCheck,
  User,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

type WithdrawalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Processing"
  | "Completed";

type Withdrawal = {
  id: string;
  reference: string;
  userId: string;
  fullName: string;
  email: string;
  amount: number;
  fee: number;
  netAmount: number;
  method: "Bitcoin" | "Ethereum" | "USDT" | "Bank Transfer";
  walletAddress: string;
  requestedAt: string;
  processedAt?: string;
  status: WithdrawalStatus;
};

const initialWithdrawals: Withdrawal[] = [
  {
    id: "WD-001",
    reference: "WDR-82A91F",
    userId: "USR-001",
    fullName: "Elisa Eve",
    email: "elisa@example.com",
    amount: 5000,
    fee: 25,
    netAmount: 4975,
    method: "Bitcoin",
    walletAddress: "bc1q7x9k...82jd91",
    requestedAt: "Sep 3, 2026 • 09:42 AM",
    status: "Pending",
  },
  {
    id: "WD-002",
    reference: "WDR-71B42D",
    userId: "USR-002",
    fullName: "John Smith",
    email: "john@example.com",
    amount: 2500,
    fee: 15,
    netAmount: 2485,
    method: "USDT",
    walletAddress: "TX9f8K...72LmQ",
    requestedAt: "Sep 3, 2026 • 08:15 AM",
    status: "Pending",
  },
  {
    id: "WD-003",
    reference: "WDR-64C38A",
    userId: "USR-003",
    fullName: "David James",
    email: "david@example.com",
    amount: 1200,
    fee: 10,
    netAmount: 1190,
    method: "Ethereum",
    walletAddress: "0x82fA...19Bd",
    requestedAt: "Sep 2, 2026 • 04:32 PM",
    status: "Approved",
    processedAt: "Sep 2, 2026 • 05:10 PM",
  },
  {
    id: "WD-004",
    reference: "WDR-53D27E",
    userId: "USR-004",
    fullName: "Sarah Adams",
    email: "sarah@example.com",
    amount: 10000,
    fee: 50,
    netAmount: 9950,
    method: "Bank Transfer",
    walletAddress: "GTB •••• 8291",
    requestedAt: "Sep 2, 2026 • 11:24 AM",
    status: "Processing",
    processedAt: "Sep 2, 2026 • 01:02 PM",
  },
  {
    id: "WD-005",
    reference: "WDR-42E16B",
    userId: "USR-005",
    fullName: "Michael Brown",
    email: "michael@example.com",
    amount: 800,
    fee: 8,
    netAmount: 792,
    method: "USDT",
    walletAddress: "TQ8d7L...91KsP",
    requestedAt: "Sep 1, 2026 • 03:18 PM",
    status: "Rejected",
    processedAt: "Sep 1, 2026 • 04:01 PM",
  },
  {
    id: "WD-006",
    reference: "WDR-31F95C",
    userId: "USR-006",
    fullName: "Daniel Williams",
    email: "daniel@example.com",
    amount: 3500,
    fee: 20,
    netAmount: 3480,
    method: "Bitcoin",
    walletAddress: "bc1q92kd...71ma82",
    requestedAt: "Aug 31, 2026 • 01:45 PM",
    status: "Completed",
    processedAt: "Aug 31, 2026 • 03:20 PM",
  },
  {
    id: "WD-007",
    reference: "WDR-28G73A",
    userId: "USR-007",
    fullName: "Grace Johnson",
    email: "grace@example.com",
    amount: 1800,
    fee: 12,
    netAmount: 1788,
    method: "Ethereum",
    walletAddress: "0x91Ab...72Fd",
    requestedAt: "Aug 30, 2026 • 10:17 AM",
    status: "Completed",
    processedAt: "Aug 30, 2026 • 11:42 AM",
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>(initialWithdrawals);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"All" | WithdrawalStatus>(
    "All",
  );

  const [methodFilter, setMethodFilter] = useState("All");

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const methods = ["All", "Bitcoin", "Ethereum", "USDT", "Bank Transfer"];

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((withdrawal) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        withdrawal.fullName.toLowerCase().includes(searchTerm) ||
        withdrawal.email.toLowerCase().includes(searchTerm) ||
        withdrawal.reference.toLowerCase().includes(searchTerm) ||
        withdrawal.walletAddress.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "All" || withdrawal.status === statusFilter;

      const matchesMethod =
        methodFilter === "All" || withdrawal.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [withdrawals, search, statusFilter, methodFilter]);

  const pendingWithdrawals = withdrawals.filter(
    (withdrawal) => withdrawal.status === "Pending",
  );

  const pendingAmount = pendingWithdrawals.reduce(
    (total, withdrawal) => total + withdrawal.amount,
    0,
  );

  const completedAmount = withdrawals
    .filter((withdrawal) => withdrawal.status === "Completed")
    .reduce((total, withdrawal) => total + withdrawal.amount, 0);

  const totalFees = withdrawals.reduce(
    (total, withdrawal) => total + withdrawal.fee,
    0,
  );

  const approveWithdrawal = (id: string) => {
    setWithdrawals((current) =>
      current.map((withdrawal) =>
        withdrawal.id === id
          ? {
              ...withdrawal,
              status: "Approved",
              processedAt: getCurrentDate(),
            }
          : withdrawal,
      ),
    );

    setOpenMenu(null);

    setSelectedWithdrawal((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Approved",
            processedAt: getCurrentDate(),
          }
        : current,
    );
  };

  const rejectWithdrawal = (id: string) => {
    setWithdrawals((current) =>
      current.map((withdrawal) =>
        withdrawal.id === id
          ? {
              ...withdrawal,
              status: "Rejected",
              processedAt: getCurrentDate(),
            }
          : withdrawal,
      ),
    );

    setOpenMenu(null);

    setSelectedWithdrawal((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Rejected",
            processedAt: getCurrentDate(),
          }
        : current,
    );
  };

  return (
    <div className="min-h-screen bg-[#080c11] text-white">
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <span>Admin</span>
            <span>/</span>
            <span className="text-zinc-300">Withdrawals</span>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Withdrawals
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Review and manage user withdrawal requests.
              </p>
            </div>

            {pendingWithdrawals.length > 0 && (
              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/[0.05] px-3 py-2 text-xs text-[#f0b90b]">
                <Clock3 size={14} />
                {pendingWithdrawals.length} request
                {pendingWithdrawals.length !== 1 ? "s" : ""} awaiting review
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Pending Amount"
            value={formatCurrency(pendingAmount)}
            icon={Clock3}
            description={`${pendingWithdrawals.length} pending requests`}
            valueClass="text-[#f0b90b]"
          />

          <SummaryCard
            label="Completed Withdrawals"
            value={formatCurrency(completedAmount)}
            icon={Check}
            description="Successfully completed"
            valueClass="text-emerald-400"
          />

          <SummaryCard
            label="Total Requests"
            value={withdrawals.length.toString()}
            icon={ArrowDownLeft}
            description="All withdrawal requests"
          />

          <SummaryCard
            label="Total Fees"
            value={formatCurrency(totalFees)}
            icon={DollarSign}
            description="Fees generated"
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
                placeholder="Search user, reference or wallet..."
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Status */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {(
                  [
                    "All",
                    "Pending",
                    "Approved",
                    "Processing",
                    "Completed",
                    "Rejected",
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

              {/* Method */}
              <div className="relative shrink-0">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <select
                  value={methodFilter}
                  onChange={(event) => setMethodFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.025] pl-9 pr-9 text-xs text-zinc-300 outline-none focus:border-[#f0b90b]/40 sm:w-44"
                >
                  {methods.map((method) => (
                    <option
                      key={method}
                      value={method}
                      className="bg-[#0d131a]"
                    >
                      {method}
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
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Amount
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Method
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Net Amount
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Wallet / Account
                  </th>

                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Requested
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
                {filteredWithdrawals.map((withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.015]"
                  >
                    {/* User */}
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-semibold text-zinc-300">
                          {getInitials(withdrawal.fullName)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {withdrawal.fullName}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-zinc-600">
                            {withdrawal.reference}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold text-white">
                        {formatCurrency(withdrawal.amount)}
                      </p>

                      <p className="mt-0.5 text-xs text-zinc-600">
                        Fee {formatCurrency(withdrawal.fee)}
                      </p>
                    </td>

                    {/* Method */}
                    <td className="px-5 py-5">
                      <MethodBadge method={withdrawal.method} />
                    </td>

                    {/* Net */}
                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-zinc-300">
                        {formatCurrency(withdrawal.netAmount)}
                      </p>
                    </td>

                    {/* Wallet */}
                    <td className="px-5 py-5">
                      <p className="max-w-[170px] truncate text-sm text-zinc-400">
                        {withdrawal.walletAddress}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-5">
                      <p className="text-sm text-zinc-300">
                        {withdrawal.requestedAt}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-5">
                      <StatusBadge status={withdrawal.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-5">
                      <div className="relative flex justify-end gap-1">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                          title="View details"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === withdrawal.id ? null : withdrawal.id,
                            )
                          }
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openMenu === withdrawal.id && (
                          <WithdrawalMenu
                            withdrawal={withdrawal}
                            onView={() => {
                              setSelectedWithdrawal(withdrawal);
                              setOpenMenu(null);
                            }}
                            onApprove={() => approveWithdrawal(withdrawal.id)}
                            onReject={() => rejectWithdrawal(withdrawal.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWithdrawals.length === 0 && <EmptyState />}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 lg:hidden">
          {filteredWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4"
            >
              {/* User Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-xs font-semibold text-zinc-300">
                    {getInitials(withdrawal.fullName)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {withdrawal.fullName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-zinc-600">
                      {withdrawal.reference}
                    </p>
                  </div>
                </div>

                <StatusBadge status={withdrawal.status} />
              </div>

              {/* Amount */}
              <div className="mt-5 rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/[0.025] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                      Withdrawal Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                  </div>

                  <ArrowDownLeft size={20} className="text-[#f0b90b]" />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-zinc-600">Fee</span>

                  <span className="text-zinc-400">
                    {formatCurrency(withdrawal.fee)}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-zinc-600">You'll receive</span>

                  <span className="font-medium text-emerald-400">
                    {formatCurrency(withdrawal.netAmount)}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <InfoBox label="Method" value={withdrawal.method} />

                <InfoBox label="Requested" value={withdrawal.requestedAt} />

                <InfoBox
                  label="Destination"
                  value={withdrawal.walletAddress}
                  truncate
                />

                <InfoBox label="User Email" value={withdrawal.email} truncate />
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-white/[0.05] pt-4">
                <button
                  onClick={() => setSelectedWithdrawal(withdrawal)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Eye size={15} />
                  Details
                </button>

                {withdrawal.status === "Pending" && (
                  <>
                    <button
                      onClick={() => rejectWithdrawal(withdrawal.id)}
                      className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => approveWithdrawal(withdrawal.id)}
                      className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/15"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredWithdrawals.length === 0 && <EmptyState />}
        </div>

        {/* Pagination */}
        {filteredWithdrawals.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="text-zinc-300">
                {filteredWithdrawals.length}
              </span>{" "}
              of <span className="text-zinc-300">{withdrawals.length}</span>{" "}
              withdrawal requests
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

      {/* Details Modal */}
      {selectedWithdrawal && (
        <WithdrawalDetailsModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onApprove={() => approveWithdrawal(selectedWithdrawal.id)}
          onReject={() => rejectWithdrawal(selectedWithdrawal.id)}
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

function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const styles: Record<WithdrawalStatus, string> = {
    Pending: "bg-[#f0b90b]/10 text-[#f0b90b]",
    Approved: "bg-blue-500/10 text-blue-400",
    Processing: "bg-purple-500/10 text-purple-400",
    Completed: "bg-emerald-500/10 text-emerald-400",
    Rejected: "bg-red-500/10 text-red-400",
  };

  const dots: Record<WithdrawalStatus, string> = {
    Pending: "bg-[#f0b90b]",
    Approved: "bg-blue-400",
    Processing: "bg-purple-400",
    Completed: "bg-emerald-400",
    Rejected: "bg-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />

      {status}
    </span>
  );
}

/* =================================================
   METHOD BADGE
================================================= */

function MethodBadge({ method }: { method: Withdrawal["method"] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
        <Wallet size={14} className="text-zinc-500" />
      </div>

      <span className="text-sm text-zinc-300">{method}</span>
    </div>
  );
}

/* =================================================
   INFO BOX
================================================= */

function InfoBox({
  label,
  value,
  truncate = false,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-medium text-zinc-200 ${
          truncate ? "truncate" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =================================================
   ACTION MENU
================================================= */

function WithdrawalMenu({
  withdrawal,
  onView,
  onApprove,
  onReject,
}: {
  withdrawal: Withdrawal;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11171f] p-1.5 shadow-2xl">
      <button
        onClick={onView}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
      >
        <Eye size={15} />
        View Details
      </button>

      {withdrawal.status === "Pending" && (
        <>
          <button
            onClick={onApprove}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-emerald-400 transition hover:bg-emerald-500/10"
          >
            <Check size={15} />
            Approve
          </button>

          <button
            onClick={onReject}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <XCircle size={15} />
            Reject
          </button>
        </>
      )}
    </div>
  );
}

/* =================================================
   DETAILS MODAL
================================================= */

function WithdrawalDetailsModal({
  withdrawal,
  onClose,
  onApprove,
  onReject,
}: {
  withdrawal: Withdrawal;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(withdrawal.walletAddress);

      setCopied(true);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable.
    }
  };

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
              Withdrawal Request
            </p>

            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-lg font-semibold">{withdrawal.reference}</h2>

              <StatusBadge status={withdrawal.status} />
            </div>
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
                {getInitials(withdrawal.fullName)}
              </div>

              <div>
                <p className="text-sm font-semibold">{withdrawal.fullName}</p>

                <p className="mt-0.5 text-xs text-zinc-600">
                  {withdrawal.email}
                </p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/[0.025] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-600">Requested Amount</p>

                <p className="mt-1 text-3xl font-bold">
                  {formatCurrency(withdrawal.amount)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b]/10">
                <DollarSign size={19} className="text-[#f0b90b]" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <DetailItem label="Fee" value={formatCurrency(withdrawal.fee)} />

              <DetailItem
                label="Net Amount"
                value={formatCurrency(withdrawal.netAmount)}
                valueClass="text-emerald-400"
              />

              <DetailItem label="Method" value={withdrawal.method} />
            </div>
          </div>

          {/* Destination */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Destination
            </p>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                  <Wallet size={16} className="text-zinc-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    {withdrawal.method === "Bank Transfer"
                      ? "Bank Account"
                      : "Wallet Address"}
                  </p>

                  <p className="mt-1 break-all text-sm text-zinc-300">
                    {withdrawal.walletAddress}
                  </p>
                </div>

                <button
                  onClick={copyAddress}
                  className="shrink-0 rounded-lg border border-white/[0.06] p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                  title="Copy"
                >
                  {copied ? (
                    <Check size={15} className="text-emerald-400" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-600">
              Request Timeline
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TimelineItem
                icon={Clock3}
                label="Requested"
                value={withdrawal.requestedAt}
              />

              <TimelineItem
                icon={ShieldCheck}
                label="Processed"
                value={withdrawal.processedAt ?? "Awaiting review"}
              />
            </div>
          </div>

          {/* Admin Actions */}
          {withdrawal.status === "Pending" && (
            <div className="rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/[0.025] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[#f0b90b]"
                />

                <div>
                  <p className="text-sm font-medium">Review this withdrawal</p>

                  <p className="mt-1 text-xs leading-5 text-zinc-600">
                    Verify the request and destination before approving the
                    withdrawal.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={onReject}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/15"
                >
                  <XCircle size={16} />
                  Reject Withdrawal
                </button>

                <button
                  onClick={onApprove}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/15"
                >
                  <Check size={16} />
                  Approve Withdrawal
                </button>
              </div>
            </div>
          )}
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon size={15} className="text-zinc-500" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-zinc-600">
          {label}
        </p>

        <p className="mt-1 truncate text-sm text-zinc-300">{value}</p>
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
        <ArrowDownLeft size={20} className="text-zinc-600" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">
        No withdrawals found
      </h3>

      <p className="mt-1 max-w-sm text-xs text-zinc-600">
        Try changing your search or filters to find withdrawal requests.
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

function getCurrentDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}
