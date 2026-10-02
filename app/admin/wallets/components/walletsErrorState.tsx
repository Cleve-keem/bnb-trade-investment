export default function WalletsErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-sm text-red-400">
        {message ?? "Couldn't load wallets."}
      </p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-white/6 px-4 py-2 text-xs font-medium text-white hover:bg-white/0.1"
      >
        Try again
      </button>
    </div>
  );
}
