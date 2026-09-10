"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Smartphone,
  TrendingUp,
  User,
  UserCheck,
  UserX,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminUserDetails,
  useAdminWalletAdjustmentMutation,
} from "@/hooks/admin";

type Tab =
  | "overview"
  | "wallet"
  | "investments"
  | "withdrawals"
  | "transactions"
  | "notifications"
  | "security"
  | "activity";

type AdjustmentMode = "credit" | "debit";

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    case "suspended":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";

    case "deleted":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    default:
      return "bg-white/5 text-gray-400 border-white/10";
  }
}

function getTransactionClass(type?: string | null) {
  const normalized = type?.toLowerCase() ?? "";

  if (
    normalized.includes("credit") ||
    normalized.includes("deposit") ||
    normalized.includes("profit") ||
    normalized.includes("return") ||
    normalized.includes("reward")
  ) {
    return "text-emerald-400";
  }

  return "text-red-400";
}

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [adjustmentMode, setAdjustmentMode] =
    useState<AdjustmentMode>("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const userId = params.userId as string;
  const { data, isPending, isError, error, refetch } =
    useAdminUserDetails(userId);
  const walletAdjustmentMutation = useAdminWalletAdjustmentMutation(userId);

  const user = data?.user;
  const wallet = data?.wallet;
  const investments = data?.investments ?? [];
  const withdrawals = data?.withdrawals ?? [];
  const transactions = data?.transactions ?? [];
  const notifications = data?.notifications ?? [];
  const devices = data?.devices ?? [];
  const auditLogs = data?.auditLogs ?? [];

  const totalInvested = useMemo(() => {
    return investments.reduce(
      (total: number, investment: any) =>
        total + Number(investment.amount ?? 0),
      0,
    );
  }, [investments]);

  const totalReturns = useMemo(() => {
    return investments.reduce(
      (total: number, investment: any) =>
        total + Number(investment.total_return ?? 0),
      0,
    );
  }, [investments]);

  const pendingWithdrawals = useMemo(() => {
    return withdrawals.filter(
      (withdrawal: any) =>
        String(withdrawal.status).toLowerCase() === "pending",
    );
  }, [withdrawals]);

  const openWalletModal = (mode: AdjustmentMode) => {
    setAdjustmentMode(mode);
    setAmount("");
    setReason("");
    setNotes("");
    setShowWalletModal(true);
  };

  const closeWalletModal = () => {
    if (walletAdjustmentMutation.isPending) return;

    setShowWalletModal(false);
    setAmount("");
    setReason("");
    setNotes("");
  };

  const handleWalletAdjustment = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason.");
      return;
    }

    if (!wallet?.id) {
      toast.error("Wallet not found.");
      return;
    }

    await walletAdjustmentMutation.mutateAsync({
      walletId: wallet.id,
      amount: adjustmentMode === "credit" ? numericAmount : -numericAmount,
      adjustmentType: adjustmentMode === "credit" ? "credit" : "debit",
      reason: reason.trim(),
      notes: notes?.trim() || null,
    });

    closeWalletModal();
    await refetch();
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success("User ID copied.");
    } catch {
      toast.error("Unable to copy user ID.");
    }
  };

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

  if (isError || !user) {
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

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "wallet", label: "Wallet" },
    { id: "investments", label: "Investments" },
    { id: "withdrawals", label: "Withdrawals" },
    { id: "transactions", label: "Transactions" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div className="min-h-screen bg-[#080c11] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </button>

        {/* User Header */}
        <section className="rounded-2xl border border-white/10 bg-[#0b1016] p-5 sm:p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f0b90b]/10 text-xl font-bold text-[#f0b90b]">
                {getInitials(user.full_name)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-xl font-bold sm:text-2xl">
                    {user.full_name || "Unnamed User"}
                  </h1>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                      user.status,
                    )}`}
                  >
                    {user.status ?? "unknown"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>

                  {user.username && <span>@{user.username}</span>}

                  <button
                    type="button"
                    onClick={copyUserId}
                    className="flex items-center gap-1.5 transition hover:text-white"
                  >
                    <span className="max-w-[180px] truncate">{userId}</span>
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {formatDateOnly(user.created_at)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.info(
                    "User suspension will be connected to the suspension RPC.",
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-2.5 text-sm text-orange-400 transition hover:bg-orange-500/10"
              >
                <UserX className="h-4 w-4" />
                Suspend
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.info(
                    "Additional user actions will be connected to their RPCs.",
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Wallet}
            label="Wallet Balance"
            value={formatMoney(wallet?.balance)}
            description={
              wallet?.locked_balance
                ? `${formatMoney(wallet.locked_balance)} locked`
                : "No locked funds"
            }
          />

          <StatCard
            icon={TrendingUp}
            label="Total Invested"
            value={formatMoney(totalInvested)}
            description={`${investments.length} investment${
              investments.length === 1 ? "" : "s"
            }`}
          />

          <StatCard
            icon={DollarSign}
            label="Expected Returns"
            value={formatMoney(totalReturns)}
            description="Principal + expected profit"
          />

          <StatCard
            icon={Clock3}
            label="Pending Withdrawals"
            value={pendingWithdrawals.length.toString()}
            description={
              pendingWithdrawals.length
                ? "Requires admin review"
                : "Nothing pending"
            }
          />
        </section>

        {/* Tabs */}
        <div className="mt-6 overflow-x-auto border-b border-white/10">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-[#f0b90b] text-[#f0b90b]"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <OverviewTab
              user={user}
              wallet={wallet}
              investments={investments}
              withdrawals={withdrawals}
              transactions={transactions}
              onCredit={() => openWalletModal("credit")}
              onDebit={() => openWalletModal("debit")}
            />
          )}

          {activeTab === "wallet" && (
            <WalletTab
              wallet={wallet}
              transactions={transactions}
              onCredit={() => openWalletModal("credit")}
              onDebit={() => openWalletModal("debit")}
            />
          )}

          {activeTab === "investments" && (
            <InvestmentsTab investments={investments} />
          )}

          {activeTab === "withdrawals" && (
            <WithdrawalsTab withdrawals={withdrawals} />
          )}

          {activeTab === "transactions" && (
            <TransactionsTab transactions={transactions} />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab notifications={notifications} />
          )}

          {activeTab === "security" && (
            <SecurityTab user={user} devices={devices} />
          )}

          {activeTab === "activity" && <ActivityTab auditLogs={auditLogs} />}
        </div>
      </div>

      {/* Wallet Adjustment Modal */}
      {showWalletModal && (
        <WalletAdjustmentModal
          mode={adjustmentMode}
          amount={amount}
          reason={reason}
          notes={notes}
          isPending={walletAdjustmentMutation.isPending}
          onAmountChange={setAmount}
          onReasonChange={setReason}
          onNotesChange={setNotes}
          onClose={closeWalletModal}
          onSubmit={handleWalletAdjustment}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1016] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b]/10">
          <Icon className="h-5 w-5 text-[#f0b90b]" />
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-white">{value}</p>

      <p className="mt-1 text-xs text-gray-600">{description}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* OVERVIEW                                                                   */
/* -------------------------------------------------------------------------- */

function OverviewTab({
  user,
  wallet,
  investments,
  withdrawals,
  transactions,
  onCredit,
  onDebit,
}: {
  user: any;
  wallet: any;
  investments: any[];
  withdrawals: any[];
  transactions: any[];
  onCredit: () => void;
  onDebit: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        {/* Account */}
        <Panel title="Account Information" icon={User}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem label="Full Name" value={user.full_name} />
            <InfoItem label="Username" value={user.username} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Role" value={user.role} />
            <InfoItem label="Status" value={user.status} />
            <InfoItem label="Created" value={formatDate(user.created_at)} />
          </div>
        </Panel>

        {/* Recent Investments */}
        <Panel
          title="Recent Investments"
          icon={TrendingUp}
          action={
            <span className="text-xs text-gray-600">
              {investments.length} total
            </span>
          }
        >
          {investments.length === 0 ? (
            <EmptyState text="No investments found." />
          ) : (
            <div className="space-y-3">
              {investments.slice(0, 5).map((investment: any) => (
                <div
                  key={investment.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {investment.plan_name}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {formatDate(investment.started_at)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="font-semibold text-white">
                      {formatMoney(investment.amount)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-400">
                      {investment.roi_percentage}% ROI
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Recent Withdrawals */}
        <Panel
          title="Recent Withdrawals"
          icon={ArrowUpRight}
          action={
            <span className="text-xs text-gray-600">
              {withdrawals.length} total
            </span>
          }
        >
          {withdrawals.length === 0 ? (
            <EmptyState text="No withdrawals found." />
          ) : (
            <div className="space-y-3">
              {withdrawals.slice(0, 5).map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div>
                    <p className="font-medium text-white">
                      {formatMoney(withdrawal.amount)}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      {formatDate(
                        withdrawal.created_at || withdrawal.requested_at,
                      )}
                    </p>
                  </div>

                  <StatusBadge status={withdrawal.status} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <Panel title="Wallet Management" icon={Wallet}>
          <div className="rounded-xl border border-[#f0b90b]/10 bg-[#f0b90b]/5 p-5">
            <p className="text-sm text-gray-500">Available Balance</p>

            <p className="mt-2 text-3xl font-bold text-white">
              {formatMoney(wallet?.balance)}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-600">Locked balance</span>

              <span className="text-gray-400">
                {formatMoney(wallet?.locked_balance)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onCredit}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <ArrowDownLeft className="h-4 w-4" />
              Credit
            </button>

            <button
              type="button"
              onClick={onDebit}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <ArrowUpRight className="h-4 w-4" />
              Debit
            </button>
          </div>
        </Panel>

        <Panel title="Quick Summary" icon={FileText}>
          <div className="space-y-4">
            <SummaryRow
              label="Investments"
              value={investments.length.toString()}
            />

            <SummaryRow
              label="Withdrawals"
              value={withdrawals.length.toString()}
            />

            <SummaryRow
              label="Transactions"
              value={transactions.length.toString()}
            />

            <SummaryRow label="Wallet status" value={wallet?.status ?? "—"} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* WALLET                                                                     */
/* -------------------------------------------------------------------------- */

function WalletTab({
  wallet,
  transactions,
  onCredit,
  onDebit,
}: {
  wallet: any;
  transactions: any[];
  onCredit: () => void;
  onDebit: () => void;
}) {
  return (
    <div className="space-y-6">
      <Panel title="Wallet Overview" icon={Wallet}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <BalanceBox
            label="Current Balance"
            value={formatMoney(wallet?.balance)}
          />

          <BalanceBox
            label="Locked Balance"
            value={formatMoney(wallet?.locked_balance)}
          />

          <BalanceBox
            label="Spendable Balance"
            value={formatMoney(
              Number(wallet?.balance ?? 0) -
                Number(wallet?.locked_balance ?? 0),
            )}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCredit}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Credit Wallet
          </button>

          <button
            type="button"
            onClick={onDebit}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <ArrowUpRight className="h-4 w-4" />
            Debit Wallet
          </button>
        </div>
      </Panel>

      <Panel title="Wallet Ledger" icon={CreditCard}>
        <TransactionsTable transactions={transactions} />
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INVESTMENTS                                                                */
/* -------------------------------------------------------------------------- */

function InvestmentsTab({ investments }: { investments: any[] }) {
  return (
    <Panel title="Investment History" icon={TrendingUp}>
      {investments.length === 0 ? (
        <EmptyState text="This user has no investments." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-600">
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">ROI</th>
                <th className="px-4 py-3">Profit</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Matures</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {investments.map((investment: any) => (
                <tr
                  key={investment.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-4 font-medium text-white">
                    {investment.plan_name}
                  </td>

                  <td className="px-4 py-4 text-gray-300">
                    {formatMoney(investment.amount)}
                  </td>

                  <td className="px-4 py-4 text-emerald-400">
                    {investment.roi_percentage}%
                  </td>

                  <td className="px-4 py-4 text-gray-300">
                    {formatMoney(investment.expected_profit)}
                  </td>

                  <td className="px-4 py-4 text-gray-500">
                    {formatDateOnly(investment.started_at)}
                  </td>

                  <td className="px-4 py-4 text-gray-500">
                    {formatDateOnly(investment.matures_at)}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={investment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* WITHDRAWALS                                                                */
/* -------------------------------------------------------------------------- */

function WithdrawalsTab({ withdrawals }: { withdrawals: any[] }) {
  return (
    <Panel title="Withdrawal Requests" icon={ArrowUpRight}>
      {withdrawals.length === 0 ? (
        <EmptyState text="This user has no withdrawal requests." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-600">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Processed</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {withdrawals.map((withdrawal: any) => (
                <tr
                  key={withdrawal.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-4 font-mono text-xs text-gray-400">
                    {withdrawal.reference ?? withdrawal.id}
                  </td>

                  <td className="px-4 py-4 font-medium text-white">
                    {formatMoney(withdrawal.amount)}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={withdrawal.status} />
                  </td>

                  <td className="px-4 py-4 text-gray-500">
                    {formatDate(
                      withdrawal.created_at || withdrawal.requested_at,
                    )}
                  </td>

                  <td className="px-4 py-4 text-gray-500">
                    {formatDate(
                      withdrawal.processed_at || withdrawal.updated_at,
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {String(withdrawal.status).toLowerCase() === "pending" ? (
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            "Withdrawal approval/rejection will be connected to the withdrawal RPC.",
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#f0b90b] hover:underline"
                      >
                        Review
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-700">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* TRANSACTIONS                                                               */
/* -------------------------------------------------------------------------- */

function TransactionsTab({ transactions }: { transactions: any[] }) {
  return (
    <Panel title="Wallet Transactions" icon={CreditCard}>
      <TransactionsTable transactions={transactions} />
    </Panel>
  );
}

function TransactionsTable({ transactions }: { transactions: any[] }) {
  if (transactions.length === 0) {
    return <EmptyState text="No wallet transactions found." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left">
        <thead>
          <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-gray-600">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Balance After</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((transaction: any) => (
            <tr
              key={transaction.id}
              className="border-b border-white/5 last:border-0"
            >
              <td className="px-4 py-4 text-gray-300">
                {transaction.transaction_type ?? "—"}
              </td>

              <td className="px-4 py-4 text-gray-500">
                {transaction.description ?? "—"}
              </td>

              <td
                className={`px-4 py-4 font-medium ${getTransactionClass(
                  transaction.transaction_type,
                )}`}
              >
                {Number(transaction.amount) >= 0 ? "+" : ""}
                {formatMoney(transaction.amount)}
              </td>

              <td className="px-4 py-4 text-gray-300">
                {formatMoney(transaction.balance_after)}
              </td>

              <td className="px-4 py-4 font-mono text-xs text-gray-600">
                {transaction.reference ?? "—"}
              </td>

              <td className="px-4 py-4 text-gray-500">
                {formatDate(transaction.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* NOTIFICATIONS                                                              */
/* -------------------------------------------------------------------------- */

function NotificationsTab({ notifications }: { notifications: any[] }) {
  return (
    <Panel title="User Notifications" icon={Bell}>
      {notifications.length === 0 ? (
        <EmptyState text="No notifications found." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-white">{notification.title}</p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {notification.body}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-gray-600">
                  {formatDate(notification.created_at)}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="rounded-full border border-white/10 px-2 py-1 text-gray-500">
                  {notification.notification_type}
                </span>

                {notification.is_read !== undefined && (
                  <span
                    className={
                      notification.is_read ? "text-gray-600" : "text-[#f0b90b]"
                    }
                  >
                    {notification.is_read ? "Read" : "Unread"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* SECURITY                                                                   */
/* -------------------------------------------------------------------------- */

function SecurityTab({ user, devices }: { user: any; devices: any[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Panel title="Account Security" icon={Shield}>
        <div className="space-y-4">
          <SecurityRow
            icon={Mail}
            label="Email"
            value={user.email}
            status="Verified"
          />

          <SecurityRow
            icon={Shield}
            label="Account status"
            value={user.status ?? "Unknown"}
            status={user.status === "active" ? "Active" : "Restricted"}
          />

          <SecurityRow
            icon={UserCheck}
            label="Role"
            value={user.role ?? "user"}
            status="Configured"
          />
        </div>
      </Panel>

      <Panel title="Registered Devices" icon={Smartphone}>
        {devices.length === 0 ? (
          <EmptyState text="No registered devices found." />
        ) : (
          <div className="space-y-3">
            {devices.map((device: any) => (
              <div
                key={device.id}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">
                      {device.device_name ||
                        device.device_type ||
                        "Unknown device"}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {device.platform || device.os || "Unknown platform"}
                    </p>
                  </div>

                  {device.is_trusted && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Trusted
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-600">
                  Last seen:{" "}
                  {formatDate(device.last_seen_at || device.updated_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ACTIVITY                                                                   */
/* -------------------------------------------------------------------------- */

function ActivityTab({ auditLogs }: { auditLogs: any[] }) {
  return (
    <Panel title="Audit Activity" icon={FileText}>
      {auditLogs.length === 0 ? (
        <EmptyState text="No audit activity found." />
      ) : (
        <div className="space-y-3">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <FileText className="h-4 w-4 text-gray-500" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-white">{log.action}</p>

                  <span className="text-xs text-gray-600">
                    {formatDate(log.created_at)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {log.entity ?? "system"}
                  {log.entity_id ? ` • ${log.entity_id}` : ""}
                </p>

                {log.metadata && (
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-black/20 p-3 text-xs text-gray-600">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */
/* WALLET MODAL                                                               */
/* -------------------------------------------------------------------------- */

function WalletAdjustmentModal({
  mode,
  amount,
  reason,
  notes,
  isPending,
  onAmountChange,
  onReasonChange,
  onNotesChange,
  onClose,
  onSubmit,
}: {
  mode: AdjustmentMode;
  amount: string;
  reason: string;
  notes: string;
  isPending: boolean;
  onAmountChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isCredit = mode === "credit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b1016] shadow-2xl">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isCredit ? "Credit User Wallet" : "Debit User Wallet"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                This action will create a wallet ledger entry, admin adjustment,
                notification and audit record.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-gray-600 transition hover:text-white disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Amount
            </label>

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => onAmountChange(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-gray-700 focus:border-[#f0b90b]/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Reason
            </label>

            <input
              type="text"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder={
                isCredit ? "e.g. Promotional credit" : "e.g. Balance correction"
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-[#f0b90b]/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Notes <span className="text-gray-600">(optional)</span>
            </label>

            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              rows={4}
              placeholder="Additional internal notes..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-[#f0b90b]/50"
            />
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isCredit
                ? "border-emerald-500/10 bg-emerald-500/5"
                : "border-red-500/10 bg-red-500/5"
            }`}
          >
            <p className="text-xs leading-5 text-gray-500">
              {isCredit
                ? "The selected amount will be credited through the secure admin_adjust_wallet RPC."
                : "The selected amount will be debited through the secure admin_adjust_wallet RPC. The database will reject the transaction if the wallet does not have enough spendable balance."}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isCredit
                ? "bg-emerald-400 hover:bg-emerald-300"
                : "bg-red-400 hover:bg-red-300"
            }`}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

            {isCredit ? "Credit Wallet" : "Debit Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Wallet;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1016] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>

          <h2 className="font-semibold text-white">{title}</h2>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-700">{label}</p>

      <p className="mt-1.5 break-words text-sm text-gray-300">{value || "—"}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium capitalize text-gray-300">
        {value}
      </span>
    </div>
  );
}

function BalanceBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status?: string | null }) {
  const normalized = String(status ?? "").toLowerCase();

  let className = "border-white/10 bg-white/5 text-gray-400";

  if (
    normalized === "active" ||
    normalized === "completed" ||
    normalized === "approved"
  ) {
    className = "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  if (normalized === "pending") {
    className = "border-orange-500/20 bg-orange-500/10 text-orange-400";
  }

  if (
    normalized === "failed" ||
    normalized === "rejected" ||
    normalized === "cancelled"
  ) {
    className = "border-red-500/20 bg-red-500/10 text-red-400";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${className}`}
    >
      {status ?? "unknown"}
    </span>
  );
}

function SecurityRow({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="mt-1 truncate text-sm text-gray-300">{value}</p>
      </div>

      <span className="text-xs text-emerald-400">{status}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.01] px-5 py-10 text-center">
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
