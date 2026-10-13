import { Investment } from "@/types/investment";
import { Eye, X } from "lucide-react";

type Props = {
  investment: Investment;
  cancelling: boolean;
  onView: () => void;
  onCancel: () => void;
};

export function InvestmentActionMenu({
  investment,
  cancelling,
  onView,
  onCancel,
}: Props) {
  return (
    <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11171f] p-1.5 shadow-2xl">
      <button
        onClick={onView}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
      >
        <Eye size={15} />
        View Details
      </button>

      {investment.status === "Active" && (
        <button
          onClick={onCancel}
          disabled={cancelling}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          <X size={15} />
          {cancelling ? "Cancelling..." : "Cancel Investment"}
        </button>
      )}
    </div>
  );
}
