export default function BalanceItem({
  label,
  value,
  currency,
  highlight = false,
}: {
  label: string;
  value: number | null;
  currency: string | null;
  highlight?: boolean;
}) {
  const amount = Number(value ?? 0);

  return (
    <div className="bg-[#0d131a] px-5 py-5">
      <p className="text-xs text-zinc-600">{label}</p>

      <p
        className={`mt-2 text-lg font-semibold ${
          highlight
            ? amount >= 0
              ? "text-emerald-400"
              : "text-white"
            : "text-zinc-300"
        }`}
      >
        {highlight && amount >= 0 ? "+" : ""}
        {highlight && amount < 0 ? "-" : ""}
        {currency ?? "USD"} {Math.abs(amount).toLocaleString()}
      </p>
    </div>
  );
}
