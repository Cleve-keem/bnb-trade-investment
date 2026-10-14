export type SupportMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  sender_id: string | null;
  sender_role: "user" | "admin";
  body: string;
  read_at: string | null;
  created_at: string;
};

export type SupportConversation = {
  conversation_id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  status: "open" | "closed";
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
};
