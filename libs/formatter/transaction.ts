export function getTransactionCategory(transactionType: string) {
  if (transactionType === "deposit" || transactionType === "admin_credit") {
    return "Deposit";
  }

  if (transactionType === "withdrawal" || transactionType === "admin_debit") {
    return "Withdrawal";
  }

  if (transactionType === "investment") {
    return "Investment";
  }

  return "Other";
}

export function getTransactionDirection(amount: number) {
  return amount >= 0 ? "Credit" : "Debit";
}
