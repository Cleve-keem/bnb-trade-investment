"use client";

import { OtpStatus, UserStatus } from "@/types/admin";
import {
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  ShieldCheck,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminUsersList } from "@/hooks/admin";
import AddUserModal from "@/components/admin/users/AddUserModal";

const filters = ["all", "active", "deleted", "suspended"] as const;
type Filter = (typeof filters)[number];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { users, isPending, isError, error, refetch } = useAdminUsersList();

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch =
        (user.full_name ?? "").toLowerCase().includes(query) ||
        (user.email ?? "").toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);
      const matchesFilter = filter === "all" || user.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [users, search, filter]);
  const totalBalance = users.reduce(
    (total, user) => total + (user.wallet?.balance ?? 0),
    0,
  );

  const activeUsers = users.filter((user) => user.status === "active").length;
  const suspendedUsers = users.filter(
    (user) => user.status === "suspended",
  ).length;

  if (isPending) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin text-[#f0b90b]" />
          Loading investor profile...
        </div>
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1016] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">
            Unable to load user
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {error instanceof Error
              ? error.message
              : "The requested user could not be found."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#d9a600]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
            User Management
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Users
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Manage registered users and monitor their account status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddUserModal(true)}
          className="flex w-fit items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f5c52c]"
        >
          <Users size={17} />
          Add User
        </button>
      </div>
      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value={users.length.toLocaleString()}
          icon={Users}
        />
        <SummaryCard
          title="Active Users"
          value={activeUsers.toLocaleString()}
          icon={CheckCircle2}
        />
        <SummaryCard
          title="Suspended Users"
          value={suspendedUsers.toLocaleString()}
          icon={Clock3}
        />
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
        />
      </section>

      {/* Users table */}
      <section className="overflow-hidden rounded-2xl border border-white/6 bg-white/2.5">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-white/6 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email or ID..."
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/10 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#f0b90b]/40"
            />
          </div>

          {/* Filters */}
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
                    : "text-zinc-500 hover:bg-white/4 hover:text-white"
                }`}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  User
                </th>
                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Balance
                </th>
                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  OTP
                </th>
                <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Status
                </th>

                <th className="w-12 px-5 py-4" />
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/4 transition hover:bg-white/2"
                >
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.full_name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {user.full_name}
                        </p>

                        <p className="truncate text-xs text-zinc-600">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Balance */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white">
                      {formatCurrency(user.wallet?.balance)}
                    </p>
                  </td>

                  {/* OTP */}
                  <td className="px-5 py-4">
                    {/* <OtpBadge status={user.latest_otp?.code} /> */}
                    <OTPCode code={user.latest_otp?.otp_code} />
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={user.status} />
                  </td>

                  {/* Actions */}
                  <td className="relative px-5 py-4">
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === user.id ? null : user.id)
                      }
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {openMenu === user.id && (
                      <UserActionMenu userId={user.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="divide-y divide-white/5 lg:hidden">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 transition hover:bg-white/2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={user.full_name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {user.full_name}
                    </p>
                    <p className="truncate text-xs text-zinc-600">
                      {user.email}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-700">{user.id}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setOpenMenu(openMenu === user.id ? null : user.id)
                  }
                  className="rounded-lg p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-white"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Balance
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {formatCurrency(user.wallet?.balance)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    OTP
                  </p>

                  <div className="mt-1">
                    {/* <OtpBadge status={user.latest_otp?.is_used} /> */}
                    <OTPCode code={user.latest_otp?.otp_code} />
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Status
                  </p>

                  <div className="mt-1">
                    <StatusBadge status={user.status} />
                  </div>
                </div>
              </div>

              {openMenu === user.id && (
                <div className="mt-3">
                  <UserActionMenu userId={user.id} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
              <Users size={22} />
            </div>

            <h3 className="mt-4 text-sm font-medium text-white">
              No users found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-zinc-600">
              Try changing your search or filter to find the user you're looking
              for.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-white/6 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-zinc-600">
            Showing{" "}
            <span className="text-zinc-400">{filteredUsers.length}</span> of{" "}
            <span className="text-zinc-400">{users.length}</span> users
          </p>

          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/6 text-zinc-600 transition hover:bg-white/4 hover:text-white">
              <ChevronLeft size={15} />
            </button>
            <button className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#f0b90b]/10 px-2 text-xs font-medium text-[#f0b90b]">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/6 text-zinc-600 transition hover:bg-white/4 hover:text-white">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} />
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components */
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
        <p className="text-xs font-medium text-zinc-500">{title}</p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-xl font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
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

function OTPCode({ code }: { code: number }) {
  if (!code) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-1 text-[10px] font-medium text-zinc-500">
        No OTP
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
      <ShieldCheck size={11} />
      {code}
    </span>
  );
}

function OtpBadge({ status }: { status: OtpStatus }) {
  if (status === "used") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
        <ShieldCheck size={11} />
        Verified
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
        <Clock3 size={11} />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-1 text-[10px] font-medium text-zinc-500">
      Not Set
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }

  if (status === "suspended") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
        <Clock3 size={11} />
        Suspended
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400">
      <XCircle size={11} />
      Deleted
    </span>
  );
}

function UserActionMenu({ userId }: { userId: string }) {
  return (
    <div className="absolute right-5 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11161d] p-1.5 shadow-2xl">
      <Link
        href={`/admin/users/${userId}`}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-400 transition hover:bg-white/4 hover:text-white"
      >
        <Eye size={14} />
        View user
      </Link>

      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-400 transition hover:bg-white/4 hover:text-white">
        <Wallet size={14} />
        View wallet
      </button>

      <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-400 transition hover:bg-white/4 hover:text-white">
        <ShieldCheck size={14} />
        View security
      </button>
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
