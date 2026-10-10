"use client";

import { supabase } from "@/libs/supabase/browser";
import transactionService from "@/services/transaction.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import { transactionKeys } from "@/app/api/query-key";
import {
  adminListTransactions,
  adminTransactionStats,
  getMyTransactionDetail,
  getMyTransactions,
} from "@/app/api/v1/transaction/transaction";
import { TransactionType } from "@/types/transaction";
import { ADMIN_TRANSACTIONS_PAGE_SIZE } from "./admin";

export function useWalletTransactions() {
  const {
    data: wallet_transactions,
    error,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);
      if (!session) throw new Error("");

      const { wallet, error: walletError } =
        await transactionService.fetchUserWallet(session.user.id);
      if (walletError) throw new Error(walletError.message);
      if (!wallet) throw new Error("");

      const { walletTransactions, error: walletTransactionsError } =
        await transactionService.fetchWalletTransactions(wallet.id);

      if (walletTransactionsError)
        throw new Error(walletTransactionsError.message);

      return walletTransactions;
    },
  });

  return {
    wallet_transactions,
    error,
    isPending,
    isError,
    refetch,
  };
}

export function useTransaction(transactionId: string) {
  const { userId, isLoading: isSessionLoading } = useAuthSession();

  return useQuery({
    queryKey: ["transaction", userId, transactionId],

    enabled: !isSessionLoading && !!userId && !!transactionId,

    queryFn: async () => {
      const { transaction, error } =
        await transactionService.fetchTransactionById(transactionId);

      if (error) {
        throw new Error(error.message);
      }

      if (!transaction) {
        throw new Error("Transaction not found.");
      }

      return transaction;
    },
  });
}

export function useMyTransactions() {
  const { userId, isLoading: isSessionLoading } = useAuthSession();

  const query = useQuery({
    queryKey: transactionKeys.mine(userId),
    enabled: !isSessionLoading && !!userId,
    queryFn: getMyTransactions,
    staleTime: 30_000,
  });

  return {
    transactions: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useTransactionDetail(entryId: string) {
  const { userId, isLoading: isSessionLoading } = useAuthSession();

  return useQuery({
    queryKey: transactionKeys.detail(userId, entryId),
    enabled: !isSessionLoading && !!userId && !!entryId,
    queryFn: () => getMyTransactionDetail(entryId),
    staleTime: 30_000,
  });
}

export function useAdminTransactions({
  type,
  search,
  page,
}: {
  type: TransactionType | null;
  search: string;
  page: number;
}) {
  const params = {
    type,
    search: search.trim(),
    limit: ADMIN_TRANSACTIONS_PAGE_SIZE,
    offset: (page - 1) * ADMIN_TRANSACTIONS_PAGE_SIZE,
  };

  const query = useQuery({
    queryKey: transactionKeys.adminList(params),
    queryFn: () => adminListTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  return {
    rows: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdminTransactionStats() {
  return useQuery({
    queryKey: transactionKeys.adminStats(),
    queryFn: adminTransactionStats,
    staleTime: 30_000,
  });
}
