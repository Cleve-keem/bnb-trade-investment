export default function TransactionDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="h-4 w-36 animate-pulse rounded bg-white/[0.05]" />

        <div className="mt-5 h-8 w-56 animate-pulse rounded bg-white/[0.05]" />

        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0d131a] px-6 py-12">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-white/[0.05]" />

        <div className="mx-auto mt-5 h-4 w-20 animate-pulse rounded bg-white/[0.05]" />

        <div className="mx-auto mt-3 h-10 w-48 animate-pulse rounded bg-white/[0.05]" />

        <div className="mx-auto mt-5 h-6 w-24 animate-pulse rounded-full bg-white/[0.05]" />
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0d131a]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="h-4 w-40 animate-pulse rounded bg-white/[0.05]" />

          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-white/[0.04]" />
        </div>

        <div className="grid md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex gap-3 border-b border-white/[0.05] px-5 py-5"
            >
              <div className="h-8 w-8 animate-pulse rounded-lg bg-white/[0.05]" />

              <div className="flex-1">
                <div className="h-2.5 w-20 animate-pulse rounded bg-white/[0.05]" />

                <div className="mt-2 h-4 w-32 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
