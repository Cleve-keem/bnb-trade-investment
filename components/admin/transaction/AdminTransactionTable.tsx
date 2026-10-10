import TransactionAmount from "@/components/bnb/Transaction/TransactionAmount";
import {
  StatusBadge,
  TransactionTypeIcon,
  TypeBadge,
} from "@/components/bnb/Transaction/TransactionTypeBadge";
import { formatTransactionDate } from "@/libs/formatter/money";
import type { AdminTransactionEntry } from "@/types/transaction";

const HEADERS = ["Transaction", "User", "Type", "Amount", "Status", "Date"];

export default function AdminTransactionsTable({
  transactions,
}: {
  transactions: AdminTransactionEntry[];
}) {
  return (
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/6">
            {HEADERS.map((h) => (
              <th
                key={h}
                className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={`${t.source}-${t.entry_id}`}
              className="border-b border-white/4 transition hover:bg-white/2"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <TransactionTypeIcon type={t.entry_type} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t.description}
                    </p>
                    <p className="text-xs text-zinc-600">{t.reference}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm text-zinc-300">{t.full_name ?? "—"}</p>
                <p className="text-xs text-zinc-600">{t.email}</p>
              </td>
              <td className="px-5 py-4">
                <TypeBadge type={t.entry_type} />
              </td>
              <td className="px-5 py-4">
                <TransactionAmount amount={t.amount} status={t.status} />
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={t.status} />
              </td>
              <td className="px-5 py-4">
                <p className="text-xs text-zinc-600">
                  {formatTransactionDate(t.occurred_at, { withTime: true })}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
