import { useQuery } from "@tanstack/react-query";
import walletService from "@/services/wallet.service";
import depositInstructionsService from "@/services/deposit.service";
import { useAuthSession } from "./useAuthSession";
import { supabase } from "@/libs/supabase/browser";
import userService from "@/services/user.service";

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
