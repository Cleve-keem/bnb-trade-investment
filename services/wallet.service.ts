import { AdminWalletRow } from "@/app/admin/wallets/types/wallet";
import { supabase } from "@/libs/supabase/browser";

const walletService = {
  async getAllWallets() {
    const { data, error } = await supabase.rpc("admin_list_wallets");
    return { wallets: (data ?? []) as AdminWalletRow[], error };
  },
};

export default walletService;
