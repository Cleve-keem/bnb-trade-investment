"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Plan } from "@/types/investment";
import { getInvestErrorMessage, invest } from "../services/investment.service";
import { formatCurrency } from "@/libs/formatter/money";


type Props = {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
};

export function InvestModal({ plan, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = Number(amount);
  const tooLow = value > 0 && value < plan.minimumAmount;
  const tooHigh = plan.maximumAmount !== null && value > plan.maximumAmount;
  const valid = value > 0 && !tooLow && !tooHigh;

  // Preview only. The database calculates the real figure.
  const estimatedProfit = valid ? (value * plan.roi) / 100 : 0;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await invest(plan.id, value);
      onSuccess();
    } catch (err) {
      setError(getInvestErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={() => !submitting && onClose()}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/8 bg-[#0d131a] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600">
              Invest in
            </p>
            <h2 className="mt-1 text-lg font-semibold">{plan.name}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mt-6 block text-xs text-zinc-500">Amount (USD)</label>
        <input
          type="number"
          inputMode="decimal"
          min={plan.minimumAmount}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Min ${formatCurrency(plan.minimumAmount)}`}
          className="mt-2 h-11 w-full rounded-xl border border-white/6 bg-white/3 px-4 text-sm outline-none focus:border-[#f0b90b]/40"
        />

        {tooLow && (
          <p className="mt-2 text-xs text-red-400">
            Minimum is {formatCurrency(plan.minimumAmount)}.
          </p>
        )}
        {tooHigh && (
          <p className="mt-2 text-xs text-red-400">
            Maximum is {formatCurrency(plan.maximumAmount!)}.
          </p>
        )}

        <div className="mt-5 space-y-2 rounded-xl border border-white/6 bg-white/2 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">ROI</span>
            <span>{plan.roi}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Duration</span>
            <span>{plan.durationDays} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Estimated profit</span>
            <span className="text-emerald-400">
              +{formatCurrency(estimatedProfit)}
            </span>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <button
          onClick={submit}
          disabled={!valid || submitting}
          className="mt-6 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Confirm Investment"}
        </button>
        <p className="mt-3 text-center text-[11px] text-zinc-600">
          The amount is taken from your available wallet balance.
        </p>
      </div>
    </div>
  );
}
