"use client";

import { useQuery } from "@tanstack/react-query";
import type { CryptoCurrency } from "@/constants/deposit";
import depositInstructionsService from "@/services/deposit-instructions.service";
import { useAuthSession } from "./useAuthSession";

export function useDepositInstructions(enabled: boolean) {
  const { userId } = useAuthSession();

  const query = useQuery({
    queryKey: ["deposit", "instructions", userId],
    enabled: enabled && !!userId,
    queryFn: async () => {
      const { instructions, error } = await depositInstructionsService.fetch();
      if (error || !instructions) {
        throw new Error(error?.message ?? "Couldn't load deposit options");
      }
      return instructions;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const addressFor = (asset: CryptoCurrency) =>
    query.data?.cryptoAddresses[asset]?.trim() ?? "";

  return {
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    addressFor,
    // A coin is usable only when its address is set
    isAvailable: (asset: CryptoCurrency) => addressFor(asset) !== "",
  };
}
