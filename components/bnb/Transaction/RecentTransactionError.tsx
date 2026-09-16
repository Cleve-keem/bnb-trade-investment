import { AlertCircle, RefreshCw } from "lucide-react";

export default function RecentTransactionsError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle size={18} className="text-red-400" />
      </div>

      <p className="mt-4 text-sm font-medium text-zinc-300">
        Unable to load transactions
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-600">
        {message || "Something went wrong while loading your transactions."}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
        >
          <RefreshCw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}
