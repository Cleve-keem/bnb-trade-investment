export type PlanStatus = "active" | "inactive" | "archived";

export type AdminPlanRow = {
  plan_id: string;
  name: string;
  description: string | null;
  minimum_amount: number;
  maximum_amount: number | null; // null = no cap
  roi_percentage: number;
  duration_days: number;
  status: PlanStatus;
  investor_count: number; // current: active + pending positions
  invested_amount: number; // current: active + pending principal
  lifetime_investments: number; // all-time; > 0 means it can't be deleted
  created_at: string;
};

export type PlanInput = {
  name: string;
  description: string;
  minimumAmount: number;
  maximumAmount: number | null;
  roiPercentage: number;
  durationDays: number;
};
