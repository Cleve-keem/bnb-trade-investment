import { STATUS_META, TYPE_META } from "@/libs/formatter/transaction-meta";
import { TransactionStatus, TransactionType } from "@/types/transaction";
import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Gift,
  RotateCcw,
  TrendingUp,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  investment: TrendingUp,
  return: RotateCcw,
  adjustment: Wallet,
  bonus: Gift,
};

export function TypeBadge({ type }: { type: TransactionType }) {
  return (
    <span className="inline-flex rounded-full bg-white/4 px-2.5 py-1 text-[10px] font-medium text-zinc-400">
      {type}
    </span>
  );
}

export function TransactionTypeIcon({ type }: { type: TransactionType }) {
  const Icon = TYPE_ICONS[type] ?? Wallet;
  const tone = TYPE_META[type]?.tone ?? "bg-white/5 text-zinc-400";

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
    >
      <Icon size={17} />
    </div>
  );
}

type TransactionTypeBadgeProps = {
  type: TransactionType;
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
        <CheckCircle2 size={11} />
        Completed
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
        <Clock3 size={11} />
        Pending
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400">
      <XCircle size={11} />
      Failed
    </span>
  );
}

export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
  const meta = TYPE_META[type];

  const Icon =
    type === "deposit"
      ? ArrowDownLeft
      : type === "withdrawal"
        ? ArrowUpRight
        : ArrowLeftRight;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        meta?.tone ?? "border-white/10 bg-white/5 text-zinc-400"
      }`}
    >
      <Icon size={13} />
      {meta?.label ?? "Transaction"}
    </span>
  );
}

type TransactionStatusBadgeProps = {
  status: TransactionStatus;
};

export function TransactionStatusBadge({
  status,
}: TransactionStatusBadgeProps) {
  const meta = STATUS_META[status];

  const Icon =
    status === "completed"
      ? CheckCircle2
      : status === "pending"
        ? Clock3
        : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        meta?.tone ?? "border-white/10 bg-white/5 text-zinc-400"
      }`}
    >
      <Icon size={13} />
      {meta?.label ?? "Unknown"}
    </span>
  );
}

// import { STATUS_META, TYPE_META } from "@/libs/formatter/transaction-meta";
// import { TransactionStatus, TransactionType } from "@/types/transaction";
// import {
//   ArrowDownLeft,
//   ArrowLeftRight,
//   ArrowUpRight,
//   CheckCircle2,
//   Clock3,
//   XCircle,
// } from "lucide-react";

// type TransactionTypeBadgeProps = {
//   type: TransactionType;
// };

// export function TransactionTypeBadge({ type }: TransactionTypeBadgeProps) {
//   const meta = TYPE_META[type];

//   const Icon =
//     type === "deposit"
//       ? ArrowDownLeft
//       : type === "withdrawal"
//         ? ArrowUpRight
//         : ArrowLeftRight;

//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
//         meta?.tone ?? "border-white/10 bg-white/5 text-zinc-400"
//       }`}
//     >
//       <Icon size={13} />
//       {meta?.label ?? "Transaction"}
//     </span>
//   );
// }

// type TransactionStatusBadgeProps = {
//   status: TransactionStatus;
// };

// export function TransactionStatusBadge({
//   status,
// }: TransactionStatusBadgeProps) {
//   const meta = STATUS_META[status];

//   const Icon =
//     status === "completed"
//       ? CheckCircle2
//       : status === "pending"
//         ? Clock3
//         : XCircle;

//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
//         meta?.tone ?? "border-white/10 bg-white/5 text-zinc-400"
//       }`}
//     >
//       <Icon size={13} />
//       {meta?.label ?? "Unknown"}
//     </span>
//   );
// }
