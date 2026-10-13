import { BriefcaseBusiness } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
        <BriefcaseBusiness size={20} className="text-zinc-600" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">
        No investments found
      </h3>
      <p className="mt-1 max-w-sm text-xs text-zinc-600">
        Try changing your search or filters to find investment records.
      </p>
    </div>
  );
}