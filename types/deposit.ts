export type DepositStatus = "pending" | "completed" | "failed";

export type AdminDeposit = {
  id: string;
  reference: string;
  userName: string;
  email: string;
  amount: number;
  currency: string;
  asset: string | null;
  address: string | null;
  status: DepositStatus;
  txid: string | null;
  rejectionReason: string | null;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
};
