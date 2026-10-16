"use client";

import ChatThread from "@/components/bnb/support/chat-thread";
import { useAdminSupport } from "@/hooks/support";
import { useState } from "react";

export default function AdminSupportPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const support = useAdminSupport(selectedId);
  const selected = support.conversations.find(
    (c) => c.conversation_id === selectedId,
  );

  return (
    <div className="min-h-screen bg-[#080c11] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-400">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <span>Admin</span>
            <span>/</span>
            <span className="text-zinc-300">Support</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Support Inbox
          </h1>
        </div>

        <div className="grid h-[75vh] gap-4 lg:grid-cols-[340px_1fr]">
          {/* Conversation list */}
          <div className="overflow-y-auto rounded-2xl border border-white/6 bg-[#0b1016]">
            {support.conversationsLoading && (
              <p className="p-4 text-sm text-zinc-500">Loading…</p>
            )}
            {support.conversationsError && (
              <p className="p-4 text-sm text-red-400">
                {support.conversationsError.message}
              </p>
            )}
            {!support.conversationsLoading &&
              support.conversations.length === 0 && (
                <p className="p-4 text-sm text-zinc-500">
                  No conversations yet.
                </p>
              )}

            {support.conversations.map((c) => (
              <button
                key={c.conversation_id}
                onClick={() => setSelectedId(c.conversation_id)}
                className={`flex w-full items-start gap-3 border-b border-white/4 p-4 text-left transition hover:bg-white/3 ${
                  selectedId === c.conversation_id ? "bg-white/5" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {c.full_name ?? c.email}
                    </p>
                    {c.status === "closed" && (
                      <span className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-[9px] text-zinc-400">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {c.last_message_preview}
                  </p>
                </div>
                {c.unread_count > 0 && (
                  <span className="rounded-full bg-[#f0b90b] px-2 py-0.5 text-[10px] font-bold text-black">
                    {c.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Thread */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/6 bg-[#0b1016]">
            {!selected ? (
              <p className="m-auto text-sm text-zinc-500">
                Select a conversation.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold">
                      {selected.full_name ?? selected.email}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {selected.email}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      support.setStatus(
                        selected.status === "open" ? "closed" : "open",
                      )
                    }
                    className="rounded-xl border border-white/8 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5"
                  >
                    {selected.status === "open" ? "Mark resolved" : "Reopen"}
                  </button>
                </div>

                <div className="min-h-0 flex-1">
                  {support.threadLoading ? (
                    <p className="p-5 text-sm text-zinc-500">Loading…</p>
                  ) : (
                    <ChatThread
                      messages={support.messages}
                      viewer="admin"
                      onSend={support.reply}
                      sending={support.isReplying}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
