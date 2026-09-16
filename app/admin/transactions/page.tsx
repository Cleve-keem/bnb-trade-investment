"use client";

import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Wallet,
  RotateCcw,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import { useMemo, useState } from "react";

type TransactionType =
  | "Deposit"
  | "Withdrawal"
  | "Investment"
  | "Return"
  | "Adjustment";

type TransactionStatus = "Completed" | "Pending" | "Failed";

type Transaction = {
  id: string;
  user: string;
  email: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  date: string;
};

const transactions: Transaction[] = [
  {
    id: "TXN-82947",
    user: "Elisa Eve",
    email: "elisa@example.com",
    type: "Deposit",
    description: "Wallet deposit",
    amount: 10000,
    status: "Completed",
    date: "Sep 3, 2026 • 10:42 AM",
  },
  {
    id: "TXN-82946",
    user: "John Smith",
    email: "john@example.com",
    type: "Investment",
    description: "Growth plan investment",
    amount: 5000,
    status: "Completed",
    date: "Sep 3, 2026 • 10:21 AM",
  },
  {
    id: "TXN-82945",
    user: "David James",
    email: "david@example.com",
    type: "Withdrawal",
    description: "BTC withdrawal",
    amount: 2500,
    status: "Pending",
    date: "Sep 3, 2026 • 09:58 AM",
  },
  {
    id: "TXN-82944",
    user: "Sarah Adams",
    email: "sarah@example.com",
    type: "Return",
    description: "Investment return",
    amount: 840,
    status: "Completed",
    date: "Sep 3, 2026 • 09:35 AM",
  },
  {
    id: "TXN-82943",
    user: "Michael Brown",
    email: "michael@example.com",
    type: "Adjustment",
    description: "Admin wallet adjustment",
    amount: 1000,
    status: "Completed",
    date: "Sep 3, 2026 • 08:50 AM",
  },
  {
    id: "TXN-82942",
    user: "Daniel Williams",
    email: "daniel@example.com",
    type: "Deposit",
    description: "Wallet deposit",
    amount: 8500,
    status: "Completed",
    date: "Sep 2, 2026 • 06:41 PM",
  },
  {
    id: "TXN-82941",
    user: "Grace Johnson",
    email: "grace@example.com",
    type: "Withdrawal",
    description: "BTC withdrawal",
    amount: 800,
    status: "Failed",
    date: "Sep 2, 2026 • 05:20 PM",
  },
];

const filters = [
  "All",
  "Deposit",
  "Withdrawal",
  "Investment",
  "Return",
  "Adjustment",
] as const;

type Filter = (typeof filters)[number];

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const query = search.toLowerCase();

      const matchesSearch =
        transaction.user.toLowerCase().includes(query) ||
        transaction.email.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query);

      const matchesFilter = filter === "All" || transaction.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const completedVolume = transactions.reduce(
    (sum, transaction) =>
      transaction.status === "Completed" ? sum + transaction.amount : sum,
    0,
  );

  const pendingCount = transactions.filter(
    (transaction) => transaction.status === "Pending",
  ).length;

  const failedCount = transactions.filter(
    (transaction) => transaction.status === "Failed",
  ).length;

  return (
    <main className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
          Finance
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Transactions
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          View and monitor every financial activity across the platform.
        </p>
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Transaction Volume"
          value={formatCurrency(completedVolume)}
          icon={Wallet}
        />

        <SummaryCard
          title="Transactions"
          value={transactions.length.toString()}
          icon={ArrowUpRight}
        />

        <SummaryCard
          title="Pending"
          value={pendingCount.toString()}
          icon={Clock3}
        />

        <SummaryCard
          title="Failed"
          value={failedCount.toString()}
          icon={XCircle}
        />
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-2xl border border-white/6 bg-white/2.5">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/6 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
              />
            </div>

            <button className="flex w-fit items-center gap-2 rounded-xl border border-white/7 px-4 py-2.5 text-xs text-zinc-400 transition hover:bg-white/4 hover:text-white">
              <SlidersHorizontal size={14} />
              More filters
            </button>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {filters.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
                  filter === item
                    ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                    : "text-zinc-500 hover:bg-white/4 hover:text-white"
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
                <Head>Transaction</Head>
                <Head>User</Head>
                <Head>Type</Head>
                <Head>Amount</Head>
                <Head>Status</Head>
                <Head>Date</Head>
                <th className="w-12 px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-white/4 transition hover:bg-white/2"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <TransactionIcon type={transaction.type} />

                      <div>
                        <p className="text-sm font-medium text-white">
                          {transaction.description}
                        </p>

                        <p className="text-xs text-zinc-600">
                          {transaction.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm text-zinc-300">
                        {transaction.user}
                      </p>

                      <p className="text-xs text-zinc-600">
                        {transaction.email}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <TypeBadge type={transaction.type} />
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={transaction.status} />
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-xs text-zinc-600">{transaction.date}</p>
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
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="p-4">
              <div className="flex items-start gap-3">
                <TransactionIcon type={transaction.type} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {transaction.description}
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    {transaction.id}
                  </p>

                  <p className="mt-2 text-xs text-zinc-500">
                    {transaction.user}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(transaction.amount)}
                  </p>

                  <div className="mt-1">
                    <StatusBadge status={transaction.status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                <TypeBadge type={transaction.type} />

                <p className="text-[10px] text-zinc-600">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty */}
        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
              <Wallet size={22} />
            </div>

            <h3 className="mt-4 text-sm font-medium text-white">
              No transactions found
            </h3>

            <p className="mt-1 text-xs text-zinc-600">
              Try changing your search or transaction filter.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-4 sm:px-5">
          <p className="text-xs text-zinc-600">
            Showing{" "}
            <span className="text-zinc-400">{filteredTransactions.length}</span>{" "}
            of <span className="text-zinc-400">{transactions.length}</span>{" "}
            transactions
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

function TransactionIcon({ type }: { type: TransactionType }) {
  const base = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl";

  if (type === "Deposit") {
    return (
      <div className={`${base} bg-emerald-500/10 text-emerald-400`}>
        <ArrowDownToLine size={17} />
      </div>
    );
  }

  if (type === "Withdrawal") {
    return (
      <div className={`${base} bg-red-500/10 text-red-400`}>
        <ArrowUpFromLine size={17} />
      </div>
    );
  }

  if (type === "Investment") {
    return (
      <div className={`${base} bg-blue-500/10 text-blue-400`}>
        <TrendingUp size={17} />
      </div>
    );
  }

  if (type === "Return") {
    return (
      <div className={`${base} bg-[#f0b90b]/10 text-[#f0b90b]`}>
        <RotateCcw size={17} />
      </div>
    );
  }

  return (
    <div className={`${base} bg-purple-500/10 text-purple-400`}>
      <Wallet size={17} />
    </div>
  );
}

function TypeBadge({ type }: { type: TransactionType }) {
  return (
    <span className="inline-flex rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium text-zinc-400">
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
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

function Head({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
      {children}
    </th>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
