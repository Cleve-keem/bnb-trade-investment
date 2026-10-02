import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { DepositStatus } from "../types/deposit";

const CONFIG: Record<
  DepositStatus,
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400",
    label: "Completed",
  },
  pending: {
    icon: Clock3,
    className: "bg-[#f0b90b]/10 text-[#f0b90b]",
    label: "Pending",
  },
  failed: {
    icon: XCircle,
    className: "bg-red-500/10 text-red-400",
    label: "Failed",
  },
};

export default function DepositStatusBadge({
  status,
}: {
  status: DepositStatus;
}) {
  const { icon: Icon, className, label } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      <Icon size={11} />
      {label}
    </span>
  );
}
