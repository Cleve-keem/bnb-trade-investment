import { supabase } from "@/libs/supabase/browser";
import type { AdminWithdrawalRow } from "../types/withdrawal";

const withdrawalService = {
  async getAllWithdrawals(): Promise<AdminWithdrawalRow[]> {
    const { data, error } = await supabase.rpc("admin_list_withdrawals");
    if (error) throw new Error(error.message);

    return ((data ?? []) as AdminWithdrawalRow[]).map((row) => ({
      ...row,
      amount: Number(row.amount),
      fee: Number(row.fee),
      net_amount: Number(row.net_amount),
    }));
  },

  async approve(id: string) {
    const { error } = await supabase.rpc("approve_withdrawal", {
      p_withdrawal_id: id,
    });
    if (error) throw new Error(error.message);
  },

  async reject(id: string, reason: string) {
    const { error } = await supabase.rpc("reject_withdrawal", {
      p_withdrawal_id: id,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
  },

  async complete(id: string) {
    const { error } = await supabase.rpc("complete_withdrawal", {
      p_withdrawal_id: id,
    });
    if (error) throw new Error(error.message);
  },
};

export default withdrawalService;
