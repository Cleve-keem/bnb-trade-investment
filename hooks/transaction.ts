import { supabase } from "@/libs/supabase/browser";
import transactionService from "@/services/transaction.service";
import UserService from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "lucide-react";

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
