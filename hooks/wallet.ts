import { useQuery, useQueryClient } from "@tanstack/react-query";
import walletService from "@/services/wallet.service";
import { useAuthSession } from "./useAuthSession";
import { supabase } from "@/libs/supabase/browser";
import userService from "@/services/user.service";
import { useEffect } from "react";
import depositInstructionsService from "@/services/deposit-instructions.service";

export function useWalletList() {
  const {
    data: wallets = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "wallet-list"],
    queryFn: async () => {
      const { wallets, error } = await walletService.getAllWallets();
      if (error) throw new Error(error.message);
      return wallets;
    },
    staleTime: 30_000,
  });

  return { wallets, isPending, isError, error, refetch };
}

export function useWithdrawFormData() {
  const { userId } = useAuthSession();

  return useQuery({
    queryKey: ["withdraw", "form-data", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [
        { wallet, error: walletError },
        { data: feeData },
        { data: userData },
      ] = await Promise.all([
        userService.fetchUserWallet(userId!),
        supabase.rpc("get_setting_numeric", { p_key: "withdrawal_fee_flat" }),
        supabase.auth.getUser(),
      ]);

      if (walletError) throw new Error(walletError.message);
      if (!wallet) throw new Error("Wallet not found");

      return {
        balance: wallet.balance,
        lockedBalance: wallet.locked_balance,
        available: wallet.balance - wallet.locked_balance,
        currency: wallet.currency,
        fee: feeData ?? 0,
        email: userData.user?.email ?? "",
      };
    },
    staleTime: 15_000,
  });
}

export function useWalletRealtime() {
  const { userId } = useAuthSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`wallet-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user"] });
          queryClient.invalidateQueries({ queryKey: ["portfolio"] });
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}

export function useDepositInstructions() {
  return useQuery({
    queryKey: ["deposit-instructions"],
    queryFn: async () => {
      const { instructions, error } = await depositInstructionsService.fetch();
      if (error) throw new Error(error.message);
      return instructions;
    },
    staleTime: 5 * 60_000,
  });
}
