import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { formatLongDate } from "@/libs/formatter/date";

type RecentTransactionType = {
  id: string;
  wallet_id: string;
  amount: number;
  currency: string;
  description: string;
  created_at: string;
};

type RecenttransactionsPropType = {
  recentTransaction: RecentTransactionType[];
};

export default function RecentTransactions({
  recentTransaction,
}: RecenttransactionsPropType) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Recent Transactions</p>
          <p className="mt-1 text-xs text-zinc-500">Latest account activity</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs text-[#f0b90b]"
        >
          View all
          <ChevronRight size={13} />
        </Link>
      </div>

      <div className="space-y-3">
        {recentTransaction?.map((transaction) => {
          const positive = transaction.amount > 0;
          const date = new Date(transaction.created_at);

          return (
            <div
              key={transaction.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/1.5 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/4">
                {positive ? (
                  <ArrowDownLeft size={16} className="text-emerald-400" />
                ) : (
                  <ArrowUpRight size={16} className="text-zinc-400" />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {transaction.description}
                </p>

                <p className="mt-1 text-[10px] text-zinc-600">
                  {formatLongDate(date)}
                </p>
              </div>

              <div className="ml-auto text-right">
                <p
                  className={`text-sm font-medium ${
                    positive ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {positive ? "+" : "-"}$
                  {Math.abs(transaction.amount).toLocaleString()}
                </p>

                {/* <span className="text-[10px] text-zinc-600">
                  {transaction.status}
                </span> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
