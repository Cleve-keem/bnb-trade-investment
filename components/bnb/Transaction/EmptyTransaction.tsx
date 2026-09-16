import { ArrowLeftRight, SearchX } from "lucide-react";

type EmptyTransactionsProps = {
  filter: string;
};

export default function EmptyTransactions({ filter }: EmptyTransactionsProps) {
  const isFiltered = filter !== "All";

  return (
    <tr>
      <td colSpan={4} className="px-5 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/4">
            {isFiltered ? (
              <SearchX size={20} className="text-zinc-500" />
            ) : (
              <ArrowLeftRight size={20} className="text-zinc-500" />
            )}
          </div>

          <h3 className="mt-4 text-sm font-medium text-white">
            {isFiltered
              ? `No ${filter.toLowerCase()} transactions`
              : "No transactions yet"}
          </h3>

          <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
            {isFiltered
              ? `You don't have any ${filter.toLowerCase()} transactions yet.`
              : "Your wallet activity will appear here once you make your first transaction."}
          </p>
        </div>
      </td>
    </tr>
  );
}
