"use client";

import { supabase } from "@/libs/supabase/browser";
import userService from "@/services/user.service";
import { useAuthSession } from "./useAuthSession";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
        await userService.fetchUserProfileById(session.user.id);

      if (profileError) throw new Error(profileError.message);
      if (!profile) throw new Error("User profile not found.");

      const { wallet, error: walletError } = await userService.fetchUserWallet(
        profile.id,
      );

      if (walletError) throw new Error(walletError.message);
      if (!wallet) throw new Error("User wallet not found.");

      const [
        { walletTransactions, error: walletTransactionsError },
        { investments, error: investmentsError },
      ] = await Promise.all([
        userService.fetchUserWalletTransactions(wallet.id, 5),
        userService.fetchUserInvestments(profile.id),
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
        .select(
          `id, email, full_name, role, status, avatar_url, email_verified_at, phone, username`,
        )
        .eq("id", userId)
        .single();

      if (profileError) throw new Error(profileError.message);

      return {
        id: profile.id,
        email: profile.email,
        fullname: profile.full_name ?? "User",
        username: profile.username,
        role: profile.role,
        status: profile.status,
        avatarUrl: profile.avatar_url,
        email_verified_at: profile.email_verified_at,
        phone: profile.phone,
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

export function useUserProfile() {
  const { userId } = useAuthSession();
  const queryKey = ["user", "profile", userId];
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    enabled: !!userId,
    queryFn: async () => {
      const { profile, error } = await userService.fetchUserProfileById(
        userId!,
      );
      if (error) throw new Error(error.message);
      return profile;
    },
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: {
      fullName: string;
      username: string;
      phone: string;
    }) => {
      const { profile, error } = await userService.updateProfile(input);
      if (error) throw new Error(error.message);
      return profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKey, profile);
    },
  });

  return {
    profile: query.data,
    isPending: query.isPending,
    isError: query.isError,
    updateProfile: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
    saveError: updateMutation.error,
  };
}
