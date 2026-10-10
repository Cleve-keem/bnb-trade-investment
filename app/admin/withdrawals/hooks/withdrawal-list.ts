"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { transactionKeys } from "@/app/api/query-key";
import withdrawalService from "../services/withdrawal";

export const withdrawalKeys = {
  adminList: () => ["admin", "withdrawal-list"] as const,
};

export function useWithdrawalList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: withdrawalKeys.adminList(),
    queryFn: () => withdrawalService.getAllWithdrawals(),
    staleTime: 15_000,
  });

  // A decision moves money (locks or releases balance, writes ledger rows),
  // so every admin view that displays it has to refresh, not just this list.
  function refreshAfterDecision() {
    queryClient.invalidateQueries({ queryKey: withdrawalKeys.adminList() });
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: ["admin", "wallet-list"] });
  }

  const onError = (err: Error) =>
    toast.error(err.message || "Something went wrong.");

  const approveMutation = useMutation({
    mutationFn: (id: string) => withdrawalService.approve(id),
    onSuccess: () => {
      toast.success(
        "Approved. The funds stay reserved until you mark it completed.",
      );
      refreshAfterDecision();
    },
    onError,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      withdrawalService.reject(id, reason),
    onSuccess: () => {
      toast.success(
        "Rejected. The reserved funds are back in the user's wallet.",
      );
      refreshAfterDecision();
    },
    onError,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => withdrawalService.complete(id),
    onSuccess: () => {
      toast.success("Completed. The wallet has been debited.");
      refreshAfterDecision();
    },
    onError,
  });

  return {
    withdrawals: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    approve: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    reject: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    complete: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
}
