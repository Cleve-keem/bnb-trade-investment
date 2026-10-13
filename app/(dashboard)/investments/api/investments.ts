import { supabase } from "@/libs/supabase/browser";
import { MyInvestmentRow, PlanRow } from "@/types/investment";

export async function fetchMyInvestmentRows(): Promise<MyInvestmentRow[]> {
  const { data, error } = await supabase.rpc("get_my_investments");
  if (error) throw new Error(error.message);
  return (data ?? []) as MyInvestmentRow[];
}

export async function fetchPlanRows(): Promise<PlanRow[]> {
  const { data, error } = await supabase.rpc("list_available_plans");
  if (error) throw new Error(error.message);
  return (data ?? []) as PlanRow[];
}

export async function createInvestmentRequest(
  planId: string,
  amount: number,
): Promise<void> {
  const { error } = await supabase.rpc("create_investment", {
    p_plan_id: planId,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
}
