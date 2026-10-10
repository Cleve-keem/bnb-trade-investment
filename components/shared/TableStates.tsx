"use client";

import type { LucideIcon } from "lucide-react";

export function TableLoadingState({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-white/4" />
      ))}
    </div>
  );
}

export function TableErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <p className="text-sm text-red-400">
        {message || "Something went wrong."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-white/6 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
      >
        Try again
      </button>
    </div>
  );
}

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/4 text-zinc-600">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="mt-1 max-w-sm text-xs text-zinc-600">{description}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 rounded-lg bg-white/6 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
