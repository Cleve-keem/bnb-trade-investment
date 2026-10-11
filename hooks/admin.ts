import { transactionKeys } from "@/app/api/query-key";
import { adminListTransactions, adminTransactionStats } from "@/app/api/v1/transaction/transaction";
import adminService from "@/services/admin.service";
import plansService from "@/services/investment-plan.service";
import { AdminUser } from "@/types/admin";
import { PlanInput, PlanStatus } from "@/types/plan";
import { TransactionType } from "@/types/transaction";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const ADMIN_TRANSACTIONS_PAGE_SIZE = 10;

export function useAdminDashboard() {
  const {
    data: dashboard,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard"],

    queryFn: async () => {
      const [
        { profiles, error: profileError },
        { wallets, error: walletsError },
        { investments, error: investmentsError },
        { transactions, error: transactionsError },
      ] = await Promise.all([
        adminService.fetchUserProfiles(),
        adminService.fetchUserWallets(),
        adminService.fetchAllInvestments(),
        adminService.fetchAllTransactions(),
      ]);

      if (profileError) throw new Error(profileError.message);
      if (walletsError) throw new Error(walletsError.message);
      if (investmentsError) throw new Error(investmentsError.message);
      if (transactionsError) throw new Error(transactionsError.message);
      // -------------------------
      // STATS
      // -------------------------
      const totalUsers = profiles?.length ?? 0;
      const activeUsers =
        profiles?.filter((user) => user.status === "active").length ?? 0;
      const suspendedUsers =
        profiles?.filter((user) => user.status === "suspended").length ?? 0;
      const totalWalletBalance =
        wallets?.reduce(
          (total, wallet) => total + Number(wallet.balance ?? 0),
          0,
        ) ?? 0;
      const totalInvestments = investments?.length ?? 0;

      const stats = {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalWalletBalance,
        totalInvestments,
        pendingWithdrawals: 0,
        depositsToday: 0,
        transactionsToday: 0,
        platformReturns: 0,
        activeAlerts: 0,
      };

      // -------------------------
      // RECENT TRANSACTIONS
      // -------------------------

      const recentTransactions = [...(transactions ?? [])]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5)
        .map((transaction) => ({
          id: transaction.id,
          userId: transaction.user_id,
          type: transaction.type,
          amount: Number(transaction.amount),
          status: transaction.status,
          createdAt: transaction.created_at,
        }));

      // -------------------------
      // RECENT ACTIVITY
      // -------------------------

      const recentActivity = [...(transactions ?? [])]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 8)
        .map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          description: transaction.description ?? "Transaction activity",
          createdAt: transaction.created_at,
          status: transaction.status,
        }));

      // -------------------------
      // OVERVIEW CHART
      // -------------------------

      const overviewChart = [];

      // -------------------------
      // PENDING ACTIONS
      // -------------------------

      const pendingActions = [];

      // -------------------------
      // FINAL DASHBOARD OBJECT
      // -------------------------

      return {
        stats,
        // overviewChart,
        recentActivity,
        recentTransactions,
        // pendingActions,
      };
    },

    staleTime: 30_000,
  });

  return {
    dashboard,
    isPending,
    isError,
    error,
    refetch,
  };
}

export function useAdminUsersList() {
  const {
    data: users = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-users-list"],

    queryFn: async () => {
      const [
        { profiles, error: profilesError },
        { otps, error: otpsError },
        { wallets, error: walletsError },
      ] = await Promise.all([
        adminService.fetchUserProfiles(),
        adminService.fetchUserOtps(),
        adminService.fetchUserWallets(),
      ]);

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      if (otpsError) {
        throw new Error(otpsError.message);
      }

      if (walletsError) {
        throw new Error(walletsError.message);
      }

      return (profiles ?? []).map((profile) => {
        const wallet =
          (wallets ?? []).find((wallet) => wallet.user_id === profile.id) ??
          null;

        const latestOtp =
          (otps ?? [])
            .filter((otp) => otp.user_id === profile.id)
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )[0] ?? null;

        return {
          ...profile,
          wallet,
          latest_otp: latestOtp,
        };
      });
    },

    staleTime: 30_000,
  });

  return {
    users,
    isPending,
    isError,
    error,
    refetch,
  };
}

/**
 * ============================================================
 * SINGLE ADMIN USER DETAILS
 * ============================================================
 */

export function useAdminUserDetails(userId: string) {
  return useQuery({
    queryKey: ["admin-user-details", userId],
    enabled: Boolean(userId),

    queryFn: async () => {
      const [
        userResult,
        walletResult,
        investmentsResult,
        withdrawalsResult,
        transactionsResult,
        notificationsResult,
        devicesResult,
        auditLogsResult,
      ] = await Promise.all([
        adminService.fetchUser(userId),
        adminService.fetchUserWallet(userId),
        adminService.fetchUserInvestments(userId),
        adminService.fetchUserWithdrawals(userId),
        adminService.fetchUserTransactions(userId),
        adminService.fetchUserNotifications(userId),
        adminService.fetchUserDevices(userId),
        adminService.fetchUserAuditLogs(userId),
      ]);

      if (userResult.error)
        throw new Error(`Failed to fetch user: ${userResult.error.message}`);

      if (walletResult.error)
        throw new Error(
          `Failed to fetch wallet: ${walletResult.error.message}`,
        );

      if (investmentsResult.error)
        throw new Error(
          `Failed to fetch investments: ${investmentsResult.error.message}`,
        );

      if (withdrawalsResult.error)
        throw new Error(
          `Failed to fetch withdrawals: ${withdrawalsResult.error.message}`,
        );

      if (transactionsResult.error)
        throw new Error(
          `Failed to fetch transactions: ${transactionsResult.error.message}`,
        );

      if (notificationsResult.error)
        throw new Error(
          `Failed to fetch notifications: ${notificationsResult.error.message}`,
        );

      if (devicesResult.error)
        throw new Error(
          `Failed to fetch devices: ${devicesResult.error.message}`,
        );

      if (auditLogsResult.error)
        throw new Error(
          `Failed to fetch audit logs: ${auditLogsResult.error.message}`,
        );

      return {
        user: userResult.user,
        wallet: walletResult.wallet,
        investments: investmentsResult.investments,
        withdrawals: withdrawalsResult.withdrawals,
        transactions: transactionsResult.transactions,
        notifications: notificationsResult.notifications,
        devices: devicesResult.devices,
        auditLogs: auditLogsResult.auditLogs,
      };
    },
  });
}

/**
 * ============================================================
 * ADMIN WALLET ADJUSTMENT
 * ============================================================
 */

export function useAdminWalletAdjustmentMutation(userId: string) {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const mutation = useMutation({
    mutationFn: async ({
      walletId,
      amount,
      adjustmentType,
      reason,
      notes,
    }: {
      walletId: string;
      amount: number;
      adjustmentType: "credit_correction" | "debit_correction";
      reason: string;
      notes?: string | null;
    }) => {
      const { adjustment, error } = await adminService.adjustWallet({
        walletId,
        amount,
        adjustmentType,
        reason,
        notes,
      });

      if (error) {
        throw new Error(error.message);
      }

      return adjustment;
    },

    onSuccess: () => {
      toast.success("Wallet successfully updated.");
      queryClient.invalidateQueries({
        queryKey: ["admin-user-details", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-users-list"],
      });
      setSelectedUser(null);
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to update wallet.");
    },
  });

  return {
    ...mutation,
    adjustWalletMutation: mutation,
    selectedUser,
    setSelectedUser,
  };
}

export function useUpdateBalanceMutation() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();
  const updateBalanceMutation = useMutation({
    mutationFn: async ({
      userId,
      balance,
      yieldRate,
    }: {
      userId: string;
      balance: number;
      yieldRate: number;
    }) => {
      throw new Error(
        "Direct portfolio balance updates are no longer supported. Use the secure wallet adjustment RPC.",
      );
    },

    onSuccess: () => {
      toast.success("Balance successfully updated.");
      queryClient.invalidateQueries({
        queryKey: ["admin-users-list"],
      });
      setSelectedUser(null);
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to update balance.");
    },
  });

  return {
    updateBalanceMutation,
    selectedUser,
    setSelectedUser,
  };
}

export function useToggleSuspendMutation() {
  const queryClient = useQueryClient();
  const toggleSuspendMutation = useMutation({
    mutationFn: async ({
      userId,
      suspend,
    }: {
      userId: string;
      suspend: boolean;
    }) => {
      throw new Error(
        "Direct suspension updates are disabled. Use the secure admin suspension RPC.",
      );
    },

    onSuccess: (_, variables) => {
      toast.success(
        variables.suspend
          ? "User suspended successfully."
          : "User activated successfully.",
      );
      queryClient.invalidateQueries({
        queryKey: ["admin-users-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-user-details", variables.userId],
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status.");
    },
  });

  return toggleSuspendMutation;
}

export function useAdminTransactions({
  type,
  search,
  page,
}: {
  type: TransactionType | null;
  search: string;
  page: number;
}) {
  const params = {
    type,
    search: search.trim(),
    limit: ADMIN_TRANSACTIONS_PAGE_SIZE,
    offset: (page - 1) * ADMIN_TRANSACTIONS_PAGE_SIZE,
  };

  const query = useQuery({
    queryKey: transactionKeys.adminList(params),
    queryFn: () => adminListTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  return {
    rows: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdminTransactionStats() {
  return useQuery({
    queryKey: transactionKeys.adminStats(),
    queryFn: adminTransactionStats,
    staleTime: 30_000,
  });
}

export const planKeys = {
  all: ["plans"] as const,
  adminList: () => [...planKeys.all, "admin", "list"] as const,
};

export function useAdminPlans() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: planKeys.adminList(),
    queryFn: () => plansService.list(),
    staleTime: 15_000,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: planKeys.all });
  const onError = (err: Error) =>
    toast.error(err.message || "Something went wrong.");

  const createMutation = useMutation({
    mutationFn: ({ input, status }: { input: PlanInput; status: PlanStatus }) =>
      plansService.create(input, status),
    onSuccess: () => {
      toast.success("Plan created.");
      refresh();
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PlanInput }) =>
      plansService.update(id, input),
    onSuccess: () => {
      toast.success(
        "Plan updated. Existing investments keep their original terms.",
      );
      refresh();
    },
    onError,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanStatus }) =>
      plansService.setStatus(id, status),
    onSuccess: (_, { status }) => {
      toast.success(
        status === "active"
          ? "Plan is now accepting investments."
          : status === "inactive"
            ? "Plan paused. It no longer accepts new investments."
            : "Plan archived.",
      );
      refresh();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => plansService.remove(id),
    onSuccess: () => {
      toast.success("Plan deleted.");
      refresh();
    },
    onError,
  });

  return {
    plans: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPlan: createMutation.mutateAsync,
    updatePlan: updateMutation.mutateAsync,
    setPlanStatus: statusMutation.mutateAsync,
    deletePlan: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isBusy:
      createMutation.isPending ||
      updateMutation.isPending ||
      statusMutation.isPending ||
      deleteMutation.isPending,
  };
}

// // 2. Mutation: Update User Balance & Yield
// export function useUpdateBalanceMutation() {
//   const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
//   const queryClient = useQueryClient();

//   const updateBalanceMutation = useMutation({
//     mutationFn: async ({
//       userId,
//       balance,
//       yieldRate,
//     }: {
//       userId: string;
//       balance: number;
//       yieldRate: number;
//     }) => {
//       const { error } = await supabase.from("portfolios").upsert({
//         user_id: userId,
//         total_balance: balance,
//         active_yield_rate: yieldRate,
//         updated_at: new Date().toISOString(),
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       toast.success("Investor balance node successfully updated!");
//       queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
//       setSelectedUser(null);
//     },
//     onError: (err: any) => {
//       toast.error(err.message || "Failed to commit balance update.");
//     },
//   });

//   return { updateBalanceMutation, selectedUser, setSelectedUser };
// }

// // 3. Mutation: Toggle User Suspension / Revoke Access
// export function useToggleSuspendMutation() {
//   const queryClient = useQueryClient();

//   const toggleSuspendMutation = useMutation({
//     mutationFn: async ({
//       userId,
//       suspend,
//     }: {
//       userId: string;
//       suspend: boolean;
//     }) => {
//       const { error } = await supabase
//         .from("users")
//         .update({ is_suspended: suspend })
//         .eq("id", userId);

//       if (error) throw error;
//     },
//     onSuccess: (_, variables) => {
//       toast.success(
//         variables.suspend
//           ? "Investor node isolated and suspended."
//           : "Investor profile access restored.",
//       );
//       queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
//     },
//     onError: (err: any) => {
//       toast.error(err.message || "Failed to update suspension status.");
//     },
//   });

//   return toggleSuspendMutation;
// }


