"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from "lucide-react";

import type { Notification } from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void | Promise<unknown>;
  onRemove?: (id: string) => void | Promise<unknown>;
}

export default function NotificationItem({
  notification,
  onRead,
  onRemove,
}: NotificationItemProps) {
  function getNotificationIcon(type: string) {
    switch (type) {
      case "wallet_credit":
      case "deposit":
        return <ArrowDownLeft size={18} />;

      case "wallet_debit":
      case "withdrawal":
        return <ArrowUpRight size={18} />;

      case "investment":
        return <TrendingUp size={18} />;

      case "security":
        return <ShieldAlert size={18} />;

      default:
        return <Bell size={18} />;
    }
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(notification.created_at));

  return (
    <div
      className={`group relative w-full border-b border-white/[0.06] p-4 transition hover:bg-white/[0.03] ${
        !notification.is_read ? "bg-white/[0.025]" : ""
      }`}
    >
      {/* Notification content */}
      <button
        type="button"
        onClick={() => {
          if (!notification.is_read) {
            onRead(notification.id);
          }
        }}
        className="w-full text-left"
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              notification.notification_type === "security"
                ? "bg-red-500/10 text-red-400"
                : notification.notification_type === "deposit" ||
                    notification.notification_type === "wallet_credit"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : notification.notification_type === "investment"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-white/[0.06] text-gray-400"
            }`}
          >
            {getNotificationIcon(notification.notification_type)}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 pr-7">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-medium text-white">
                {notification.title}
              </h4>

              {!notification.is_read && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              )}
            </div>

            <p className="mt-1 text-xs leading-5 text-gray-400">
              {notification.body}
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
              <CheckCircle2 size={12} />
              {formattedDate}
            </div>
          </div>
        </div>
      </button>

      {/* Delete */}
      {onRemove && (
        <button
          type="button"
          aria-label="Delete notification"
          onClick={() => onRemove(notification.id)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// "use client";

// import {
//   ArrowDownLeft,
//   ArrowUpRight,
//   Bell,
//   CheckCircle2,
//   ShieldAlert,
//   TrendingUp,
//   Trash2,
// } from "lucide-react";

// import type { Notification } from "@/types/notification";

// interface NotificationItemProps {
//   notification: Notification;
//   onRead: (id: string) => void | Promise<unknown>;
//   onRemove?: (id: string) => void | Promise<unknown>;
// }

// export default function NotificationItem({
//   notification,
//   onRead,
//   onRemove,
// }: NotificationItemProps) {
//   function getNotificationIcon(type: string) {
//     switch (type) {
//       case "wallet_credit":
//       case "deposit":
//         return <ArrowDownLeft size={18} />;

//       case "wallet_debit":
//       case "withdrawal":
//         return <ArrowUpRight size={18} />;

//       case "investment":
//         return <TrendingUp size={18} />;

//       case "security":
//         return <ShieldAlert size={18} />;

//       default:
//         return <Bell size={18} />;
//     }
//   }

//   const formattedDate = new Intl.DateTimeFormat("en-US", {
//     month: "short",
//     day: "numeric",
//     hour: "numeric",
//     minute: "2-digit",
//   }).format(new Date(notification.created_at));

//   return (
//     <div
//       className={`group relative w-full border-b border-white/6 p-4 transition hover:bg-white/3 ${
//         !notification.is_read ? "bg-white/2.5" : ""
//       }`}
//     >
//       <button
//         type="button"
//         onClick={() => {
//           if (!notification.is_read) {
//             onRead(notification.id);
//           }
//         }}
//         className="w-full text-left"
//       >
//         <div className="flex gap-3">
//           <div
//             className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
//               notification.notification_type === "security"
//                 ? "bg-red-500/10 text-red-400"
//                 : notification.notification_type === "deposit" ||
//                     notification.notification_type === "wallet_credit"
//                   ? "bg-emerald-500/10 text-emerald-400"
//                   : notification.notification_type === "investment"
//                     ? "bg-blue-500/10 text-blue-400"
//                     : "bg-white/[0.06] text-gray-400"
//             }`}
//           >
//             {getNotificationIcon(notification.notification_type)}
//           </div>

//           <div className="min-w-0 flex-1 pr-7">
//             <div className="flex items-start justify-between gap-3">
//               <h4 className="text-sm font-medium text-white">
//                 {notification.title}
//               </h4>

//               {!notification.is_read && (
//                 <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
//               )}
//             </div>

//             <p className="mt-1 text-xs leading-5 text-gray-400">
//               {notification.body}
//             </p>

//             <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
//               <CheckCircle2 size={12} />
//               {formattedDate}
//             </div>
//           </div>
//         </div>
//       </button>

//       {onRemove && (
//         <button
//           type="button"
//           aria-label="Delete notification"
//           onClick={() => onRemove(notification.id)}
//           className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
//         >
//           <Trash2 size={14} />
//         </button>
//       )}
//     </div>
//   );
// }
