"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { AdminPlanRow, PlanInput, PlanStatus } from "@/types/plan";
import { DurationUnit, formatDuration, splitDuration, toDays } from "@/libs/formatter/duration";
import { formatPlanAmount } from "@/libs/formatter/format";

const inputClass =
  "h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#f0b90b]/40";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-zinc-400">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-[11px] text-zinc-600">{hint}</span>
      )}
    </label>
  );
}

export default function PlanFormModal({
  plan,
  isSaving,
  onClose,
  onSubmit,
}: {
  plan: AdminPlanRow | null; // null = create
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: PlanInput, status: PlanStatus) => Promise<void>;
}) {
  const initial = plan ? splitDuration(plan.duration_days) : null;

  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [roi, setRoi] = useState(plan ? String(plan.roi_percentage) : "");
  const [duration, setDuration] = useState(
    initial ? String(initial.value) : "",
  );
  const [unit, setUnit] = useState<DurationUnit>(initial?.unit ?? "days");
  const [minimum, setMinimum] = useState(
    plan ? String(plan.minimum_amount) : "",
  );
  const [maximum, setMaximum] = useState(
    plan?.maximum_amount != null ? String(plan.maximum_amount) : "",
  );
  const [status, setStatus] = useState<PlanStatus>("active");
  const [error, setError] = useState<string | null>(null);

  const minN = Number(minimum);
  const roiN = Number(roi);
  const durN = Number(duration);
  const hasPreview =
    minN > 0 && roiN > 0 && roiN <= 100 && Number.isInteger(durN) && durN >= 1;
  const previewProfit = hasPreview ? Math.round(minN * roiN) / 100 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    const maxN = maximum.trim() === "" ? null : Number(maximum);

    if (!name.trim()) return setError("Plan name is required.");
    if (!(minN > 0))
      return setError("Minimum investment must be greater than zero.");
    if (maxN !== null && !(maxN >= minN))
      return setError("Maximum can't be lower than the minimum.");
    if (!(roiN > 0 && roiN <= 100))
      return setError("ROI must be greater than 0 and at most 100.");
    if (!Number.isInteger(durN) || durN < 1)
      return setError("Duration must be a whole number of at least 1.");

    setError(null);
    try {
      await onSubmit(
        {
          name: name.trim(),
          description: description.trim(),
          minimumAmount: minN,
          maximumAmount: maxN,
          roiPercentage: roiN,
          durationDays: toDays(durN, unit),
        },
        status,
      );
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={() => !isSaving && onClose()}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/8 bg-[#0d131a] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-[#0d131a] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">
              {plan ? "Edit investment plan" : "Create investment plan"}
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Configure the plan details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          {plan && plan.lifetime_investments > 0 && (
            <div className="rounded-xl border border-[#f0b90b]/15 bg-[#f0b90b]/5 px-4 py-3 text-xs leading-5 text-[#f0b90b]/90">
              This plan already has investments. Changes only apply to new
              investments. Existing ones keep the terms they were bought under.
            </div>
          )}

          <Field label="Plan name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Growth Plan"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe this investment plan..."
              className={`${inputClass} h-auto resize-none py-3`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ROI (%)">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={roi}
                onChange={(e) => setRoi(e.target.value)}
                placeholder="12"
                className={inputClass}
              />
            </Field>

            <Field label="Duration">
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="90"
                  className={inputClass}
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as DurationUnit)}
                  className="w-28 shrink-0 rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm text-white outline-none focus:border-[#f0b90b]/40"
                >
                  <option value="days" className="bg-[#0d131a]">
                    Days
                  </option>
                  <option value="months" className="bg-[#0d131a]">
                    Months
                  </option>
                </select>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Minimum investment (USD)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={minimum}
                onChange={(e) => setMinimum(e.target.value)}
                placeholder="1000"
                className={inputClass}
              />
            </Field>

            <Field
              label="Maximum investment (USD)"
              hint="Leave empty for no maximum."
            >
              <input
                type="number"
                min="0"
                step="0.01"
                value={maximum}
                onChange={(e) => setMaximum(e.target.value)}
                placeholder="No maximum"
                className={inputClass}
              />
            </Field>
          </div>

          {!plan && (
            <Field
              label="Status"
              hint="Inactive plans are hidden from users until you activate them."
            >
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlanStatus)}
                className={inputClass}
              >
                <option value="active" className="bg-[#0d131a]">
                  Active
                </option>
                <option value="inactive" className="bg-[#0d131a]">
                  Inactive
                </option>
              </select>
            </Field>
          )}

          {hasPreview && (
            <p className="rounded-xl border border-white/5 bg-white/1.5 px-4 py-3 text-xs text-zinc-400">
              Example: {formatPlanAmount(minN)} earns{" "}
              <span className="font-medium text-emerald-400">
                {formatPlanAmount(previewProfit)}
              </span>{" "}
              after {formatDuration(toDays(durN, unit))}.
            </p>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-white/6 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-white/6 bg-white/2 px-5 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f6c62f] disabled:opacity-60"
            >
              {isSaving && <Loader2 size={15} className="animate-spin" />}
              {isSaving ? "Saving..." : plan ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
