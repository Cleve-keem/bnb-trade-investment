export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "investment"
  | "return"
  | "adjustment"
  | "bonus";
export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionSource = "ledger" | "withdrawal" | "deposit";
export type TransactionTypeFilterValue = "all" | TransactionType;

export type TransactionEntry = {
  entry_id: string;
  source: TransactionSource;
  reference: string;
  entry_type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  occurred_at: string;
};

export type TransactionDetail = TransactionEntry & {
  currency: string;
  balance_before: number | null;
  balance_after: number | null;
  asset: string | null;
  network: string | null;
  destination_address: string | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
};

export type AdminTransactionEntry = TransactionEntry & {
  user_id: string;
  full_name: string | null;
  email: string;
  total_count: number;
};

export type AdminTransactionStats = {
  completedVolume: number;
  totalCount: number;
  pendingCount: number;
  failedCount: number;
};
