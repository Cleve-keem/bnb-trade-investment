export default function PageHeader() {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#f0b90b]">
            Admin Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Monitor users, investments, transactions and platform activity from
            one place.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-zinc-400">System operational</span>
        </div>
      </div>
    </div>
  );
}
