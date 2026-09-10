"use client";

import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowDownToLine,
  DollarSign,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useMemo, useState } from "react";

type DepositStatus = "Completed" | "Pending" | "Failed";

type Deposit = {
  id: string;
  user: string;
  email: string;
  amount: number;
  method: string;
  status: DepositStatus;
  date: string;
};

const deposits: Deposit[] = [
  {
    id: "DEP-82947",
    user: "Elisa Eve",
    email: "elisa@example.com",
    amount: 10000,
    method: "Bank Transfer",
    status: "Completed",
    date: "Sep 3, 2026 • 10:42 AM",
  },
  {
    id: "DEP-82946",
    user: "John Smith",
    email: "john@example.com",
    amount: 5000,
    method: "Bank Transfer",
    status: "Pending",
    date: "Sep 3, 2026 • 10:21 AM",
  },
  {
    id: "DEP-82945",
    user: "Sarah Adams",
    email: "sarah@example.com",
    amount: 25000,
    method: "Bank Transfer",
    status: "Completed",
    date: "Sep 3, 2026 • 09:48 AM",
  },
  {
    id: "DEP-82944",
    user: "David James",
    email: "david@example.com",
    amount: 1200,
    method: "Card",
    status: "Failed",
    date: "Sep 3, 2026 • 09:12 AM",
  },
  {
    id: "DEP-82943",
    user: "Daniel Williams",
    email: "daniel@example.com",
    amount: 8500,
    method: "Bank Transfer",
    status: "Completed",
    date: "Sep 2, 2026 • 06:41 PM",
  },
  {
    id: "DEP-82942",
    user: "Michael Brown",
    email: "michael@example.com",
    amount: 3000,
    method: "Bank Transfer",
    status: "Pending",
    date: "Sep 2, 2026 • 05:30 PM",
  },
];

const filters = ["All", "Completed", "Pending", "Failed"] as const;

type Filter = (typeof filters)[number];

export default function AdminDepositsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      const matchesSearch =
        deposit.user.toLowerCase().includes(search.toLowerCase()) ||
        deposit.email.toLowerCase().includes(search.toLowerCase()) ||
        deposit.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || deposit.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalDeposited = deposits.reduce(
    (sum, deposit) =>
      deposit.status === "Completed" ? sum + deposit.amount : sum,
    0,
  );

  const pendingAmount = deposits.reduce(
    (sum, deposit) =>
      deposit.status === "Pending" ? sum + deposit.amount : sum,
    0,
  );

  const completedCount = deposits.filter(
    (deposit) => deposit.status === "Completed",
  ).length;

  const failedCount = deposits.filter(
    (deposit) => deposit.status === "Failed",
  ).length;

  return (
    <main className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Completed Deposits"
          value={formatCurrency(totalDeposited)}
          icon={DollarSign}
        />

        <SummaryCard
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          icon={Clock3}
        />

        <SummaryCard
          title="Completed"
          value={completedCount.toString()}
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Failed"
          value={failedCount.toString()}
          icon={AlertCircle}
        />
      </section>

      {/* Deposit table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025]">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search deposits..."
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal size={14} className="shrink-0 text-zinc-600" />

            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
                  filter === item
                    ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <Head>User</Head>
                <Head>Deposit ID</Head>
                <Head>Amount</Head>
                <Head>Method</Head>
                <Head>Status</Head>
                <Head>Date</Head>
                <th className="w-12 px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredDeposits.map((deposit) => (
                <tr
                  key={deposit.id}
                  className="border-b border-white/4 hover:bg-white/2"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={deposit.user} />

                      <div>
                        <p className="text-sm font-medium text-white">
                          {deposit.user}
                        </p>

                        <p className="text-xs text-zinc-600">{deposit.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-500">{deposit.id}</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(deposit.amount)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-400">
                      {deposit.method}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <DepositStatusBadge status={deposit.status} />
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-600">
                      {deposit.date}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-white/[0.05] lg:hidden">
          {filteredDeposits.map((deposit) => (
            <div key={deposit.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ArrowDownToLine size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {deposit.user}
                  </p>

                  <p className="text-xs text-zinc-600">{deposit.id}</p>
                </div>

                <DepositStatusBadge status={deposit.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoBox
                  label="Amount"
                  value={formatCurrency(deposit.amount)}
                />

                <InfoBox label="Method" value={deposit.method} />

                <InfoBox label="Date" value={deposit.date} />

                <button className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.05] bg-black/10 text-xs text-zinc-400 hover:text-white">
                  <Eye size={14} />
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>

        <Footer count={filteredDeposits.length} total={deposits.length} />
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function DepositStatusBadge({ status }: { status: DepositStatus }) {
  if (status === "Completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
        <CheckCircle2 size={11} />
        Completed
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
        <Clock3 size={11} />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400">
      <XCircle size={11} />
      Failed
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-xs font-bold text-[#f0b90b]">
      {initials}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-medium text-white">{value}</p>
    </div>
  );
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
      {children}
    </th>
  );
}

function Footer({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-4 sm:px-5">
      <p className="text-xs text-zinc-600">
        Showing <span className="text-zinc-400">{count}</span> of{" "}
        <span className="text-zinc-400">{total}</span> deposits
      </p>

      <div className="flex items-center gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-600 hover:text-white">
          <ChevronLeft size={15} />
        </button>

        <button className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#f0b90b]/10 px-2 text-xs text-[#f0b90b]">
          1
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-600 hover:text-white">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
