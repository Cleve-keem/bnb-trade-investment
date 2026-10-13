import { STATUS_BADGE_STYLES, STATUS_DOT_STYLES } from "@/constants/investment";
import { InvestmentStatus } from "@/types/investment";


export function StatusBadge({ status }: { status: InvestmentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE_STYLES[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_STYLES[status]}`}
      />
      {status}
    </span>
  );
}
