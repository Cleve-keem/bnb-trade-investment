import { formatUsd } from "./display";

const ACTION_LABELS: Record<string, string> = {
  admin_adjust_wallet: "Wallet Adjustment",
  approve_withdrawal: "Withdrawal Approved",
  reject_withdrawal: "Withdrawal Rejected",
  complete_withdrawal: "Withdrawal Completed",
  create_investment: "Investment Created",
  complete_investment: "Investment Completed",
  cancel_investment: "Investment Cancelled",
  create_plan: "Plan Created",
  update_plan: "Plan Updated",
  set_plan_status: "Plan Status Changed",
  delete_plan: "Plan Deleted",
  send_notification: "Notification Sent",
  delete_notification: "Notification Deleted",
};

export const titleCase = (text: string) =>
  text.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export const actionLabel = (action: string) =>
  ACTION_LABELS[action] ?? titleCase(action);

export function describeAudit(action: string, meta: Record<string, any> = {}) {
  const usd = (value: unknown) => formatUsd(Math.abs(Number(value ?? 0)));
  const plan = meta.name ?? meta.after?.name ?? meta.before?.name ?? "a plan";

  switch (action) {
    case "admin_adjust_wallet":
      return `${Number(meta.amount) >= 0 ? "Credited" : "Debited"} ${usd(meta.amount)}${
        meta.reason ? `: ${meta.reason}` : ""
      }`;
    case "approve_withdrawal":
      return `Approved a withdrawal of ${usd(meta.amount)}`;
    case "reject_withdrawal":
      return `Rejected a withdrawal${meta.reason ? `: ${meta.reason}` : ""}`;
    case "complete_withdrawal":
      return `Completed a withdrawal of ${usd(meta.amount)}`;
    case "create_investment":
      return `Invested ${usd(meta.amount)}`;
    case "complete_investment":
      return `Investment matured, ${usd(meta.total_return)} paid out`;
    case "cancel_investment":
      return `Cancelled an investment and refunded ${usd(meta.amount_refunded)}`;
    case "create_plan":
      return `Created ${plan}`;
    case "update_plan":
      return `Updated ${plan}`;
    case "set_plan_status":
      return `Set ${plan} to ${meta.status}`;
    case "delete_plan":
      return `Deleted ${plan}`;
    case "send_notification":
      return `Sent "${meta.title}" to ${meta.audience} (${meta.recipients})`;
    case "delete_notification":
      return `Deleted draft "${meta.title}"`;
    default:
      return actionLabel(action);
  }
}
