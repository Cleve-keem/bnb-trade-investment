export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "deactivated";
  first_login: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;

  wallet: {
    balance: number;
    locked_balance: number;
    status: string;
  } | null;
}

export type UserStatus = "active" | "suspended" | "deleted";
export type OtpStatus = "used" | "pending" | "Not Set";

export type AdminUser2 = {
  id: string;
  full_name: string;
  email: string;
  balance: number;
  otpStatus: OtpStatus;
  status: UserStatus;
  joined: string;
};

export type AdminDashboardStats = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalWalletBalance: number;
  totalInvestments: number;
  pendingWithdrawals: number;
  depositsToday: number;
  transactionsToday: number;
  platformReturns: number;
  activeAlerts: number;
};

export type AdminOverviewChartItem = {
  date: string;
  deposits: number;
  withdrawals: number;
  investments: number;
  returns: number;
};

export type AdminRecentActivity = {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  status?: string;
};

export type AdminRecentTransaction = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type AdminPendingAction = {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
};

export type AdminDashboard = {
  stats: AdminDashboardStats;
  overviewChart: AdminOverviewChartItem[];
  recentActivity: AdminRecentActivity[];
  recentTransactions: AdminRecentTransaction[];
  pendingActions: AdminPendingAction[];
};

// export interface AdminDashboardStats {
//   totalUsers: number;
//   totalWalletBalance: number;
//   totalInvestments: number;
//   pendingWithdrawals: number;

//   depositsToday: number;
//   transactionsToday: number;
//   platformReturns: number;
//   activeAlerts: number;
// }

// export interface AdminDashboardData {
//   stats: AdminDashboardStats;

//   recentTransactions: AdminTransaction[];

//   overviewChart: AdminOverviewPoint[];

//   recentActivity: AdminActivity[];

//   pendingActions: AdminPendingAction[];
// }
