import { ArrowLeftRight } from "lucide-react";

export default function RecentTransactionsEmpty() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/4">
        <ArrowLeftRight size={18} className="text-zinc-500" />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-300">
        No transactions yet
      </p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-600">
        Your recent account activity will appear here once you make a
        transaction.
      </p>
    </div>
  );
}
