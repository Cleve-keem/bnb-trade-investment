import { supabase } from "@/libs/supabase/browser";
import {
  AdminTransactionEntry,
  AdminTransactionStats,
  TransactionDetail,
  TransactionEntry,
  TransactionType,
} from "@/types/transaction";

export type AdminListParams = {
  type: TransactionType | null;
  search: string;
  limit: number;
  offset: number;
};

export async function getMyTransactions(): Promise<TransactionEntry[]> {
  const { data, error } = await supabase.rpc("get_my_transactions");
  if (error) throw new Error(error.message);

  return ((data ?? []) as TransactionEntry[]).map((row) => ({
    ...row,
    amount: Number(row.amount),
  }));
}

export async function getMyTransactionDetail(
  entryId: string,
): Promise<TransactionDetail | null> {
  const { data, error } = await supabase.rpc("get_my_transaction_detail", {
    p_entry_id: entryId,
  });

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }

  const row = ((data ?? []) as TransactionDetail[])[0];
  if (!row) return null;

  return {
    ...row,
    amount: Number(row.amount),
    balance_before:
      row.balance_before === null ? null : Number(row.balance_before),
    balance_after:
      row.balance_after === null ? null : Number(row.balance_after),
  };
}

export async function adminListTransactions(
  params: AdminListParams,
): Promise<{ rows: AdminTransactionEntry[]; total: number }> {
  const { data, error } = await supabase.rpc("admin_list_transactions", {
    p_type: params.type,
    p_search: params.search || null,
    p_limit: params.limit,
    p_offset: params.offset,
  });
  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as AdminTransactionEntry[]).map((row) => ({
    ...row,
    amount: Number(row.amount),
    total_count: Number(row.total_count),
  }));

  return { rows, total: rows[0]?.total_count ?? 0 };
}

export async function adminTransactionStats(): Promise<AdminTransactionStats> {
  const { data, error } = await supabase.rpc("admin_transaction_stats");
  if (error) throw new Error(error.message);

  const row = (Array.isArray(data) ? data[0] : data) as
    | Record<string, unknown>
    | undefined;
  return {
    completedVolume: Number(row?.completed_volume ?? 0),
    totalCount: Number(row?.total_count ?? 0),
    pendingCount: Number(row?.pending_count ?? 0),
    failedCount: Number(row?.failed_count ?? 0),
  };
}
