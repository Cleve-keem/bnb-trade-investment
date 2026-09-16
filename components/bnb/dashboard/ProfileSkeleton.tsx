export default function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2 p-1.5 pr-3">
      <div className="h-8 w-8 animate-pulse rounded-lg bg-white/10" />
      <div className="hidden space-y-1.5 sm:block">
        <div className="h-2.5 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-2 w-14 animate-pulse rounded bg-white/5" />
      </div>
      <div className="hidden h-3 w-3 animate-pulse rounded bg-white/10 sm:block" />
    </div>
  );
}
