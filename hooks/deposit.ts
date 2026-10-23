"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CryptoCurrency } from "@/constants/deposit";
import depositService from "@/services/deposit.service";

export function useRequestDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      amount: number;
      asset: CryptoCurrency;
      address: string;
    }) => {
      const { deposit, error } = await depositService.requestDeposit(input);
      if (error) throw new Error(error.message);
      if (!deposit) throw new Error("No response from the server");
      return deposit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
