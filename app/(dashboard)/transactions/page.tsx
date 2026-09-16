"use client";

import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import EmptyTransactions from "@/components/bnb/Transaction/EmptyTransaction";
import TransactionError from "@/components/bnb/Transaction/TransactionError";
import TransactionTableSkeleton from "@/components/bnb/Transaction/TransactionTableSkeleton";
import { useWalletTransactions } from "@/hooks/transaction";
import { formatLongDate } from "@/libs/formatter/date";
import { useState } from "react";

const filters = ["All", "Deposit", "Withdrawal", "Investment"];

export default function TransactionsPage() {
  const [filter, setFilter] = useState("All");
  const { wallet_transactions, isPending, isError, error, refetch } =
    useWalletTransactions();

  console.log(wallet_transactions);

  const filtered =
    filter === "All"
      ? wallet_transactions
      : wallet_transactions?.filter((item: any) => item.type === filter);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Transactions</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Review your account activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-xl px-4 py-2 text-xs font-medium ${
                filter === item
                  ? "bg-[#f0b90b] text-black"
                  : "border border-white/6 bg-white/2.5 text-zinc-500"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
              <thead className="border-b border-white/5 text-left text-xs text-zinc-600">
                <tr>
                  <th className="px-5 py-4">Transaction</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Amount</th>
                  {/* <th className="px-5 py-4">Status</th> */}
                  <th className="px-5 py-4">Date</th>
                </tr>
              </thead>

              <tbody>
                {isPending ? (
                  <TransactionTableSkeleton />
                ) : isError ? (
                  <TransactionError
                    message={error?.message}
                    onRetry={refetch}
                  />
                ) : filtered?.length === 0 ? (
                  <EmptyTransactions filter={filter} />
                ) : (
                  filtered?.map((transaction) => {
                    const date = new Date(transaction.created_at);
                    const type = transaction?.transaction_type.includes(
                      "credit",
                    )
                      ? "Credit"
                      : "Debit";
                    return (
                      <tr
                        key={transaction.id}
                        className="border-b border-white/4 last:border-0"
                      >
                        <td className="px-5 py-5">
                          <p className="text-sm font-medium">
                            {transaction.description}
                          </p>
                          <p className="mt-1 text-[10px] text-zinc-600">
                            {transaction.id}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm text-zinc-400">
                          {type}
                        </td>

                        <td
                          className={`px-5 py-5 text-sm font-medium ${
                            transaction.amount > 0
                              ? "text-emerald-400"
                              : "text-white"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : "-"}$
                          {Math.abs(transaction.amount).toLocaleString()}
                        </td>

                        {/* <td className="px-5 py-5">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${
                          transaction.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : transaction.status === "Pending"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td> */}

                        <td className="px-5 py-5 text-xs text-zinc-500">
                          {formatLongDate(date)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
