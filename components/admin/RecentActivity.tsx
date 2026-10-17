"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BriefcaseBusiness,
  Wallet,
} from "lucide-react";
import type { ActivityItem } from "@/types/admin";
import { useAdminActivityAll, useAdminActivityPreview } from "@/hooks/admin";
import { formatUsd, timeAgo } from "@/libs/formatter/display";

export default function RecentActivity() {
  const [expanded, setExpanded] = useState(false);
  const preview = useAdminActivityPreview();
  const all = useAdminActivityAll(expanded);

  const items = expanded ? all.items : preview.items;
  const loading = expanded ? all.isPending : preview.isPending;
  const failed = expanded ? all.isError : preview.isError;
  const canExpand = preview.total > 5;

  return (
    <div className="min-w-0 rounded-2xl border border-white/6 bg-white/2.5 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Recent Activity</p>
          <p className="mt-1 text-xs text-zinc-500">Latest platform activity</p>
        </div>

        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="shrink-0 text-xs font-medium text-[#f0b90b] hover:underline"
          >
            {expanded ? "Show less" : "View all"}
          </button>
        )}
      </div>

      <div
        className={
          expanded ? "max-h-104 space-y-1 overflow-y-auto pr-1" : "space-y-1"
        }
      >
        {loading ? (
          <p className="py-10 text-center text-sm text-zinc-500">Loading…</p>
        ) : failed ? (
          <p className="py-10 text-center text-sm text-red-400">
            Couldn't load activity.
          </p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">
            No recent activity yet
          </p>
        ) : (
          items.map((activity) => (
            <ActivityRow key={activity.id} activity={activity} />
          ))
        )}

        {expanded && all.hasMore && (
          <button
            type="button"
            onClick={all.loadMore}
            disabled={all.isLoadingMore}
            className="mt-2 w-full rounded-xl border border-white/6 py-2.5 text-xs text-zinc-400 transition hover:bg-white/4 hover:text-white disabled:opacity-50"
          >
            {all.isLoadingMore ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/2.5">
      <ActivityIcon type={activity.type} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-zinc-300">
          <span className="font-medium text-white">{activity.user}</span>{" "}
          <span className="text-zinc-500">· {activity.description}</span>
        </p>
        <p className="mt-0.5 text-xs text-zinc-600">
          {timeAgo(activity.createdAt)}
          {activity.status !== "completed" && (
            <span className="ml-2 rounded bg-white/6 px-1.5 py-0.5 text-[10px] capitalize text-zinc-400">
              {activity.status}
            </span>
          )}
        </p>
      </div>

      <p
        className={`shrink-0 text-sm font-medium ${
          activity.amount > 0 ? "text-emerald-400" : "text-white"
        }`}
      >
        {formatUsd(activity.amount, true)}
      </p>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const classes =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl";

  if (type === "deposit") {
    return (
      <div className={`${classes} bg-emerald-500/10 text-emerald-400`}>
        <ArrowDownToLine size={17} />
      </div>
    );
  }
  if (type === "withdrawal") {
    return (
      <div className={`${classes} bg-red-500/10 text-red-400`}>
        <ArrowUpFromLine size={17} />
      </div>
    );
  }
  if (type === "investment") {
    return (
      <div className={`${classes} bg-blue-500/10 text-blue-400`}>
        <BriefcaseBusiness size={17} />
      </div>
    );
  }
  return (
    <div className={`${classes} bg-[#f0b90b]/10 text-[#f0b90b]`}>
      <Wallet size={17} />
    </div>
  );
}

// import {
//   ArrowDownToLine,
//   ArrowUpFromLine,
//   BriefcaseBusiness,
//   Wallet,
// } from "lucide-react";

// export default function RecentActivity({
//   recentActivity,
// }: {
//   recentActivity: any;
// }) {
//   return (
//     <div className="rounded-2xl border border-white/6 bg-white/2.5 p-5">
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-white">Recent Activity</p>
//           <p className="mt-1 text-xs text-zinc-500">Latest platform activity</p>
//         </div>
//         {/* <button className="text-xs font-medium text-[#f0b90b] hover:underline">
//           View all
//         </button> */}
//       </div>
//       <div className="space-y-1">
//         {recentActivity.length > 1 ? (
//           recentActivity.map((activity: any, i: number) => (
//             <div
//               key={i}
//               className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/2.5"
//             >
//               <ActivityIcon type={activity.type} />
//               <div className="min-w-0 flex-1">
//                 <p className="truncate text-sm text-zinc-300">
//                   <span className="font-medium text-white">
//                     {activity.user}
//                   </span>{" "}
//                   {activity.description}
//                 </p>
//                 <p className="mt-0.5 text-xs text-zinc-600">{activity.time}</p>
//               </div>
//               <p className="text-sm font-medium text-white">
//                 {activity.amount}
//               </p>
//             </div>
//           ))
//         ) : (
//           <div className="text-center text-zinc-500 mt-10">
//             No recent active yet
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ActivityIcon({ type }: { type: string }) {
//   const classes =
//     "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl";

//   if (type === "deposit") {
//     return (
//       <div className={`${classes} bg-emerald-500/10 text-emerald-400`}>
//         <ArrowDownToLine size={17} />
//       </div>
//     );
//   }

//   if (type === "withdrawal") {
//     return (
//       <div className={`${classes} bg-red-500/10 text-red-400`}>
//         <ArrowUpFromLine size={17} />
//       </div>
//     );
//   }

//   if (type === "investment") {
//     return (
//       <div className={`${classes} bg-blue-500/10 text-blue-400`}>
//         <BriefcaseBusiness size={17} />
//       </div>
//     );
//   }

//   return (
//     <div className={`${classes} bg-[#f0b90b]/10 text-[#f0b90b]`}>
//       <Wallet size={17} />
//     </div>
//   );
// }
