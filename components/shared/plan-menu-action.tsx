"use client";

import { useState } from "react";
import {
  Archive,
  Check,
  Edit3,
  MoreHorizontal,
  Pause,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { AdminPlanRow, PlanStatus } from "@/types/plan";


const itemClass =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition";

export default function PlanActionsMenu({
  plan,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  plan: AdminPlanRow;
  onEdit: () => void;
  onStatusChange: (status: PlanStatus) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  const canDelete = plan.lifetime_investments === 0;

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Plan actions"
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-xl border border-white/8 bg-[#11171f] p-1.5 shadow-2xl">
            <button
              type="button"
              onClick={run(onEdit)}
              className={`${itemClass} text-zinc-300 hover:bg-white/5 hover:text-white`}
            >
              <Edit3 size={15} /> Edit plan
            </button>

            {plan.status === "active" && (
              <button
                type="button"
                onClick={run(() => onStatusChange("inactive"))}
                className={`${itemClass} text-zinc-300 hover:bg-white/5 hover:text-white`}
              >
                <Pause size={15} /> Deactivate
              </button>
            )}
            {plan.status === "inactive" && (
              <button
                type="button"
                onClick={run(() => onStatusChange("active"))}
                className={`${itemClass} text-emerald-400 hover:bg-emerald-500/10`}
              >
                <Check size={15} /> Activate
              </button>
            )}
            {plan.status === "archived" && (
              <button
                type="button"
                onClick={run(() => onStatusChange("inactive"))}
                className={`${itemClass} text-zinc-300 hover:bg-white/5 hover:text-white`}
              >
                <RotateCcw size={15} /> Restore
              </button>
            )}
            {plan.status !== "archived" && (
              <button
                type="button"
                onClick={run(() => onStatusChange("archived"))}
                className={`${itemClass} text-zinc-300 hover:bg-white/5 hover:text-white`}
              >
                <Archive size={15} /> Archive
              </button>
            )}

            <div className="my-1 border-t border-white/5" />

            <button
              type="button"
              disabled={!canDelete}
              onClick={run(onDelete)}
              title={
                canDelete
                  ? undefined
                  : "This plan has investments. Archive it instead."
              }
              className={`${itemClass} text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent`}
            >
              <Trash2 size={15} /> Delete plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}
