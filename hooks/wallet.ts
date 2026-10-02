import { useQuery } from "@tanstack/react-query";
import walletService from "@/services/wallet.service";

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
