export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";

export type AdminWithdrawalRow = {
  withdrawal_id: string;
  reference: string;
  user_id: string;
  full_name: string | null;
  email: string;
  amount: number;
  fee: number;
  net_amount: number;
  asset: string | null;
  network: string | null;
  destination_address: string | null;
  status: WithdrawalStatus;
  rejection_reason: string | null;
  requested_at: string;
  decided_at: string | null;
  processed_at: string | null;
};
