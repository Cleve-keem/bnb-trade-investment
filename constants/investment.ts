import { InvestmentStatus } from "@/types/investment";

export const STATUS_FILTERS = [
  "All",
  "Active",
  "Pending",
  "Completed",
  "Cancelled",
] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];

export const ALL_PLANS = "All";

export const STATUS_BADGE_STYLES: Record<InvestmentStatus, string> = {
  Active: "bg-emerald-500/10 text-emerald-400",
  Completed: "bg-blue-500/10 text-blue-400",
  Pending: "bg-[#f0b90b]/10 text-[#f0b90b]",
  Cancelled: "bg-red-500/10 text-red-400",
};

export const STATUS_DOT_STYLES: Record<InvestmentStatus, string> = {
  Active: "bg-emerald-400",
  Completed: "bg-blue-400",
  Pending: "bg-[#f0b90b]",
  Cancelled: "bg-red-400",
};
