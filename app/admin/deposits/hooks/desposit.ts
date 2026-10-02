// hooks/deposit.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import depositService from "../services/deposit";

export function useDepositList() {
  const queryKey = ["admin", "deposit-list"];
  const queryClient = useQueryClient();

  const {
    data: deposits = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { deposits, error } = await depositService.getAllDeposits();
      if (error) throw new Error(error.message);
      return deposits;
    },
    staleTime: 15_000,
  });

  const confirmMutation = useMutation({
    mutationFn: (depositId: string) => depositService.confirmDeposit(depositId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({
      depositId,
      reason,
    }: {
      depositId: string;
      reason: string;
    }) => depositService.rejectDeposit(depositId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    deposits,
    isPending,
    isError,
    error,
    refetch,
    confirmDeposit: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    rejectDeposit: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}
