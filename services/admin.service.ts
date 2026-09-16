import { supabase } from "@/libs/supabase/browser";

const adminService = {
  /**
   * ============================================================
   * ADMIN USERS LIST
   * ============================================================
   */
  async fetchUserProfiles() {
    const { data: profiles, error } = await supabase
      .from("users")
      .select(`id, email, username, full_name, phone, role, status, created_at`)
      .order("created_at", { ascending: false });

    return { profiles, error };
  },

  async fetchUserWallets() {
    const { data: wallets, error } = await supabase
      .from("wallets")
      .select(
        `id, user_id, balance, locked_balance, currency, status, version`,
      );

    return { wallets, error };
  },

  async fetchUserOtps() {
    const { data: otps, error } = await supabase
      .from("otp_verifications")
      .select(
        `user_id, attempts, is_used, otp_code, expires_at, verified_at, created_at`,
      )
      .order("created_at", { ascending: false });

    return { otps, error };
  },

  async fetchAllInvestments() {
    const { data: investments, error } = await supabase
      .from("investments")
      .select(
        "user_id, wallet_id, plan_name, duration_days, amount, roi_percentage, total_return, created_at",
      )
      .order("created_at", { ascending: false });

    return { investments, error };
  },

  async fetchAllTransactions() {
    const { data: transactions, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    return { transactions, error };
  },

  /**
   * ============================================================
   * SINGLE USER
   * ============================================================
   */

  async fetchUser(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
          id,
          email,
          username,
          full_name,
          phone,
          role,
          status,
          created_at
        `,
      )
      .eq("id", userId)
      .single();

    return {
      user: data,
      error,
    };
  },

  /**
   * ============================================================
   * WALLET
   * ============================================================
   */

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
      .maybeSingle();

    return {
      wallet: data,
      error,
    };
  },

  /**
   * ============================================================
   * INVESTMENTS
   * ============================================================
   */

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

  /**
   * ============================================================
   * WITHDRAWALS
   * ============================================================
   */

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

  /**
   * ============================================================
   * WALLET TRANSACTIONS
   * ============================================================
   */

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

  /**
   * ============================================================
   * NOTIFICATIONS
   * ============================================================
   */

  async fetchUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
          id,
          user_id,
          title,
          body,
          notification_type,
          is_read,
          created_at
        `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      notifications: data ?? [],
      error,
    };
  },

  /**
   * ============================================================
   * USER DEVICES
   * ============================================================
   */

  async fetchUserDevices(userId: string) {
    const { data, error } = await supabase
      .from("user_devices")
      .select(
        `
          id,
          user_id,
          device_id,
          browser,
          operating_system,
          last_ip_address,
          country,
          city,
          trusted,
          is_active,
          last_used_at,
          created_at,
          updated_at
        `,
      )
      .eq("user_id", userId)
      .order("last_used_at", { ascending: false });

    return {
      devices: data ?? [],
      error,
    };
  },

  /**
   * ============================================================
   * AUDIT LOGS
   * ============================================================
   */

  async fetchUserAuditLogs(userId: string) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
          id,
          reference,
          actor_id,
          actor_role,
          target_user_id,
          action,
          entity,
          entity_id,
          action_status,
          metadata,
          created_at
        `,
      )
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false });

    return {
      auditLogs: data ?? [],
      error,
    };
  },

  /**
   * ============================================================
   * ADMIN WALLET ADJUSTMENT
   * ============================================================
   */

  async adjustWallet({
    walletId,
    amount,
    adjustmentType,
    reason,
    notes,
  }: {
    walletId: string;
    amount: number;
    adjustmentType: "credit_correction" | "debit_correction";
    reason: string;
    notes?: string | null;
  }) {
    const { data, error } = await supabase.rpc("admin_adjust_wallet", {
      p_wallet_id: walletId,
      p_amount: amount,
      p_adjustment_type: adjustmentType,
      p_reason: reason,
      p_notes: notes || null,
    });

    return {
      adjustment: data,
      error,
    };
  },
};

export default adminService;
