import { cancelInvestmentRequest, fetchInvestmentRows } from "@/app/admin/investments/api/investment";
import { ALL_PLANS } from "@/constants/investment";
import { formatDate } from "@/libs/formatter/date";
import { capitalize } from "@/libs/formatter/format";
import { Investment, InvestmentRow, InvestmentStatus, InvestmentSummary } from "@/types/investment";


const toInvestment = (row: InvestmentRow): Investment => ({
  id: row.investment_id,
  reference: row.reference,
  userId: row.user_id,
  fullName: row.full_name ?? row.email,
  email: row.email,
  plan: row.plan_name,
  amount: Number(row.amount),
  roi: Number(row.roi_percentage),
  expectedReturn: Number(row.total_return),
  profit: Number(row.expected_profit),
  duration: row.duration_days,
  durationUnit: "Days",
  startDate: formatDate(row.started_at),
  endDate: formatDate(row.matures_at),
  status: capitalize(row.status) as InvestmentStatus,
});

export async function listInvestments(): Promise<Investment[]> {
  const rows = await fetchInvestmentRows();
  return rows.map(toInvestment);
}

export async function cancelInvestment(id: string, reason?: string) {
  await cancelInvestmentRequest(id, reason);
}

export function getInvestmentSummary(
  investments: Investment[],
): InvestmentSummary {
  const counted = investments.filter((i) => i.status !== "Cancelled");

  return {
    totalInvested: counted.reduce((sum, i) => sum + i.amount, 0),
    expectedReturns: counted.reduce((sum, i) => sum + i.expectedReturn, 0),
    totalProfit: counted.reduce((sum, i) => sum + i.profit, 0),
    activeCount: investments.filter((i) => i.status === "Active").length,
    pendingCount: investments.filter((i) => i.status === "Pending").length,
    completedCount: investments.filter((i) => i.status === "Completed").length,
  };
}

export function getPlanOptions(investments: Investment[]): string[] {
  return [ALL_PLANS, ...Array.from(new Set(investments.map((i) => i.plan)))];
}

export function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("caller is not an admin")) {
    return "You need to be signed in as an admin to view this page.";
  }
  if (message.includes("only active investments")) {
    return "Only active investments can be cancelled.";
  }
  if (message.includes("is not active")) {
    return "This user's wallet is not active, so the refund can't be paid. Unfreeze the wallet first.";
  }
  return message;
}
