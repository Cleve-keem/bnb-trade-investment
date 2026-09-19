export type NotificationType =
  | "wallet_credit"
  | "wallet_debit"
  | "deposit"
  | "withdrawal"
  | "investment"
  | "security"
  | "system";

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
};
