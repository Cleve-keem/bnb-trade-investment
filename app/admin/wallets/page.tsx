"use client";

import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Users,
  LockKeyhole,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useMemo, useState } from "react";

type WalletStatus = "Active" | "Frozen";

type WalletRecord = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  balance: number;
  available: number;
  invested: number;
  status: WalletStatus;
  updated: string;
};

const wallets: WalletRecord[] = [
  {
    id: "WAL-10001",
    userId: "USR-10001",
    fullName: "Elisa Eve",
    email: "elisa@example.com",
    balance: 300000,
    available: 250000,
    invested: 50000,
    status: "Active",
    updated: "2 min ago",
  },
  {
    id: "WAL-10002",
    userId: "USR-10002",
    fullName: "John Smith",
    email: "john@example.com",
    balance: 42500,
    available: 32500,
    invested: 10000,
    status: "Active",
    updated: "8 min ago",
  },
  {
    id: "WAL-10003",
    userId: "USR-10003",
    fullName: "David James",
    email: "david@example.com",
    balance: 8200,
    available: 8200,
    invested: 0,
    status: "Active",
    updated: "15 min ago",
  },
  {
    id: "WAL-10004",
    userId: "USR-10004",
    fullName: "Sarah Adams",
    email: "sarah@example.com",
    balance: 125000,
    available: 75000,
    invested: 50000,
    status: "Active",
    updated: "21 min ago",
  },
  {
    id: "WAL-10005",
    userId: "USR-10005",
    fullName: "Michael Brown",
    email: "michael@example.com",
    balance: 15000,
    available: 5000,
    invested: 10000,
    status: "Frozen",
    updated: "1 hour ago",
  },
  {
    id: "WAL-10006",
    userId: "USR-10006",
    fullName: "Daniel Williams",
    email: "daniel@example.com",
    balance: 68500,
    available: 48500,
    invested: 20000,
    status: "Active",
    updated: "2 hours ago",
  },
];

const filters = ["All", "Active", "Frozen"] as const;

export default function AdminWalletsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const filteredWallets = useMemo(() => {
    return wallets.filter((wallet) => {
      const matchesSearch =
        wallet.fullName.toLowerCase().includes(search.toLowerCase()) ||
        wallet.email.toLowerCase().includes(search.toLowerCase()) ||
        wallet.id.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "All" || wallet.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  const availableBalance = wallets.reduce(
    (sum, wallet) => sum + wallet.available,
    0,
  );

  const investedBalance = wallets.reduce(
    (sum, wallet) => sum + wallet.invested,
    0,
  );

  return (
    <main className="space-y-6">
      {/* Header */}
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

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Wallet Balance"
          value={formatCurrency(totalBalance)}
          icon={DollarSign}
        />

        <SummaryCard
          title="Available Balance"
          value={formatCurrency(availableBalance)}
          icon={Wallet}
        />

        <SummaryCard
          title="Invested Funds"
          value={formatCurrency(investedBalance)}
          icon={LockKeyhole}
        />

        <SummaryCard
          title="Wallet Holders"
          value={wallets.length.toLocaleString()}
          icon={Users}
        />
      </section>

      {/* Table */}
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
              placeholder="Search wallet, name or email..."
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <div className="mr-1 flex items-center gap-2 text-xs text-zinc-500">
              <SlidersHorizontal size={14} />
              <span className="hidden sm:block">Filter</span>
            </div>

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
              <tr className="border-b border-white/[0.06]">
                <TableHead>User</TableHead>
                <TableHead>Wallet ID</TableHead>
                <TableHead>Total Balance</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Invested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <th className="w-12 px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredWallets.map((wallet) => (
                <tr
                  key={wallet.id}
                  className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={wallet.fullName} />

                      <div>
                        <p className="text-sm font-medium text-white">
                          {wallet.fullName}
                        </p>

                        <p className="text-xs text-zinc-600">{wallet.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-500">{wallet.id}</span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(wallet.balance)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm text-emerald-400">
                      {formatCurrency(wallet.available)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm text-zinc-300">
                      {formatCurrency(wallet.invested)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <WalletStatusBadge status={wallet.status} />
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-xs text-zinc-600">
                      {wallet.updated}
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
          {filteredWallets.map((wallet) => (
            <div key={wallet.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={wallet.fullName} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {wallet.fullName}
                  </p>

                  <p className="truncate text-xs text-zinc-600">
                    {wallet.email}
                  </p>
                </div>

                <WalletStatusBadge status={wallet.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <InfoBox
                  label="Balance"
                  value={formatCurrency(wallet.balance)}
                />

                <InfoBox
                  label="Available"
                  value={formatCurrency(wallet.available)}
                  positive
                />

                <InfoBox
                  label="Invested"
                  value={formatCurrency(wallet.invested)}
                />

                <InfoBox label="Wallet ID" value={wallet.id} />
              </div>
            </div>
          ))}
        </div>

        <TableFooter count={filteredWallets.length} total={wallets.length} />
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

function WalletStatusBadge({ status }: { status: WalletStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
        status === "Active"
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Active" ? "bg-emerald-400" : "bg-red-400"
        }`}
      />

      {status}
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

function InfoBox({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-medium ${
          positive ? "text-emerald-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
      {children}
    </th>
  );
}

function TableFooter({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-xs text-zinc-600">
        Showing <span className="text-zinc-400">{count}</span> of{" "}
        <span className="text-zinc-400">{total}</span> wallets
      </p>

      <div className="flex items-center gap-1">
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-600 hover:bg-white/[0.04] hover:text-white">
          <ChevronLeft size={15} />
        </button>

        <button className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#f0b90b]/10 px-2 text-xs text-[#f0b90b]">
          1
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-600 hover:bg-white/[0.04] hover:text-white">
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
