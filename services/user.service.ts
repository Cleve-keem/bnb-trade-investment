import { supabase } from "@/libs/supabase/browser";

const UserService = {
  async fetchUserProfileById(userId: string) {
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return { profile, error };
  },

  async fetchUserProfileByEmail(email: string) {
    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    return { profile, error };
  },

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

  async fetchUserWalletTransactions(walletId: string, limit?: number) {
    let query = supabase
      .from("wallet_transactions")
      .select(
        `
      id,
      amount,
      description,
      wallet_id,
      currency,
      created_at
    `,
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

  async fetchUserInvestments(userId: string) {
    const { data, error } = await supabase
      .from("investments")
      .select(
        `
          id,
          plan_id,
          plan_name,
          duration_days,
          amount,
          roi_percentage,
          expected_profit,
          total_return,
          status,
          started_at,
          matures_at,
          completed_at,
          created_at
          `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      investments: data ?? [],
      error,
    };
  },

  async fetchUserWithdrawals(userId: string) {
    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      withdrawals: data ?? [],
      error,
    };
  },

  async fetchUserTransactions(userId: string) {
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletError) {
      return {
        transactions: [],
        error: walletError,
      };
    }

    if (!wallet) {
      return {
        transactions: [],
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("wallet_transactions")
      .select(
        `
          id,
          wallet_id,
          amount,
          balance_before,
          balance_after,
          transaction_type,
          reference,
          description,
          currency,
          metadata,
          created_by,
          created_at
          `,
      )
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false });

    return {
      transactions: data ?? [],
      error,
    };
  },
};

export default UserService;
