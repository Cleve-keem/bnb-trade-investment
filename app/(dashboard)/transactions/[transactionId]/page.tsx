"use client";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Hash,
  Wallet,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import { formatLongDate } from "@/libs/formatter/date";
import TransactionDetailsSkeleton from "../_components/TransactionDetailsSkeleton";
import DetailItem from "../_components/DetailItem";
import BalanceItem from "../_components/BalanceItem";
import {
  getTransactionCategory,
  getTransactionDirection,
} from "@/libs/formatter/transaction";
import { useTransaction } from "@/hooks/transaction";

export default function TransactionDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const transactionId = params.transactionId as string;
  const {
    data: transaction,
    isPending,
    isError,
    error,
  } = useTransaction(transactionId);

  if (isPending) {
    return (
      <DashboardShell>
        <TransactionDetailsSkeleton />
      </DashboardShell>
    );
  }

  if (isError || !transaction) {
    return (
      <DashboardShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <FileText className="text-red-400" size={20} />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Transaction not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {error?.message ||
                "We couldn't find the transaction you're looking for."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/transactions")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#f0b90b]/90"
            >
              <ArrowLeft size={15} />
              Back to transactions
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const amount = Number(transaction.amount);
  const isCredit = amount >= 0;

  const category = getTransactionCategory(transaction.transaction_type);
  const direction = getTransactionDirection(amount);
  const date = new Date(transaction.created_at);

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => router.push("/transactions")}
            className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to transactions
          </button>

          <h1 className="text-2xl font-semibold tracking-tight">
            Transaction details
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Review the complete information for this transaction.
          </p>
        </div>

        {/* Transaction summary */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d131a]">
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            {/* Icon */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                isCredit ? "bg-emerald-500/10" : "bg-white/[0.05]"
              }`}
            >
              {isCredit ? (
                <ArrowDownLeft size={24} className="text-emerald-400" />
              ) : (
                <ArrowUpRight size={24} className="text-zinc-300" />
              )}
            </div>

            {/* Category */}
            <p className="mt-5 text-sm text-zinc-500">{category}</p>

            {/* Amount */}
            <h2
              className={`mt-2 text-4xl font-semibold tracking-tight ${
                isCredit ? "text-emerald-400" : "text-white"
              }`}
            >
              {isCredit ? "+" : "-"}
              {transaction.currency ?? "USD"}{" "}
              {Math.abs(amount).toLocaleString()}
            </h2>

            {/* Status */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={13} />
              Recorded
            </div>

            <p className="mt-4 text-xs text-zinc-600">{formatLongDate(date)}</p>
          </div>
        </section>

        {/* Transaction information */}
        <section className="rounded-2xl border border-white/[0.06] bg-[#0d131a]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold">Transaction information</h2>

            <p className="mt-1 text-xs text-zinc-600">
              Identifiers and transaction details
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/[0.05] md:grid-cols-2 md:divide-x md:divide-y-0">
            <DetailItem
              icon={<Hash size={15} />}
              label="Transaction ID"
              value={transaction.id}
              copyable
            />

            <DetailItem
              icon={<FileText size={15} />}
              label="Reference"
              value={transaction.reference || "—"}
              copyable={!!transaction.reference}
            />

            <DetailItem
              icon={<Wallet size={15} />}
              label="Transaction type"
              value={category}
            />

            <DetailItem
              icon={<ArrowDownLeft size={15} />}
              label="Direction"
              value={direction}
            />

            <DetailItem
              icon={<Wallet size={15} />}
              label="Currency"
              value={transaction.currency || "USD"}
            />

            <DetailItem
              icon={<CalendarDays size={15} />}
              label="Created"
              value={formatLongDate(date)}
            />
          </div>
        </section>

        {/* Balance movement */}
        <section className="rounded-2xl border border-white/[0.06] bg-[#0d131a]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold">Balance activity</h2>

            <p className="mt-1 text-xs text-zinc-600">
              How this transaction affected your wallet balance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-white/[0.04] sm:grid-cols-3">
            <BalanceItem
              label="Balance before"
              value={transaction.balance_before}
              currency={transaction.currency}
            />

            <BalanceItem
              label="Transaction"
              value={amount}
              currency={transaction.currency}
              highlight
            />

            <BalanceItem
              label="Balance after"
              value={transaction.balance_after}
              currency={transaction.currency}
            />
          </div>
        </section>

        {/* Description */}
        {transaction.description && (
          <section className="rounded-2xl border border-white/[0.06] bg-[#0d131a]">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-sm font-semibold">Description</h2>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-7 text-zinc-400">
                {transaction.description}
              </p>
            </div>
          </section>
        )}

        {/* Investment relation */}
        {transaction.investment_id && (
          <section className="rounded-2xl border border-white/[0.06] bg-[#0d131a]">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <h2 className="text-sm font-semibold">Related investment</h2>
            </div>

            <div className="px-5 py-5">
              <p className="text-xs text-zinc-500">Investment ID</p>

              <p className="mt-2 break-all font-mono text-sm text-zinc-300">
                {transaction.investment_id}
              </p>
            </div>
          </section>
        )}

        {/* Metadata */}
        {transaction.metadata &&
          Object.keys(transaction.metadata).length > 0 && (
            <section className="rounded-2xl border border-white/[0.06] bg-[#0d131a]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Additional information
                </h2>
              </div>

              <pre className="overflow-x-auto px-5 py-5 text-xs leading-6 text-zinc-500">
                {JSON.stringify(transaction.metadata, null, 2)}
              </pre>
            </section>
          )}
      </div>
    </DashboardShell>
  );
}
