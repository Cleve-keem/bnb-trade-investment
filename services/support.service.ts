import { supabase } from "@/libs/supabase/browser";
import type { AutoReply, AutoReplyInput, SupportConversation, SupportMessage } from "@/types/support";

const COLUMNS =
  "id, conversation_id, user_id, sender_id, sender_role, body, read_at, created_at";

const supportService = {
  // ---------- user ----------
  async fetchMyMessages(userId: string) {
    const { data, error } = await supabase
      .from("support_messages")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    // newest first from the database, so flip it for display
    return { messages: ((data ?? []) as SupportMessage[]).reverse(), error };
  },

  async sendMyMessage(body: string) {
    const { data, error } = await supabase.rpc("send_my_support_message", {
      p_body: body,
    });
    return { message: data as SupportMessage | null, error };
  },

  async markMineRead() {
    const { error } = await supabase.rpc("mark_my_support_read");
    return { error };
  },

  async countMyUnread(userId: string) {
    const { count, error } = await supabase
      .from("support_messages")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("sender_role", "admin")
      .is("read_at", null);
    return { count: count ?? 0, error };
  },

  // ---------- admin ----------
  async listConversations() {
    const { data, error } = await supabase.rpc(
      "admin_list_support_conversations",
    );
    return { conversations: (data ?? []) as SupportConversation[], error };
  },

  async fetchThread(conversationId: string) {
    const { data, error } = await supabase
      .from("support_messages")
      .select(COLUMNS)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(200);
    return { messages: ((data ?? []) as SupportMessage[]).reverse(), error };
  },

  async reply(conversationId: string, body: string) {
    const { data, error } = await supabase.rpc("admin_reply_support", {
      p_conversation_id: conversationId,
      p_body: body,
    });
    return { message: data as SupportMessage | null, error };
  },

  async markRead(conversationId: string) {
    const { error } = await supabase.rpc("admin_mark_support_read", {
      p_conversation_id: conversationId,
    });
    return { error };
  },

  async setStatus(conversationId: string, status: "open" | "closed") {
    const { error } = await supabase.rpc("admin_set_support_status", {
      p_conversation_id: conversationId,
      p_status: status,
    });
    return { error };
  },

  async listAutoReplies() {
    const { data, error } = await supabase.rpc("admin_list_auto_replies");
    const replies: AutoReply[] = (data ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      kind: r.kind,
      keywords: r.keywords ?? [],
      reply: r.reply,
      isActive: r.is_active,
      sortOrder: r.sort_order,
    }));
    return { replies, error };
  },

  async saveAutoReply(input: AutoReplyInput) {
    const { error } = await supabase.rpc("admin_save_auto_reply", {
      p_id: input.id,
      p_name: input.name,
      p_kind: input.kind,
      p_keywords: input.keywords,
      p_reply: input.reply,
      p_is_active: input.isActive,
      p_sort_order: input.sortOrder,
    });
    return { error };
  },

  async deleteAutoReply(id: string) {
    const { error } = await supabase.rpc("admin_delete_auto_reply", {
      p_id: id,
    });
    return { error };
  },
};

export default supportService;
