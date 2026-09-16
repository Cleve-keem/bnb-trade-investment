import { supabase } from "@/libs/supabase/browser";

const transactionService = {
  async fetchUserWallet(userId: string) {
    const { data, error } = await supabase
      .from("wallets")
      .select(
        `
          id,
          user_id,
          balance,
          locked_balance,
          currency,
          status,
          version
        `,
      )
      .eq("user_id", userId)
      .single();

    return {
      wallet: data,
      error,
    };
  },

  async fetchWalletTransactions(walletId: string, limit?: number) {
    let query = supabase
      .from("wallet_transactions")
      .select(
        `id, amount, description, wallet_id, transaction_type, currency, created_at`,
      )
      .eq("wallet_id", walletId)
      .order("created_at", { ascending: false });

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    return {
      walletTransactions: data ?? [],
      error,
    };
  },
};

export default transactionService;
