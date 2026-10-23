import { supabase } from "@/libs/supabase/browser";
import type { AdminDeposit } from "@/types/deposit";

const toAdminDeposit = (r: any): AdminDeposit => ({
  id: r.deposit_id,
  reference: r.reference,
  userName: r.full_name ?? r.email,
  email: r.email,
  amount: Number(r.amount),
  currency: r.currency,
  asset: r.asset ?? null,
  address: r.address ?? null,
  status: r.status,
  txid: r.txid,
  rejectionReason: r.rejection_reason,
  createdAt: r.created_at,
  decidedAt: r.decided_at,
  decidedBy: r.decided_by_name,
});

const depositService = {
  // ---------- user ----------
  async requestDeposit(input: {
    amount: number;
    asset: string;
    address: string;
  }) {
    const { data, error } = await supabase.rpc("request_deposit", {
      p_amount: input.amount,
      p_asset: input.asset,
      p_address: input.address,
    });
    const row = Array.isArray(data) ? data[0] : data;
    return {
      deposit: (row ?? null) as {
        id: string;
        reference: string;
        amount: number | string;
      } | null,
      error,
    };
  },

  // ---------- admin ----------
  async listDeposits() {
    const { data, error } = await supabase.rpc("admin_list_deposits");
    return { deposits: (data ?? []).map(toAdminDeposit), error };
  },

  async confirmDeposit(id: string) {
    const { error } = await supabase.rpc("admin_confirm_deposit", {
      p_deposit_id: id,
    });
    return { error };
  },

  async rejectDeposit(id: string, reason: string) {
    const { error } = await supabase.rpc("admin_reject_deposit", {
      p_deposit_id: id,
      p_reason: reason,
    });
    return { error };
  },
};

export default depositService;

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

// Turns database errors into messages a person can understand
export function getDepositErrorMessage(error: unknown) {
  const message = messageOf(error);

  const readable = [
    /^Minimum deposit/,
    /^Maximum deposit/,
    /decimal places/,
    /^Transaction ID/,
    /already submitted/,
    /waiting for confirmation/,
    /deposits are not available yet/,
    /deposit address was updated/,
    /^Unsupported currency/,
  ];
  if (readable.some((re) => re.test(message))) return message;

  if (/wallet is not active|account is not active/.test(message)) {
    return "Your account or wallet isn't active, so deposits are paused. Please contact support.";
  }
  if (/no authenticated user/.test(message))
    return "Please sign in again to continue.";
  return "We couldn't submit your deposit. Please try again.";
}

export function getAdminDepositError(error: unknown) {
  const message = messageOf(error);

  if (/is not pending/.test(message))
    return "This deposit was already handled.";
  if (/wallet .* is not active/.test(message)) {
    return "This user's wallet isn't active. Unfreeze it first, then confirm again.";
  }
  if (/caller is not an admin/.test(message))
    return "You need to be an admin to do this.";
  if (/rejection reason is required/.test(message))
    return "Please enter a reason.";
  return message;
}
