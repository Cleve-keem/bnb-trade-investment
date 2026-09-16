"use client";

import { supabase } from "@/libs/supabase/browser";
import UserService from "@/services/user.service";
import { useAuthSession } from "./useAuthSession";
import { useQuery } from "@tanstack/react-query";

export function useUserDashboard() {
  const {
    data: dashboard,
    isPending,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", "user-dashboard"],

    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw new Error(error.message);
      if (!session?.user) return null;

      const { profile, error: profileError } =
        await UserService.fetchUserProfileById(session.user.id);

      if (profileError) throw new Error(profileError.message);
      if (!profile) throw new Error("User profile not found.");

      const { wallet, error: walletError } = await UserService.fetchUserWallet(
        profile.id,
      );

      if (walletError) throw new Error(walletError.message);
      if (!wallet) throw new Error("User wallet not found.");

      const [
        { walletTransactions, error: walletTransactionsError },
        { investments, error: investmentsError },
      ] = await Promise.all([
        UserService.fetchUserWalletTransactions(wallet.id, 5),
        UserService.fetchUserInvestments(profile.id),
      ]);

      if (walletTransactionsError)
        throw new Error(walletTransactionsError.message);
      if (investmentsError) throw new Error(investmentsError.message);

      const firstname = profile.full_name?.trim().split(/\s+/)[0] ?? "";

      const investedAmount = investments
        .filter((investment) =>
          ["active", "pending"].includes(investment.status),
        )
        .reduce(
          (total, investment) => total + Number(investment.amount ?? 0),
          0,
        );

      const totalPortfolio = Number(wallet.balance ?? 0) + investedAmount;
      const totalReturn = investments.reduce(
        (total, investment) => total + Number(investment.expected_profit ?? 0),
        0,
      );

      const recentTransactions = walletTransactions.slice(0, 5);

      return {
        firstname,
        wallet,
        total_return: totalReturn,
        total_portfolio: totalPortfolio,
        recentTransactions,
      };
    },
    staleTime: 30_000,
  });
  return { dashboard, isPending, isError, refetch, error };
}

export function useUser() {
  const { userId, isLoading: isSessionLoading } = useAuthSession();

  const query = useQuery({
    queryKey: ["user", "profile", userId],

    enabled: !isSessionLoading && !!userId,

    queryFn: async () => {
      if (!userId) return null;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select(`id, email, full_name, role, status, avatar_url`)
        .eq("id", userId)
        .single();

      if (profileError) throw new Error(profileError.message);

      return {
        id: profile.id,
        email: profile.email,
        fullname: profile.full_name ?? "User",
        role: profile.role,
        status: profile.status,
        avatarUrl: profile.avatar_url,
      };
    },

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    ...query,
    isPending: isSessionLoading || query.isPending,
  };
}

// export function useUser() {
//   return useQuery({
//     queryKey: ["user", "auth-user"],

//     queryFn: async () => {
//       const {
//         data: { session },
//         error: sessionError,
//       } = await supabase.auth.getSession();

//       if (sessionError) throw new Error(sessionError.message);
//       if (!session?.user) return null;

//       const { data: profile, error: profileError } = await supabase
//         .from("users")
//         .select(`id, email, full_name, role, status, avatar_url`)
//         .eq("id", session.user.id)
//         .single();

//       if (profileError) {
//         throw new Error(profileError.message);
//       }

//       return {
//         id: profile.id,
//         email: profile.email ?? session.user.email,
//         fullname: profile.full_name ?? "User",
//         role: profile.role,
//         status: profile.status,
//         avatarUrl: profile.avatar_url,
//       };
//     },

//     staleTime: 60 * 1000,
//     gcTime: 5 * 60 * 1000,
//     refetchOnMount: false,
//     refetchOnWindowFocus: true,
//   });
// }
