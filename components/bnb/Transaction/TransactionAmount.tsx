import { formatSignedAmount } from "@/libs/formatter/money";
import { TransactionStatus } from "@/types/transaction";

type TransactionAmountProps = {
  amount: number;
  status: TransactionStatus;
  currency?: string;
};

export default function TransactionAmount({
  amount,
  status,
  currency = "USD",
}: TransactionAmountProps) {
  const isFailed = status === "failed";
  const isCredit = amount > 0;

  const amountColor = isFailed
    ? "text-zinc-500 line-through"
    : isCredit
      ? "text-emerald-400"
      : amount < 0
        ? "text-zinc-200"
        : "text-zinc-400";

  return (
    <span
      className={`whitespace-nowrap text-sm font-semibold tabular-nums ${amountColor}`}
    >
      {formatSignedAmount(amount, currency)}
    </span>
  );
}
