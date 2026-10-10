"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Coins,
  FileText,
  Hash,
  Network,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { formatLongDate } from "@/libs/formatter/date";
import { formatMoney } from "@/libs/formatter/money";
import TransactionDetailsSkeleton from "../../../app/(dashboard)/transactions/_components/TransactionDetailsSkeleton";
import DetailItem from "../../../app/(dashboard)/transactions/_components/DetailItem";
import BalanceItem from "../../../app/(dashboard)/transactions/_components/BalanceItem";
import { TransactionDetail } from "@/types/transaction";
import { useTransactionDetail } from "@/hooks/transaction";
import { STATUS_META, TYPE_META } from "@/libs/formatter/transaction-meta";

function statusNote(d: TransactionDetail): string | null {
  if (d.source === "withdrawal" && d.status === "pending")
    return "This request is being reviewed. The amount is reserved from your available balance until it's processed.";
  if (d.source === "withdrawal" && d.status === "failed")
    return "This request was declined and no funds were taken from your balance.";
  if (d.source === "deposit" && d.status === "pending")
    return "We're waiting to confirm your payment. Your balance updates once it's confirmed.";
  if (d.source === "deposit" && d.status === "failed")
    return "We couldn't confirm this deposit, so nothing was added to your balance.";
  return null;
}

export default function TransactionDetailView({
  entryId,
}: {
  entryId: string;
}) {
  const {
    data: transaction,
    isPending,
    isError,
    error,
    refetch,
  } = useTransactionDetail(entryId);

  if (isPending) return <TransactionDetailsSkeleton />;

  if (isError) {
    return (
      <Message
        title="Couldn't load this transaction"
        body={error instanceof Error ? error.message : "Something went wrong."}
        onRetry={() => refetch()}
      />
    );
  }

  if (!transaction) {
    return (
      <Message
        title="Transaction not found"
        body="We couldn't find the transaction you're looking for. It may not belong to your account."
      />
    );
  }

  const { amount, currency } = transaction;
  const isCredit = amount >= 0;
  const isFailed = transaction.status === "failed";
  const typeLabel = TYPE_META[transaction.entry_type]?.label ?? "Transaction";
  const status = STATUS_META[transaction.status];
  const StatusIcon = status.icon;
  const date = new Date(transaction.occurred_at);
  const note = statusNote(transaction);

  const amountTone = isFailed
    ? "text-zinc-500 line-through"
    : isCredit
      ? "text-emerald-400"
      : "text-white";
  const showBalanceMovement =
    transaction.balance_before !== null && transaction.balance_after !== null;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/transactions"
          className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to transactions
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Transaction details
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Review the complete information for this transaction.
        </p>
      </div>

      {/* Summary */}
      <section className="overflow-hidden rounded-2xl border border-white/6 bg-[#0d131a]">
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              isCredit && !isFailed ? "bg-emerald-500/10" : "bg-white/5"
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft
                size={24}
                className={isFailed ? "text-zinc-500" : "text-emerald-400"}
              />
            ) : (
              <ArrowUpRight
                size={24}
                className={isFailed ? "text-zinc-500" : "text-zinc-300"}
              />
            )}
          </div>
          <p className="mt-5 text-sm text-zinc-500">{typeLabel}</p>
          <h2
            className={`mt-2 text-4xl font-semibold tracking-tight ${amountTone}`}
          >
            {isCredit ? "+" : "-"}
            {currency} {formatMoney(Math.abs(amount))}
          </h2>
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${status.tone}`}
          >
            <StatusIcon size={13} />
            {status.label}
          </div>
          {note && (
            <p className="mx-auto mt-4 max-w-md text-xs leading-5 text-zinc-500">
              {note}
            </p>
          )}
          <p className="mt-4 text-xs text-zinc-600">{formatLongDate(date)}</p>
        </div>
      </section>

      {/* Information */}
      <section className="rounded-2xl border border-white/6 bg-[#0d131a]">
        <div className="border-b border-white/6 px-5 py-4">
          <h2 className="text-sm font-semibold">Transaction information</h2>
          <p className="mt-1 text-xs text-zinc-600">
            Identifiers and transaction details
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-white/5 md:grid-cols-2 md:divide-x md:divide-y-0">
          <DetailItem
            icon={<Hash size={15} />}
            label="Transaction ID"
            value={transaction.entry_id}
            copyable
            mono
          />
          <DetailItem
            icon={<FileText size={15} />}
            label="Reference"
            value={transaction.reference || "—"}
            copyable={!!transaction.reference}
            mono
          />
          <DetailItem
            icon={<Wallet size={15} />}
            label="Transaction type"
            value={typeLabel}
          />
          <DetailItem
            icon={<ArrowDownLeft size={15} />}
            label="Direction"
            value={isCredit ? "Credit" : "Debit"}
          />
          <DetailItem
            icon={<Wallet size={15} />}
            label="Currency"
            value={currency}
          />
          <DetailItem
            icon={<CalendarDays size={15} />}
            label={transaction.source === "ledger" ? "Posted" : "Requested"}
            value={formatLongDate(date)}
          />
          {transaction.reviewed_at && (
            <DetailItem
              icon={<ShieldCheck size={15} />}
              label="Reviewed"
              value={formatLongDate(new Date(transaction.reviewed_at))}
            />
          )}
        </div>
      </section>

      {/* Destination (withdrawals) */}
      {transaction.destination_address && (
        <section className="rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="border-b border-white/6 px-5 py-4">
            <h2 className="text-sm font-semibold">Destination</h2>
            <p className="mt-1 text-xs text-zinc-600">
              Where this withdrawal is being sent
            </p>
          </div>
          <div className="grid grid-cols-1 divide-y divide-white/5 md:grid-cols-2 md:divide-x md:divide-y-0">
            {transaction.asset && (
              <DetailItem
                icon={<Coins size={15} />}
                label="Asset"
                value={transaction.asset}
              />
            )}
            {transaction.network && (
              <DetailItem
                icon={<Network size={15} />}
                label="Network"
                value={transaction.network}
              />
            )}
          </div>
          <div className="border-t border-white/5">
            <DetailItem
              icon={<Wallet size={15} />}
              label="Wallet address"
              value={transaction.destination_address}
              copyable
              mono
              wrap
            />
          </div>
        </section>
      )}

      {/* Rejection reason */}
      {isFailed && transaction.rejection_reason && (
        <section className="rounded-2xl border border-red-500/15 bg-red-500/5 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-400/70">
            Reason
          </p>
          <p className="mt-2 text-sm leading-6 text-red-200/80">
            {transaction.rejection_reason}
          </p>
        </section>
      )}

      {/* Balance movement: only exists once money has actually moved */}
      {showBalanceMovement && (
        <section className="rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="border-b border-white/6 px-5 py-4">
            <h2 className="text-sm font-semibold">Balance activity</h2>
            <p className="mt-1 text-xs text-zinc-600">
              How this transaction affected your wallet balance
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px bg-white/4 sm:grid-cols-3">
            <BalanceItem
              label="Balance before"
              value={transaction.balance_before!}
              currency={currency}
            />
            <BalanceItem
              label="Transaction"
              value={amount}
              currency={currency}
              highlight
            />
            <BalanceItem
              label="Balance after"
              value={transaction.balance_after!}
              currency={currency}
            />
          </div>
        </section>
      )}

      {transaction.description && (
        <section className="rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="border-b border-white/6 px-5 py-4">
            <h2 className="text-sm font-semibold">Description</h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm leading-7 text-zinc-400">
              {transaction.description}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function Message({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <FileText className="text-red-400" size={20} />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{body}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
            >
              Try again
            </button>
          )}
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#f0b90b]/90"
          >
            <ArrowLeft size={15} />
            Back to transactions
          </Link>
        </div>
      </div>
    </div>
  );
}
