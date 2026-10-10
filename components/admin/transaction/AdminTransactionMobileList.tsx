import TransactionAmount from "@/components/bnb/Transaction/TransactionAmount";
import { TransactionStatusBadge, TransactionTypeBadge, TransactionTypeIcon } from "@/components/bnb/Transaction/TransactionTypeBadge";
import { formatTransactionDate } from "@/libs/formatter/money";
import type { AdminTransactionEntry } from "@/types/transaction";


export default function AdminTransactionsMobileList({
  transactions,
}: {
  transactions: AdminTransactionEntry[];
}) {
  return (
    <div className="divide-y divide-white/5 lg:hidden">
      {transactions.map((t) => (
        <div key={`${t.source}-${t.entry_id}`} className="p-4">
          <div className="flex items-start gap-3">
            <TransactionTypeIcon type={t.entry_type} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {t.description}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">{t.reference}</p>
              <p className="mt-2 truncate text-xs text-zinc-500">
                {t.full_name ?? t.email}
              </p>
            </div>
            <div className="text-right">
              <TransactionAmount amount={t.amount} status={t.status} />
              <div className="mt-1">
                <TransactionStatusBadge status={t.status} />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <TransactionTypeBadge type={t.entry_type} />
            <p className="text-[10px] text-zinc-600">
              {formatTransactionDate(t.occurred_at, { withTime: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
