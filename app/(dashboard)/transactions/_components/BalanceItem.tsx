import { formatMoney } from "@/libs/formatter/money";

export default function BalanceItem({
  label,
  value,
  currency,
  highlight = false,
}: {
  label: string;
  value: number;
  currency: string;
  highlight?: boolean;
}) {
  const tone = highlight
    ? value >= 0
      ? "text-emerald-400"
      : "text-white"
    : "text-zinc-300";
  const sign = highlight ? (value >= 0 ? "+" : "-") : "";

  return (
    <div className="bg-[#0d131a] px-5 py-5">
      <p className="text-xs text-zinc-600">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${tone}`}>
        {sign}
        {currency} {formatMoney(Math.abs(value))}
      </p>
    </div>
  );
}
