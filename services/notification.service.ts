import { supabase } from "@/libs/supabase/browser";

const notificationService = {
  async fetchUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
          id,
          user_id,
          title,
          body,
          notification_type,
          is_read,
          created_at
        `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return { notifications: data ?? [], error };
  },

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase.rpc("mark_notification_read", {
      p_notification_id: notificationId,
    });
    return { notification: data, error };
  },

  // userId no longer needed as a param — the RPC scopes to auth.uid()
  // internally — but kept here so callers don't need to change.
  async markAllNotificationsAsRead(_userId: string) {
    const { data, error } = await supabase.rpc("mark_all_notifications_read");
    return { notifications: data ?? [], error };
  },

  async deleteNotification(notificationId: string, _userId: string) {
    const { error } = await supabase.rpc("delete_notification", {
      p_notification_id: notificationId,
    });

    return { error };
  },

  async clearUserNotifications(_userId: string) {
    const { error } = await supabase.rpc("clear_user_notifications");
    return { error };
  },
};

export default notificationService;

// import { supabase } from "@/libs/supabase/browser";

// const notificationService = {
//   async fetchUserNotifications(userId: string) {
//     const { data, error } = await supabase
//       .from("notifications")
//       .select(
//         `
//           id,
//           user_id,
//           title,
//           body,
//           notification_type,
//           is_read,
//           created_at
//         `,
//       )
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false });

//     return {
//       notifications: data ?? [],
//       error,
//     };
//   },

//   async markNotificationAsRead(notificationId: string) {
//     const { data, error } = await supabase
//       .from("notifications")
//       .update({
//         is_read: true,
//         read_at: new Date().toISOString(),
//       })
//       .eq("id", notificationId)
//       .select()
//       .single();

//     return {
//       notification: data,
//       error,
//     };
//   },

//   async markAllNotificationsAsRead(userId: string) {
//     const { data, error } = await supabase
//       .from("notifications")
//       .update({
//         is_read: true,
//         read_at: new Date().toISOString(),
//       })
//       .eq("user_id", userId)
//       .eq("is_read", false)
//       .select();

//     return {
//       notifications: data ?? [],
//       error,
//     };
//   },

//   async deleteNotification(notificationId: string, userId: string) {
//     const { error } = await supabase
//       .from("notifications")
//       .delete()
//       .eq("id", notificationId)
//       .eq("user_id", userId);

//     return {
//       error,
//     };
//   },

//   async clearUserNotifications(userId: string) {
//     const { error } = await supabase
//       .from("notifications")
//       .delete()
//       .eq("user_id", userId);

//     return {
//       error,
//     };
//   },
// };

// export default notificationService;
