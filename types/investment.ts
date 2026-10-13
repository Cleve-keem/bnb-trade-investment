export type InvestmentStatus = "Active" | "Completed" | "Pending" | "Cancelled";

export type Investment = {
  id: string;
  reference: string;
  userId: string;
  fullName: string;
  email: string;
  plan: string;
  amount: number;
  roi: number;
  expectedReturn: number;
  profit: number;
  duration: number;
  durationUnit: "Days" | "Months";
  startDate: string;
  endDate: string;
  status: InvestmentStatus;
};

export type InvestmentRow = {
  investment_id: string;
  reference: string;
  user_id: string;
  full_name: string | null;
  email: string;
  plan_name: string;
  amount: number | string;
  roi_percentage: number | string;
  expected_profit: number | string;
  total_return: number | string;
  duration_days: number;
  status: "pending" | "active" | "completed" | "cancelled";
  started_at: string | null;
  matures_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

export type InvestmentSummary = {
  totalInvested: number;
  expectedReturns: number;
  totalProfit: number;
  activeCount: number;
  pendingCount: number;
  completedCount: number;
};

export type MyInvestmentStatus =
  | "Active"
  | "Completed"
  | "Pending"
  | "Cancelled";

export type MyInvestment = {
  id: string;
  reference: string;
  plan: string;
  invested: number;
  expectedReturn: number;
  profit: number;
  roi: number;
  durationDays: number;
  status: MyInvestmentStatus;
  progress: number; // 0-100
  maturityLabel: string;
};

export type MyInvestmentRow = {
  investment_id: string;
  reference: string;
  plan_name: string;
  amount: number | string;
  roi_percentage: number | string;
  expected_profit: number | string;
  total_return: number | string;
  duration_days: number;
  status: "pending" | "active" | "completed" | "cancelled";
  started_at: string | null;
  matures_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
};

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  minimumAmount: number;
  maximumAmount: number | null;
  roi: number;
  durationDays: number;
  imageUrl: string | null;
};

export type PlanRow = {
  plan_id: string;
  name: string;
  description: string | null;
  minimum_amount: number | string;
  maximum_amount: number | string | null;
  roi_percentage: number | string;
  duration_days: number;
  image_url: string | null;
};