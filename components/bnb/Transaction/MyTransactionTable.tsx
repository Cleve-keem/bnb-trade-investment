import { TransactionEntry } from "@/types/transaction";
import Link from "next/link";
import {
  TransactionStatusBadge,
  TransactionTypeBadge,
} from "./TransactionTypeBadge";
import { formatTransactionDate } from "@/libs/formatter/money";
import TransactionAmount from "./TransactionAmount";

export default function MyTransactionsTable({
  transactions,
}: {
  transactions: TransactionEntry[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175">
        <thead className="border-b border-white/5 text-left text-xs text-zinc-600">
          <tr>
            <th className="px-5 py-4">Transaction</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={`${t.source}-${t.entry_id}`}
              className="border-b border-white/4 last:border-0"
            >
              <td className="px-5 py-5">
                <Link
                  href={`/transactions/${t.entry_id}`}
                  className="group block"
                >
                  <p className="text-sm font-medium transition group-hover:text-[#f0b90b]">
                    {t.description}
                  </p>
                  <p className="mt-1 text-[10px] text-zinc-600">
                    {t.reference}
                  </p>
                </Link>
              </td>
              <td className="px-5 py-5">
                <TransactionTypeBadge type={t.entry_type} />
              </td>
              <td className="px-5 py-5">
                <TransactionAmount amount={t.amount} status={t.status} />
              </td>
              <td className="px-5 py-5">
                <TransactionStatusBadge status={t.status} />
              </td>
              <td className="px-5 py-5 text-xs text-zinc-500">
                {formatTransactionDate(t.occurred_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
