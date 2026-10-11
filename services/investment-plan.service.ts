import { supabase } from "@/libs/supabase/browser";
import type { AdminPlanRow, PlanInput, PlanStatus } from "../types/plan";

function normalize(row: AdminPlanRow): AdminPlanRow {
  return {
    ...row,
    minimum_amount: Number(row.minimum_amount),
    maximum_amount:
      row.maximum_amount === null ? null : Number(row.maximum_amount),
    roi_percentage: Number(row.roi_percentage),
    investor_count: Number(row.investor_count),
    invested_amount: Number(row.invested_amount),
    lifetime_investments: Number(row.lifetime_investments),
  };
}

const planParams = (input: PlanInput) => ({
  p_name: input.name,
  p_description: input.description,
  p_minimum_amount: input.minimumAmount,
  p_maximum_amount: input.maximumAmount,
  p_roi_percentage: input.roiPercentage,
  p_duration_days: input.durationDays,
});

// Every function throws on error. A returned { error } is easy to ignore, and
// React Query would then report the failed call as a success.
const plansService = {
  async list(): Promise<AdminPlanRow[]> {
    const { data, error } = await supabase.rpc("admin_list_plans");
    if (error) throw new Error(error.message);
    return ((data ?? []) as AdminPlanRow[]).map(normalize);
  },

  async create(input: PlanInput, status: PlanStatus) {
    const { error } = await supabase.rpc("admin_create_plan", {
      ...planParams(input),
      p_status: status,
    });
    if (error) throw new Error(error.message);
  },

  async update(id: string, input: PlanInput) {
    const { error } = await supabase.rpc("admin_update_plan", {
      p_plan_id: id,
      ...planParams(input),
    });
    if (error) throw new Error(error.message);
  },

  async setStatus(id: string, status: PlanStatus) {
    const { error } = await supabase.rpc("admin_set_plan_status", {
      p_plan_id: id,
      p_status: status,
    });
    if (error) throw new Error(error.message);
  },

  async remove(id: string) {
    const { error } = await supabase.rpc("admin_delete_plan", {
      p_plan_id: id,
    });
    if (error) throw new Error(error.message);
  },
};

export default plansService;
