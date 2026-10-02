export type AdminWalletRow = {
  wallet_id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  balance: number;
  locked_balance: number;
  available_balance: number;
  invested_balance: number;
  status: "active" | "frozen" | "closed";
  updated_at: string;
};
