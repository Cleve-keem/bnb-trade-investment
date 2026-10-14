"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { SupportMessage } from "@/types/support";

type Props = {
  messages: SupportMessage[];
  viewer: "user" | "admin";
  onSend: (body: string) => Promise<unknown>;
  sending: boolean;
  emptyText?: string;
};

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export default function ChatThread({
  messages,
  viewer,
  onSend,
  sending,
  emptyText = "No messages yet.",
}: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function submit() {
    const body = text.trim();
    if (!body || sending) return;
    setError(null);
    try {
      await onSend(body);
      setText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't send. Try again.",
      );
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-500">{emptyText}</p>
        )}

        {messages.map((m) => {
          const mine = m.sender_role === viewer;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "rounded-br-md bg-[#f0b90b] text-black"
                    : "rounded-bl-md border border-white/[0.06] bg-white/[0.04] text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`mt-1 text-[10px] ${mine ? "text-black/60" : "text-zinc-600"}`}
                >
                  {time(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/[0.06] p-3">
        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Type your message…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[#f0b90b]/40"
          />
          <button
            onClick={submit}
            disabled={sending || !text.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0b90b] text-black transition hover:brightness-110 disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-zinc-600">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
