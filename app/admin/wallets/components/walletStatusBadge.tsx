import { AdminWalletRow } from "../types/wallet";

const STYLES: Record<AdminWalletRow["status"], { dot: string; pill: string }> =
  {
    active: {
      dot: "bg-emerald-400",
      pill: "bg-emerald-500/10 text-emerald-400",
    },
    frozen: { dot: "bg-amber-400", pill: "bg-amber-500/10 text-amber-400" },
    closed: { dot: "bg-red-400", pill: "bg-red-500/10 text-red-400" },
  };

export default function WalletStatusBadge({
  status,
}: {
  status: AdminWalletRow["status"];
}) {
  const { dot, pill } = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
