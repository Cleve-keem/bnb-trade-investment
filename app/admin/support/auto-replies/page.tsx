"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Info, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { AutoReply, AutoReplyKind } from "@/types/support";
import { useAutoReplies } from "@/hooks/support";

const KIND_LABEL: Record<AutoReplyKind, string> = {
  greeting: "Greeting",
  faq: "Keyword answer",
  fallback: "Fallback",
};

const KIND_HELP: Record<AutoReplyKind, string> = {
  greeting:
    "Sent when a customer starts a new chat, or writes again after you marked the chat resolved.",
  faq: "Sent when the customer's message contains one of your keywords.",
  fallback:
    "Sent when nothing else matched, so the customer knows we received their message.",
};

const KIND_STYLE: Record<AutoReplyKind, string> = {
  greeting: "bg-blue-500/10 text-blue-400",
  faq: "bg-[#f0b90b]/10 text-[#f0b90b]",
  fallback: "bg-zinc-500/10 text-zinc-400",
};

type Draft = {
  id: string | null;
  name: string;
  kind: AutoReplyKind;
  keywords: string;
  reply: string;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY: Draft = {
  id: null,
  name: "",
  kind: "faq",
  keywords: "",
  reply: "",
  isActive: true,
  sortOrder: 100,
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export default function AutoRepliesPage() {
  const { replies, isPending, isError, save, remove } = useAutoReplies();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const edit = (r: AutoReply) =>
    setDraft({
      id: r.id,
      name: r.name,
      kind: r.kind,
      keywords: r.keywords.join(", "),
      reply: r.reply,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
    });

  const submit = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await save({
        id: draft.id,
        name: draft.name,
        kind: draft.kind,
        keywords: draft.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        reply: draft.reply,
        isActive: draft.isActive,
        sortOrder: draft.sortOrder,
      });
      toast.success("Auto reply saved");
      setDraft(null);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (r: AutoReply) => {
    try {
      await save({
        id: r.id,
        name: r.name,
        kind: r.kind,
        keywords: r.keywords,
        reply: r.reply,
        isActive: !r.isActive,
        sortOrder: r.sortOrder,
      });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const destroy = async (r: AutoReply) => {
    if (!window.confirm(`Delete "${r.name}"?`)) return;
    try {
      await remove(r.id);
      toast.success("Deleted");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-[#080c11] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/admin/support"
            className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
          >
            <ChevronLeft size={14} /> Support Inbox
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Auto Replies
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Automatic messages customers get in the support chat.
              </p>
            </div>

            <button
              onClick={() => setDraft(EMPTY)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#f0b90b]/90"
            >
              <Plus size={17} />
              New auto reply
            </button>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-white/6 bg-[#0b1016] p-4 text-xs leading-5 text-zinc-400">
          <Info size={16} className="mt-0.5 shrink-0 text-[#f0b90b]" />
          <div>
            <p>
              Auto replies stay quiet for 10 minutes after one of your team
              replies.
            </p>
            <p>
              The same auto reply is never repeated in a chat within an hour.
            </p>
            <p>Customers see them labelled "Automated reply".</p>
            <p>
              Keep answers general. Never put account-specific details or
              promises you can't keep.
            </p>
          </div>
        </div>

        {isPending && <p className="text-sm text-zinc-500">Loading…</p>}
        {isError && (
          <p className="text-sm text-red-400">
            Couldn't load auto replies. Please refresh.
          </p>
        )}

        <div className="space-y-3">
          {replies.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border border-white/6 bg-[#0b1016] p-4 ${
                r.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${KIND_STYLE[r.kind]}`}
                    >
                      {KIND_LABEL[r.kind]}
                    </span>
                    {!r.isActive && (
                      <span className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        Off
                      </span>
                    )}
                  </div>

                  {r.kind === "faq" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.keywords.map((k) => (
                        <span
                          key={k}
                          className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-400"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-zinc-500">
                    {r.reply}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggle(r)}
                    aria-label={r.isActive ? "Turn off" : "Turn on"}
                    aria-pressed={r.isActive}
                    className={`relative mr-2 h-6 w-11 rounded-full transition ${
                      r.isActive ? "bg-[#f0b90b]" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        r.isActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => edit(r)}
                    aria-label="Edit"
                    className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => destroy(r)}
                    aria-label="Delete"
                    className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!isPending && replies.length === 0 && (
            <p className="py-10 text-center text-sm text-zinc-500">
              No auto replies yet.
            </p>
          )}
        </div>
      </div>

      {draft && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <button
            aria-label="Close"
            onClick={() => !saving && setDraft(null)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/8 bg-[#0b1016] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/6 p-5">
              <p className="text-lg font-semibold">
                {draft.id ? "Edit auto reply" : "New auto reply"}
              </p>
              <button
                onClick={() => setDraft(null)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-xs text-zinc-500">
                  Name (only you see this)
                </label>
                <input
                  value={draft.name}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Withdrawal question"
                  className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm outline-none focus:border-[#f0b90b]/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-zinc-500">Type</label>
                <select
                  value={draft.kind}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      kind: e.target.value as AutoReplyKind,
                    })
                  }
                  className="h-11 w-full rounded-xl border border-white/6 bg-[#111820] px-3 text-sm outline-none focus:border-[#f0b90b]/40"
                >
                  {(Object.keys(KIND_LABEL) as AutoReplyKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-zinc-600">
                  {KIND_HELP[draft.kind]}
                </p>
              </div>

              {draft.kind === "faq" && (
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Keywords (separate with commas)
                  </label>
                  <input
                    value={draft.keywords}
                    onChange={(e) =>
                      setDraft({ ...draft, keywords: e.target.value })
                    }
                    placeholder="withdraw, withdrawal, cash out"
                    className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm outline-none focus:border-[#f0b90b]/40"
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Matches if the message contains the word or phrase. "pay"
                    would also match "payment", so prefer specific words. At
                    least 3 letters each.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs text-zinc-500">
                  Reply
                </label>
                <textarea
                  value={draft.reply}
                  maxLength={1000}
                  rows={5}
                  onChange={(e) =>
                    setDraft({ ...draft, reply: e.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-white/6 bg-white/2.5 p-3 text-sm outline-none focus:border-[#f0b90b]/40"
                />
                <p className="mt-1 text-right text-[10px] text-zinc-600">
                  {draft.reply.length}/1000
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-zinc-500">
                    Priority (lower goes first)
                  </label>
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        sortOrder: Number(e.target.value) || 0,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm outline-none focus:border-[#f0b90b]/40"
                  />
                </div>

                <label className="mt-6 flex items-center gap-3 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) =>
                      setDraft({ ...draft, isActive: e.target.checked })
                    }
                    className="h-4 w-4 accent-[#f0b90b]"
                  />
                  Turned on
                </label>
              </div>

              <button
                onClick={submit}
                disabled={saving}
                className="mt-2 w-full rounded-xl bg-[#f0b90b] py-3 text-sm font-semibold text-black hover:bg-[#f0b90b]/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
