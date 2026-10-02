// services/deposit.service.ts
import { supabase } from "@/libs/supabase/browser";
import { AdminDepositRow } from "../types/deposit";

const depositService = {
  async getAllDeposits() {
    const { data, error } = await supabase.rpc("admin_list_deposits");
    return { deposits: (data ?? []) as AdminDepositRow[], error };
  },

  async confirmDeposit(depositId: string) {
    const { data, error } = await supabase.rpc("admin_confirm_deposit", {
      p_deposit_id: depositId,
    });
    return { deposit: data, error };
  },

  async rejectDeposit(depositId: string, reason: string) {
    const { data, error } = await supabase.rpc("admin_reject_deposit", {
      p_deposit_id: depositId,
      p_reason: reason,
    });
    return { deposit: data, error };
  },
};

export default depositService;
