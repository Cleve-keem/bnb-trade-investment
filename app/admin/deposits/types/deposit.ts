export type DepositMethod = "bank_transfer" | "card" | "crypto";
export type DepositStatus = "pending" | "completed" | "failed";

export type AdminDepositRow = {
  deposit_id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  amount: number;
  method: DepositMethod;
  status: DepositStatus;
  rejection_reason: string | null;
  created_at: string;
};
