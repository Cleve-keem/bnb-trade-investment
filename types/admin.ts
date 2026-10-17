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

export type OverviewRange = "30D" | "7M" | "12M";
export type OverviewPoint = { label: string; value: number };

export type PendingKind = "withdrawal" | "deposit" | "support";
export type PendingItem = {
  id: string;
  kind: PendingKind;
  reference: string | null;
  userName: string;
  amount: number | null;
  title: string;
  status: string;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  type: string;
  user: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type NotificationType =
  | "System"
  | "Security"
  | "Transaction"
  | "Promotion";
export type NotificationStatus = "Sent" | "Draft";
// export type NotificationStatus = "Sent" | "Draft" | "All" | "Scheduled";
export type Audience = "All Users" | "Active Users" | "Admins";

export type AdminNotification = {
  uuid: string; // used for actions
  id: string; // the reference shown on screen
  title: string;
  message: string;
  type: NotificationType;
  audience: Audience;
  status: NotificationStatus;
  createdAt: string;
  sentAt?: string;
  recipients: number;
};

export type AuditSeverity = "Info" | "Warning" | "Critical";
export type AuditLog = {
  id: string;
  actor: string;
  actorEmail: string;
  action: string;
  target: string;
  targetId: string;
  description: string;
  severity: AuditSeverity;
  ipAddress: string;
  timestamp: string;
};
export type AuditStats = {
  total: number;
  info: number;
  warning: number;
  critical: number;
};
