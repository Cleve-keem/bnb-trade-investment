import { Clock3, Check, CheckCheck, XCircle } from "lucide-react";
import { WithdrawalStatus } from "../types/withdrawal";

const CONFIG: Record<
  WithdrawalStatus,
  { icon: typeof Clock3; className: string; label: string }
> = {
  pending: {
    icon: Clock3,
    className: "bg-[#f0b90b]/10 text-[#f0b90b]",
    label: "Pending",
  },
  approved: {
    icon: Check,
    className: "bg-blue-500/10 text-blue-400",
    label: "Approved",
  },
  completed: {
    icon: CheckCheck,
    className: "bg-emerald-500/10 text-emerald-400",
    label: "Completed",
  },
  rejected: {
    icon: XCircle,
    className: "bg-red-500/10 text-red-400",
    label: "Rejected",
  },
};

export default function WithdrawalStatusBadge({
  status,
}: {
  status: WithdrawalStatus;
}) {
  const { icon: Icon, className, label } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
