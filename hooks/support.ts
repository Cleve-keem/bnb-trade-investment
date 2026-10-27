"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/libs/supabase/browser";
import supportService from "@/services/support.service";
import type { SupportMessage } from "@/types/support";
import { useAuthSession } from "./useAuthSession";
import type { AutoReplyInput } from "@/types/support";

const append = (old: SupportMessage[] = [], msg: SupportMessage) =>
  old.some((m) => m.id === msg.id)
    ? old
    : [...old, msg].sort((a, b) => a.created_at.localeCompare(b.created_at));

export function useSupportChat() {
  const { userId } = useAuthSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["support", "messages", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { messages, error } = await supportService.fetchMyMessages(userId!);
      if (error) throw new Error(error.message);
      return messages;
    },
    staleTime: 30_000,
  });

  // Live: new messages appear without refreshing
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`support-chat-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          queryClient.setQueryData<SupportMessage[]>(
            ["support", "messages", userId],
            (old) => append(old, payload.new as SupportMessage),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Mark admin replies as read while the chat is open
  const hasUnread = (query.data ?? []).some(
    (m) => m.sender_role === "admin" && !m.read_at,
  );

  useEffect(() => {
    if (!hasUnread || !userId) return;

    supportService.markMineRead().then(({ error }) => {
      if (error) return;
      const now = new Date().toISOString();
      queryClient.setQueryData<SupportMessage[]>(
        ["support", "messages", userId],
        (old = []) => old.map((m) => (m.read_at ? m : { ...m, read_at: now })),
      );
      queryClient.invalidateQueries({ queryKey: ["support", "unread"] });
    });
  }, [hasUnread, userId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const { message, error } = await supportService.sendMyMessage(body);
      if (error) throw new Error(error.message);
      return message!;
    },
    onSuccess: (message) => {
      queryClient.setQueryData<SupportMessage[]>(
        ["support", "messages", userId],
        (old) => append(old, message),
      );
    },
  });

  return {
    messages: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    send: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
  };
}

export function useSupportUnread() {
  const { userId } = useAuthSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["support", "unread", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supportService.countMyUnread(userId!);
      if (error) throw new Error(error.message);
      return count;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`support-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `user_id=eq.${userId}`,
        },
        () =>
          queryClient.invalidateQueries({ queryKey: ["support", "unread"] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return { unread: query.data ?? 0 };
}

// const append = (old: SupportMessage[] = [], msg: SupportMessage) =>
//   old.some((m) => m.id === msg.id) ? old : [...old, msg];

export function useAdminSupport(selectedId: string | null) {
  const queryClient = useQueryClient();

  const conversations = useQuery({
    queryKey: ["admin", "support", "conversations"],
    queryFn: async () => {
      const { conversations, error } = await supportService.listConversations();
      if (error) throw new Error(error.message);
      return conversations;
    },
  });

  const thread = useQuery({
    queryKey: ["admin", "support", "thread", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { messages, error } = await supportService.fetchThread(selectedId!);
      if (error) throw new Error(error.message);
      return messages;
    },
  });

  // Live: admins can see every new message (the database allows it)
  useEffect(() => {
    const channel = supabase
      .channel("admin-support")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const msg = payload.new as SupportMessage;
          queryClient.invalidateQueries({
            queryKey: ["admin", "support", "conversations"],
          });
          if (msg.conversation_id === selectedId) {
            queryClient.setQueryData<SupportMessage[]>(
              ["admin", "support", "thread", selectedId],
              (old) => append(old, msg),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, queryClient]);

  // Mark the customer's messages as read while the thread is open
  const hasUnread = (thread.data ?? []).some(
    (m) => m.sender_role === "user" && !m.read_at,
  );

  useEffect(() => {
    if (!selectedId || !hasUnread) return;

    supportService.markRead(selectedId).then(({ error }) => {
      if (error) return;
      const now = new Date().toISOString();
      queryClient.setQueryData<SupportMessage[]>(
        ["admin", "support", "thread", selectedId],
        (old = []) => old.map((m) => (m.read_at ? m : { ...m, read_at: now })),
      );
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "conversations"],
      });
    });
  }, [selectedId, hasUnread, queryClient]);

  const replyMutation = useMutation({
    mutationFn: async (body: string) => {
      const { message, error } = await supportService.reply(selectedId!, body);
      if (error) throw new Error(error.message);
      return message!;
    },
    onSuccess: (message) => {
      queryClient.setQueryData<SupportMessage[]>(
        ["admin", "support", "thread", selectedId],
        (old) => append(old, message),
      );
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "conversations"],
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: "open" | "closed") => {
      const { error } = await supportService.setStatus(selectedId!, status);
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "support", "conversations"],
      }),
  });

  return {
    conversations: conversations.data ?? [],
    conversationsLoading: conversations.isPending,
    conversationsError: conversations.error as Error | null,
    messages: thread.data ?? [],
    threadLoading: !!selectedId && thread.isPending,
    reply: replyMutation.mutateAsync,
    isReplying: replyMutation.isPending,
    setStatus: statusMutation.mutate,
  };
}

const KEY = ["admin", "support", "auto-replies"];

export function useAutoReplies() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: KEY });
    queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
  };

  const query = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { replies, error } = await supportService.listAutoReplies();
      if (error) throw new Error(error.message);
      return replies;
    },
    staleTime: 30_000,
  });

  const save = useMutation({
    mutationFn: async (input: AutoReplyInput) => {
      const { error } = await supportService.saveAutoReply(input);
      if (error) throw new Error(error.message);
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supportService.deleteAutoReply(id);
      if (error) throw new Error(error.message);
    },
    onSuccess: refresh,
  });

  return {
    replies: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    save: save.mutateAsync,
    remove: remove.mutateAsync,
  };
}
