import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  shown: number;
  total: number;
};

export function ResultsFooter({ shown, total }: Props) {
  return (
    <div className="mt-5 flex flex-col gap-3 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing <span className="text-zinc-300">{shown}</span> of{" "}
        <span className="text-zinc-300">{total}</span> investments
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled
          className="rounded-lg border border-white/[0.06] p-2 text-zinc-700"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="rounded-lg bg-white/[0.05] px-3 py-2 text-zinc-300">
          1
        </span>
        <button
          disabled
          className="rounded-lg border border-white/[0.06] p-2 text-zinc-700"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
