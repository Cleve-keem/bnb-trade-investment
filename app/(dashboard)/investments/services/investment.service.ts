import {
  MyInvestment,
  MyInvestmentRow,
  MyInvestmentStatus,
  Plan,
  PlanRow,
} from "@/types/investment";
import {
  createInvestmentRequest,
  fetchMyInvestmentRows,
  fetchPlanRows,
} from "../api/investments";

const DAY_MS = 86_400_000;

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

function getProgress(row: MyInvestmentRow): number {
  if (row.status === "completed") return 100;
  if (row.status !== "active" || !row.started_at || !row.matures_at) return 0;

  const start = new Date(row.started_at).getTime();
  const end = new Date(row.matures_at).getTime();
  if (end <= start) return 0;

  const pct = ((Date.now() - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

function getMaturityLabel(row: MyInvestmentRow): string {
  if (row.status === "completed") return "Completed";
  if (row.status === "cancelled") return "Cancelled";
  if (!row.matures_at) return "Not started";

  const daysLeft = Math.ceil(
    (new Date(row.matures_at).getTime() - Date.now()) / DAY_MS,
  );
  if (daysLeft <= 0) return "Matured, payout pending";
  return `Matures in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
}

const toMyInvestment = (row: MyInvestmentRow): MyInvestment => ({
  id: row.investment_id,
  reference: row.reference,
  plan: row.plan_name,
  invested: Number(row.amount),
  expectedReturn: Number(row.total_return),
  profit: Number(row.expected_profit),
  roi: Number(row.roi_percentage),
  durationDays: row.duration_days,
  status: capitalize(row.status) as MyInvestmentStatus,
  progress: getProgress(row),
  maturityLabel: getMaturityLabel(row),
});

const toPlan = (row: PlanRow): Plan => ({
  id: row.plan_id,
  name: row.name,
  description: row.description,
  minimumAmount: Number(row.minimum_amount),
  maximumAmount:
    row.maximum_amount === null ? null : Number(row.maximum_amount),
  roi: Number(row.roi_percentage),
  durationDays: row.duration_days,
  imageUrl: row.image_url,
});

export async function listMyInvestments(): Promise<MyInvestment[]> {
  return (await fetchMyInvestmentRows()).map(toMyInvestment);
}

export async function listAvailablePlans(): Promise<Plan[]> {
  return (await fetchPlanRows()).map(toPlan);
}

export async function invest(planId: string, amount: number) {
  await createInvestmentRequest(planId, amount);
}

export function getInvestErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("insufficient wallet balance"))
    return "You don't have enough available balance for this amount.";
  if (message.includes("outside plan bounds"))
    return "That amount is outside the limits for this plan.";
  if (message.includes("maintenance"))
    return "Investing is paused for maintenance. Please try again later.";
  if (message.includes("wallet is not active"))
    return "Your wallet is not active. Please contact support.";
  if (message.includes("is not available"))
    return "This plan is no longer available.";
  if (message.includes("no authenticated user"))
    return "Please sign in again to continue.";
  return "Something went wrong. Please try again.";
}
