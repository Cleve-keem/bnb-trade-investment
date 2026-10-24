"use client";

import { supabase } from "@/libs/supabase/browser";
import userService from "@/services/user.service";
import { useAuthSession } from "./useAuthSession";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const profileKey = (userId: string | null) =>
  ["user", "profile", userId] as const;

function mapProfile(row: any) {
  return {
    id: row.id,
    email: row.email,
    fullname: row.full_name ?? "User",
    fullNameRaw: row.full_name ?? "",
    username: row.username,
    role: row.role,
    status: row.status,
    avatarUrl: row.avatar_url,
    email_verified_at: row.email_verified_at,
    phone: row.phone,
  };
}

async function fetchProfile(userId: string) {
  const { profile, error } = await userService.fetchUserProfileById(userId);
  if (error) throw new Error(error.message);
  return mapProfile(profile);
}

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

      const { walletTransactions, error: transactionsError } =
        await userService.fetchUserWalletTransactions(wallet.id, 5);

      if (transactionsError) throw new Error(transactionsError.message);

      const firstname = profile.full_name?.trim().split(/\s+/)[0] ?? "";

      return {
        firstname,
        wallet,
        recentTransactions: walletTransactions.slice(0, 5),
      };
    },
    staleTime: 30_000,
  });

  return { dashboard, isPending, isError, refetch, error };
}

// export function useUserDashboard() {
//   const {
//     data: dashboard,
//     isPending,
//     refetch,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["user", "user-dashboard"],

//     queryFn: async () => {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error) throw new Error(error.message);
//       if (!session?.user) return null;

//       const { profile, error: profileError } =
//         await userService.fetchUserProfileById(session.user.id);

//       if (profileError) throw new Error(profileError.message);
//       if (!profile) throw new Error("User profile not found.");

//       const { wallet, error: walletError } = await userService.fetchUserWallet(
//         profile.id,
//       );

//       if (walletError) throw new Error(walletError.message);
//       if (!wallet) throw new Error("User wallet not found.");

//       const [
//         { walletTransactions, error: walletTransactionsError },
//         { investments, error: investmentsError },
//       ] = await Promise.all([
//         userService.fetchUserWalletTransactions(wallet.id, 5),
//         userService.fetchUserInvestments(profile.id),
//       ]);

//       if (walletTransactionsError)
//         throw new Error(walletTransactionsError.message);
//       if (investmentsError) throw new Error(investmentsError.message);

//       const firstname = profile.full_name?.trim().split(/\s+/)[0] ?? "";

//       const investedAmount = investments
//         .filter((investment) =>
//           ["active", "pending"].includes(investment.status),
//         )
//         .reduce(
//           (total, investment) => total + Number(investment.amount ?? 0),
//           0,
//         );

//       const totalPortfolio = Number(wallet.balance ?? 0) + investedAmount;
//       const totalReturn = investments
//         .filter((i) => i.status !== "cancelled")
//         .reduce((total, i) => total + Number(i.expected_profit ?? 0), 0);

//       const recentTransactions = walletTransactions.slice(0, 5);

//       return {
//         firstname,
//         wallet,
//         total_return: totalReturn,
//         total_portfolio: totalPortfolio,
//         recentTransactions,
//       };
//     },
//     staleTime: 30_000,
//   });
//   return { dashboard, isPending, isError, refetch, error };
// }

export function useUser() {
  const { userId, isLoading: isSessionLoading } = useAuthSession();

  const query = useQuery({
    queryKey: profileKey(userId),
    enabled: !isSessionLoading && !!userId,
    queryFn: () => fetchProfile(userId!),
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return { ...query, isPending: isSessionLoading || query.isPending };
}

export function useUserProfile() {
  const { userId } = useAuthSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: profileKey(userId),
    enabled: !!userId,
    queryFn: () => fetchProfile(userId!),
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async (input: {
      fullName: string;
      username: string;
      phone: string;
    }) => {
      const { error } = await userService.updateProfile(input);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
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
