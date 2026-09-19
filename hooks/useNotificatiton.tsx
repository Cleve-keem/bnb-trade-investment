"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "./useAuthSession";
import notificationService from "@/services/notification.service";

export default function useNotifications() {
  const { userId, isLoading: isSessionLoading } = useAuthSession();
  const queryClient = useQueryClient();
  const queryKey = ["user", "notifications", userId];

  const {
    data: notifications = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey,
    enabled: !isSessionLoading && !!userId,
    queryFn: async () => {
      if (!userId) return [];

      const { notifications, error } =
        await notificationService.fetchUserNotifications(userId);

      if (error) {
        throw new Error(error.message);
      }

      return notifications;
    },
    staleTime: 30_000,
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.is_read).length;
  }, [notifications]);

  const hasNewNotifications = unreadCount > 0;

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { notification, error } =
        await notificationService.markNotificationAsRead(notificationId);

      if (error) throw new Error(error.message);
      return notification;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No authenticated user.");

      const { error } =
        await notificationService.markAllNotificationsAsRead(userId);

      if (error) throw new Error(error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) throw new Error("No authenticated user.");

      const { error } = await notificationService.deleteNotification(
        notificationId,
        userId,
      );

      if (error) throw new Error(error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No authenticated user.");

      const { error } =
        await notificationService.clearUserNotifications(userId);

      if (error) throw new Error(error.message);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });

  return {
    notifications,
    unreadCount,
    hasNewNotifications,
    isPending,
    isError,
    error,

    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    clearAllNotifications: clearAllMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isClearingAll: clearAllMutation.isPending,
  };
}

// // "use client";

// // import { useEffect, useMemo, useState } from "react";

// // import {
// //   notifications as defaultNotifications,
// //   type Notification,
// // } from "@/libs/bnb/demo-data"

// // const STORAGE_KEY = "bnb-notifications";

// // export function useNotifications() {
// //   const [notifications, setNotifications] = useState<Notification[]>([]);
// //   const [isLoaded, setIsLoaded] = useState(false);

// //   /**
// //    * Load notifications from localStorage.
// //    *
// //    * If the user has never used notifications before,
// //    * we use the default notifications.
// //    */
// //   useEffect(() => {
// //     try {
// //       const stored = localStorage.getItem(STORAGE_KEY);

// //       if (stored) {
// //         const parsed: Notification[] = JSON.parse(stored);

// //         setNotifications(parsed);
// //       } else {
// //         setNotifications(defaultNotifications);
// //       }
// //     } catch (error) {
// //       console.error("Failed to load notifications:", error);

// //       setNotifications(defaultNotifications);
// //     } finally {
// //       setIsLoaded(true);
// //     }
// //   }, []);

// //   /**
// //    * Save notifications whenever they change.
// //    */
// //   useEffect(() => {
// //     if (!isLoaded) return;

// //     try {
// //       localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
// //     } catch (error) {
// //       console.error("Failed to save notifications:", error);
// //     }
// //   }, [notifications, isLoaded]);

// //   /**
// //    * Number of unread notifications.
// //    */
// //   const unreadCount = useMemo(() => {
// //     return notifications.filter((notification) => !notification.read).length;
// //   }, [notifications]);

// //   /**
// //    * Mark a notification as read.
// //    */
// //   const markAsRead = (id: string) => {
// //     setNotifications((current) =>
// //       current.map((notification) =>
// //         notification.id === id
// //           ? {
// //               ...notification,
// //               read: true,
// //             }
// //           : notification,
// //       ),
// //     );
// //   };

// //   /**
// //    * Mark every notification as read.
// //    */
// //   const markAllAsRead = () => {
// //     setNotifications((current) =>
// //       current.map((notification) => ({
// //         ...notification,
// //         read: true,
// //       })),
// //     );
// //   };

// //   /**
// //    * Permanently remove one notification.
// //    */
// //   const removeNotification = (id: string) => {
// //     setNotifications((current) =>
// //       current.filter((notification) => notification.id !== id),
// //     );
// //   };

// //   /**
// //    * Permanently remove all notifications.
// //    */
// //   const clearAllNotifications = () => {
// //     setNotifications([]);
// //   };

// //   return {
// //     notifications,
// //     unreadCount,
// //     isLoaded,
// //     markAsRead,
// //     markAllAsRead,
// //     removeNotification,
// //     clearAllNotifications,
// //   };
// // }

// "use client";

// import { useEffect, useMemo, useState } from "react";

// import {
//   notifications as defaultNotifications,
//   type Notification,
// } from "@/libs/bnb/demo-data";

// const STORAGE_KEY = "bnb-notifications";
// const SEEN_KEY = "bnb-notifications-seen";

// export function useNotifications() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [hasNewNotifications, setHasNewNotifications] = useState(false);
//   const [isLoaded, setIsLoaded] = useState(false);

//   /**
//    * Load notifications from localStorage
//    */
//   useEffect(() => {
//     try {
//       const storedNotifications = localStorage.getItem(STORAGE_KEY);

//       const storedSeen = localStorage.getItem(SEEN_KEY);

//       if (storedNotifications !== null) {
//         setNotifications(JSON.parse(storedNotifications));
//       } else {
//         setNotifications(defaultNotifications);
//       }

//       if (storedSeen !== null) {
//         setHasNewNotifications(storedSeen !== "true");
//       } else {
//         // First visit: show notification indicator
//         setHasNewNotifications(true);
//       }
//     } catch (error) {
//       console.error("Failed to load notifications:", error);

//       setNotifications(defaultNotifications);
//       setHasNewNotifications(true);
//     } finally {
//       setIsLoaded(true);
//     }
//   }, []);

//   /**
//    * Persist notifications
//    */
//   useEffect(() => {
//     if (!isLoaded) return;

//     try {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
//     } catch (error) {
//       console.error("Failed to save notifications:", error);
//     }
//   }, [notifications, isLoaded]);

//   /**
//    * Persist notification indicator state
//    */
//   useEffect(() => {
//     if (!isLoaded) return;

//     try {
//       localStorage.setItem(SEEN_KEY, hasNewNotifications ? "false" : "true");
//     } catch (error) {
//       console.error("Failed to save notification state:", error);
//     }
//   }, [hasNewNotifications, isLoaded]);

//   /**
//    * Number of unread notifications
//    */
//   const unreadCount = useMemo(() => {
//     return notifications.filter((notification) => !notification.read).length;
//   }, [notifications]);

//   /**
//    * Called when the bell/panel is opened.
//    *
//    * This removes the NEW indicator but does not mark
//    * individual notifications as read.
//    */
//   const markNotificationsAsSeen = () => {
//     setHasNewNotifications(false);
//   };

//   /**
//    * Mark one notification as read
//    */
//   const markAsRead = (id: string) => {
//     setNotifications((current) =>
//       current.map((notification) =>
//         notification.id === id
//           ? {
//               ...notification,
//               read: true,
//             }
//           : notification,
//       ),
//     );
//   };

//   /**
//    * Mark all notifications as read
//    */
//   const markAllAsRead = () => {
//     setNotifications((current) =>
//       current.map((notification) => ({
//         ...notification,
//         read: true,
//       })),
//     );
//   };

//   /**
//    * Remove one notification
//    */
//   const removeNotification = (id: string) => {
//     setNotifications((current) =>
//       current.filter((notification) => notification.id !== id),
//     );
//   };

//   /**
//    * Remove all notifications
//    */
//   const clearAllNotifications = () => {
//     setNotifications([]);
//   };

//   /**
//    * Add a new notification.
//    *
//    * This is useful later when Supabase creates
//    * real notifications.
//    */
//   const addNotification = (notification: Notification) => {
//     setNotifications((current) => [notification, ...current]);

//     setHasNewNotifications(true);
//   };

//   return {
//     notifications,
//     unreadCount,
//     hasNewNotifications,
//     isLoaded,

//     markNotificationsAsSeen,
//     markAsRead,
//     markAllAsRead,
//     removeNotification,
//     clearAllNotifications,
//     addNotification,
//   };
// }
