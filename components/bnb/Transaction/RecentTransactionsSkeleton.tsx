export default function RecentTransactionsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/1.5 p-3"
        >
          <div className="h-9 w-9 animate-pulse rounded-full bg-white/5" />
          <div className="min-w-0 flex-1">
            <div className="h-3.5 w-32 animate-pulse rounded bg-white/5" />
            <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-white/5" />
          </div>
          <div className="h-3.5 w-16 animate-pulse rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}
