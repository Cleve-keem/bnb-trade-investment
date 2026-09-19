"use client";

import { Bell, CheckCheck, Trash2, X } from "lucide-react";

import NotificationItem from "./NotificationItem";
import useNotifications from "@/hooks/useNotificatiton";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {
  const {
    notifications,
    isPending,
    isError,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting,
    isClearingAll,
  } = useNotifications();
  /**
   * When panel opens, mark notifications as seen.
   *
   * This removes the bell dot.
   */
  // if (open) {
  //   // Don't call state setters directly during render.
  //   // return null;
  // }

  return (
    <>
      {open && (
        <>
          {/* Mobile backdrop */}
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />

          <div className="fixed right-4 top-19 z-80 w-[calc(100vw-32px)] max-w-105 overflow-hidden rounded-2xl border border-white/8 bg-[#111318] shadow-2xl shadow-black/40 md:right-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    Notifications
                  </h2>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#f0b90b] px-2 py-0.5 text-[10px] font-bold text-black">
                      {unreadCount}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Stay updated with your BNB account
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/6 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-2">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    disabled={isMarkingAllAsRead}
                    className="flex items-center gap-1.5 text-xs text-[#f0b90b] transition hover:text-[#f8ca3a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCheck size={14} />

                    {isMarkingAllAsRead ? "Marking..." : "Mark all as read"}
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-600">
                    All notifications read
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => clearAllNotifications()}
                  disabled={isClearingAll}
                  className="flex items-center gap-1.5 text-xs text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={14} />

                  {isClearingAll ? "Clearing..." : "Clear all"}
                </button>
              </div>
            )}

            {/* Notification list */}
            <div className="max-h-120 overflow-y-auto">
              {isPending ? (
                <div className="flex items-center justify-center px-6 py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-[#f0b90b]" />
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <Bell size={24} className="text-red-400" />

                  <h3 className="mt-3 text-sm font-medium text-white">
                    Unable to load notifications
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {error?.message ?? "Something went wrong."}
                  </p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    onRemove={deleteNotification}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                    <Bell size={24} className="text-gray-500" />
                  </div>

                  <h3 className="text-sm font-medium text-white">
                    No notifications
                  </h3>

                  <p className="mt-1 max-w-62.5 text-xs leading-5 text-gray-500">
                    You're all caught up. New account and trading updates will
                    appear here.
                  </p>
                </div>
              )}
            </div>
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/[0.07] p-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl bg-white/4 py-2.5 text-xs font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// "use client";

// import { Bell, CheckCheck, Trash2, X } from "lucide-react";
// import NotificationItem from "./NotificationItem";
// import { useNotifications } from "@/hooks/useNotificatiton";

// interface NotificationPanelProps {
//   open: boolean;
//   onClose: () => void;
// }

// export default function NotificationPanel({
//   open,
//   onClose,
// }: NotificationPanelProps) {
//  const {
//   notifications,
//   isPending,
//   isError,
//   error,
//   unreadCount,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
//   clearAllNotifications,
//   isMarkingAsRead,
//   isMarkingAllAsRead,
//   isDeleting,
//   isClearingAll,
// } = useNotifications();

//   if (!open) return null;

//   return (
//     <>
//       {/* Mobile backdrop */}
//       <button
//         type="button"
//         aria-label="Close notifications"
//         onClick={onClose}
//         className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
//       />

//       <div className="fixed right-4 top-[76px] z-50 w-[calc(100vw-32px)] max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111318] shadow-2xl shadow-black/40 md:right-6">
//         {/* Header */}
//         <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
//           <div>
//             <div className="flex items-center gap-2">
//               <h2 className="text-base font-semibold text-white">
//                 Notifications
//               </h2>

//               {unreadCount > 0 && (
//                 <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
//                   {unreadCount}
//                 </span>
//               )}
//             </div>

//             <p className="mt-1 text-xs text-gray-500">
//               Stay updated with your BNB account
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-lg p-2 text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Actions */}
//         {notifications.length > 0 && (
//           <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
//             {unreadCount > 0 ? (
//               <button
//                 type="button"
//                 onClick={markAllAsRead}
//                 className="flex items-center gap-1.5 text-xs text-blue-400 transition hover:text-blue-300"
//               >
//                 <CheckCheck size={14} />
//                 Mark all as read
//               </button>
//             ) : (
//               <span className="text-[11px] text-gray-600">
//                 All notifications read
//               </span>
//             )}

//             <button
//               type="button"
//               onClick={clearAllNotifications}
//               className="flex items-center gap-1.5 text-xs text-red-400 transition hover:text-red-300"
//             >
//               <Trash2 size={14} />
//               Clear all
//             </button>
//           </div>
//         )}

//         {/* Notifications */}
//         <div className="max-h-[480px] overflow-y-auto">
//           {!isLoaded ? (
//             <div className="flex items-center justify-center px-6 py-12">
//               <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />
//             </div>
//           ) : notifications.length > 0 ? (
//             notifications.map((notification) => (
//               <NotificationItem
//                 key={notification.id}
//                 notification={notification}
//                 onRead={markAsRead}
//                 onRemove={removeNotification}
//               />
//             ))
//           ) : (
//             <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
//               <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05]">
//                 <Bell size={24} className="text-gray-500" />
//               </div>

//               <h3 className="text-sm font-medium text-white">
//                 No notifications
//               </h3>

//               <p className="mt-1 max-w-[250px] text-xs leading-5 text-gray-500">
//                 You're all caught up. New account and trading updates will
//                 appear here.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         {notifications.length > 0 && (
//           <div className="border-t border-white/[0.07] p-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="w-full rounded-xl bg-white/[0.04] py-2.5 text-xs font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
//             >
//               Close
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }
