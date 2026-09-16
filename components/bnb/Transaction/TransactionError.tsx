import { AlertCircle, RefreshCw } from "lucide-react";

type TransactionErrorProps = {
  message?: string;
  onRetry: () => void;
};

export default function TransactionError({
  message,
  onRetry,
}: TransactionErrorProps) {
  return (
    <tr>
      <td colSpan={4} className="px-5 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle size={20} className="text-red-400" />
          </div>

          <h3 className="mt-4 text-sm font-medium">
            Unable to load transactions
          </h3>

          <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
            {message || "Something went wrong while loading your transactions."}
          </p>

          <button
            type="button"
            onClick={() => onRetry()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10"
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      </td>
    </tr>
  );
}
