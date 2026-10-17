import { actionLabel, describeAudit, titleCase } from "@/libs/formatter/audit";
import { formatDateTime } from "@/libs/formatter/display";
import { supabase } from "@/libs/supabase/browser";
import { ActivityItem, AdminNotification, Audience, AuditLog, AuditSeverity, AuditStats, NotificationType, OverviewPoint, OverviewRange, PendingItem, PendingKind } from "@/types/admin";

const toNotification = (r: any): AdminNotification => ({
  uuid: r.notification_id,
  id: r.reference,
  title: r.title,
  message: r.message,
  type: r.notification_type,
  audience: r.audience,
  status: r.status === "sent" ? "Sent" : "Draft",
  createdAt: formatDateTime(r.created_at),
  sentAt: r.sent_at ? formatDateTime(r.sent_at) : undefined,
  recipients: r.recipients,
});

const toAuditLog = (r: any): AuditLog => ({
  id: r.reference,
  actor: r.actor_name ?? r.actor_email ?? "System",
  actorEmail: r.actor_email ?? "—",
  action: actionLabel(r.action),
  target: titleCase(r.entity),
  targetId: r.entity_id ? String(r.entity_id).slice(0, 8) : "—",
  description: describeAudit(r.action, r.metadata ?? {}),
  severity: r.severity,
  ipAddress: r.ip_address ?? "—",
  timestamp: formatDateTime(r.created_at),
});

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

  // ---------- dashboard ----------
  async fetchOverview(range: OverviewRange) {
    const { data, error } = await supabase.rpc("admin_overview_series", {
      p_range: range,
    });
    const points: OverviewPoint[] = (data ?? []).map((r: any) => ({
      label: r.label,
      value: Number(r.value ?? 0),
    }));
    return { points, error };
  },

  async fetchPending(opts: {
    limit: number;
    kinds?: PendingKind[];
    oldestFirst?: boolean;
  }) {
    const { data, error } = await supabase.rpc("admin_list_pending", {
      p_limit: opts.limit,
      p_kinds: opts.kinds ?? null,
      p_oldest_first: opts.oldestFirst ?? false,
    });
    const rows = (data ?? []) as any[];
    const items: PendingItem[] = rows.map((r) => ({
      id: r.item_id,
      kind: r.kind,
      reference: r.reference,
      userName: r.full_name ?? r.email,
      amount: r.amount === null ? null : Number(r.amount),
      title: r.title,
      status: r.status,
      createdAt: r.created_at,
    }));
    return {
      items,
      total: rows.length ? Number(rows[0].total_count) : 0,
      error,
    };
  },

  async fetchActivity(limit: number, offset: number) {
    const { data, error } = await supabase.rpc("admin_list_transactions", {
      p_type: null,
      p_search: null,
      p_limit: limit,
      p_offset: offset,
    });
    const rows = (data ?? []) as any[];
    const items: ActivityItem[] = rows.map((r) => ({
      id: r.entry_id,
      type: r.entry_type,
      user: r.full_name ?? r.email,
      description: r.description,
      amount: Number(r.amount ?? 0),
      status: r.status,
      createdAt: r.occurred_at,
    }));
    return {
      items,
      total: rows.length ? Number(rows[0].total_count) : 0,
      error,
    };
  },

  // ---------- notifications ----------
  async listNotifications() {
    const { data, error } = await supabase.rpc("admin_list_notifications");
    return { notifications: (data ?? []).map(toNotification), error };
  },

  async createNotification(input: {
    title: string;
    message: string;
    type: NotificationType;
    audience: Audience;
    send: boolean;
  }) {
    const { error } = await supabase.rpc("admin_create_notification", {
      p_title: input.title,
      p_message: input.message,
      p_type: input.type,
      p_audience: input.audience,
      p_send: input.send,
    });
    return { error };
  },

  async sendNotification(id: string) {
    const { error } = await supabase.rpc("admin_send_notification", {
      p_id: id,
    });
    return { error };
  },

  async deleteNotification(id: string) {
    const { error } = await supabase.rpc("admin_delete_notification", {
      p_id: id,
    });
    return { error };
  },

  // ---------- audit ----------
  async fetchAuditLogs(params: {
    severity: AuditSeverity | "All";
    search: string;
    page: number;
    pageSize: number;
  }) {
    const { data, error } = await supabase.rpc("admin_list_audit_logs", {
      p_severity: params.severity === "All" ? null : params.severity,
      p_search: params.search || null,
      p_limit: params.pageSize,
      p_offset: params.page * params.pageSize,
    });
    const rows = (data ?? []) as any[];
    return {
      logs: rows.map(toAuditLog),
      total: rows.length ? Number(rows[0].total_count) : 0,
      error,
    };
  },

  async fetchAuditStats() {
    const { data, error } = await supabase.rpc("admin_audit_stats");
    const row = Array.isArray(data) ? data[0] : data;
    const stats: AuditStats = {
      total: Number(row?.total ?? 0),
      info: Number(row?.info ?? 0),
      warning: Number(row?.warning ?? 0),
      critical: Number(row?.critical ?? 0),
    };
    return { stats, error };
  },
};

export default adminService;
