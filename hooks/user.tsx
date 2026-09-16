"use client";

import { supabase } from "@/libs/supabase/browser";
import UserService from "@/services/user.service";
import { useQuery } from "@tanstack/react-query";

export function useUserDashboard() {
  const {
    data: dashboard,
    isPending,
    refetch,
    isError,
    error,
  } = useQuery({
    queryKey: ["user-dashboard"],

    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(error.message);
      }

      if (!session?.user) {
        return null;
      }

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
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session?.user) return null;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("email")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        throw new Error("Failed to load user profile.");
      }

      return {
        email: session.user.email,
      };

      // return {
      //   id: session.user.id,
      //   email: session.user.email,
      //   username: session.user.user_metadata?.username || "Investor",
      //   firstName: session.user.user_metadata?.first_name || "",
      //   lastName: session.user.user_metadata?.last_name || "",
      //   phoneNumber: session.user.user_metadata?.phone_number || "",
      //   is_email_verified: !!session.user.email_confirmed_at,
      //   is_otp_verified: false,
      //   user_role: profile.user_role,
      //   is_suspended: profile.is_suspended,
      // };
    },
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
}
