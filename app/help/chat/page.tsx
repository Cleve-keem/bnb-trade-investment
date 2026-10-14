"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import { useSupportChat } from "@/hooks/support";
import ChatThread from "@/components/bnb/support/chat-thread";

export default function SupportChatPage() {
  const { messages, isPending, isError, send, isSending } = useSupportChat();

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <Link
            href="/help"
            className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
          >
            <ChevronLeft size={14} /> Help
          </Link>
          <h1 className="text-2xl font-semibold">Chat with Support</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Our team replies here. You'll see a badge when there's a new reply.
          </p>
        </div>

        <div className="h-[70vh] overflow-hidden rounded-2xl border border-white/6 bg-[#0d131a]">
          {isPending ? (
            <p className="p-6 text-sm text-zinc-500">Loading…</p>
          ) : isError ? (
            <p className="p-6 text-sm text-red-400">
              Couldn't load the chat. Please refresh.
            </p>
          ) : (
            <ChatThread
              messages={messages}
              viewer="user"
              onSend={send}
              sending={isSending}
              emptyText="Say hello. Tell us what you need help with."
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
