import {
  TransactionStatus,
  TransactionType,
  TransactionTypeFilterValue,
} from "@/types/transaction";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Clock3,
  Gift,
  RotateCcw,
  TrendingUp,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export const TYPE_META: Record<
  TransactionType,
  { label: string; icon: LucideIcon; tone: string }
> = {
  deposit: {
    label: "Deposit",
    icon: ArrowDownToLine,
    tone: "bg-emerald-500/10 text-emerald-400",
  },

  withdrawal: {
    label: "Withdrawal",
    icon: ArrowUpFromLine,
    tone: "bg-red-500/10 text-red-400",
  },

  investment: {
    label: "Investment",
    icon: TrendingUp,
    tone: "bg-blue-500/10 text-blue-400",
  },

  return: {
    label: "Return",
    icon: RotateCcw,
    tone: "bg-[#f0b90b]/10 text-[#f0b90b]",
  },

  adjustment: {
    label: "Adjustment",
    icon: Wallet,
    tone: "bg-purple-500/10 text-purple-400",
  },

  bonus: { label: "Bonus", icon: Gift, tone: "bg-pink-500/10 text-pink-400" },
};

export const STATUS_META: Record<
  TransactionStatus,
  { label: string; icon: LucideIcon; tone: string }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    tone: "bg-emerald-500/10 text-emerald-400",
  },

  pending: {
    label: "Pending",
    icon: Clock3,
    tone: "bg-[#f0b90b]/10 text-[#f0b90b]",
  },
  
  failed: {
    label: "Failed",
    icon: XCircle,
    tone: "bg-red-500/10 text-red-400",
  },
};

export const TYPE_FILTERS: TransactionTypeFilterValue[] = [
  "all",
  "deposit",
  "withdrawal",
  "investment",
  "return",
  "adjustment",
  "bonus",
];

export const FILTER_LABEL = (value: TransactionTypeFilterValue) =>
  value === "all" ? "All" : TYPE_META[value].label;
