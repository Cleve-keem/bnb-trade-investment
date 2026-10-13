import { supabase } from "@/libs/supabase/browser";
import { InvestmentRow } from "@/types/investment";

export async function fetchInvestmentRows(): Promise<InvestmentRow[]> {
  const { data, error } = await supabase.rpc("admin_list_investments");
  if (error) throw new Error(error.message);
  return (data ?? []) as InvestmentRow[];
}

export async function cancelInvestmentRequest(
  investmentId: string,
  reason?: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_cancel_investment", {
    p_investment_id: investmentId,
    p_reason: reason ?? null,
  });
  if (error) throw new Error(error.message);
}
