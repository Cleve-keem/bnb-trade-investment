"use client";

import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { useAdminPending } from "@/hooks/admin";
import { ADMIN_ROUTES } from "@/libs/formatter/admin-routes";
import { formatUsd, timeAgo } from "@/libs/formatter/display";

export default function PendingActions() {
  const { data, isPending, isError } = useAdminPending({
    limit: 5,
    kinds: ["withdrawal", "deposit"],
    oldestFirst: true,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-w-0 rounded-2xl border border-white/6 bg-white/2.5 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Pending Actions</p>
          <p className="mt-1 text-xs text-zinc-500">
            Requests requiring attention
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
          {total} pending
        </span>
      </div>

      <div className="space-y-2">
        {isPending ? (
          <p className="py-8 text-center text-sm text-zinc-500">Loading…</p>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-red-400">
            Couldn't load pending requests.
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Nothing waiting. You're all caught up.
          </p>
        ) : (
          items.map((item) => {
            const isWithdrawal = item.kind === "withdrawal";
            const href = isWithdrawal
              ? ADMIN_ROUTES.withdrawals
              : ADMIN_ROUTES.deposits;

            return (
              <div
                key={`${item.kind}-${item.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-black/10 p-3"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isWithdrawal
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {isWithdrawal ? (
                    <ArrowUpFromLine size={17} />
                  ) : (
                    <ArrowDownToLine size={17} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {item.reference ?? item.title}
                    <span className="font-normal text-zinc-500">
                      {" "}
                      · {item.userName}
                    </span>
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-600">
                    <Clock3 size={11} />
                    {timeAgo(item.createdAt)}
                    {item.status === "approved" && (
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400">
                        Approved, send funds
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-white">
                    {formatUsd(item.amount ?? 0)}
                  </p>
                  <Link
                    href={href}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-[#f0b90b] hover:underline"
                  >
                    Review
                    <ChevronRight size={11} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {total > items.length && (
        <p className="mt-4 text-center text-xs text-zinc-500">
          +{total - items.length} more waiting
        </p>
      )}
    </div>
  );
}

// import { ArrowUpFromLine, Clock3, ChevronRight } from "lucide-react";

// const requests = [
//   {
//     id: "WD-82947",
//     user: "Elisa Eve",
//     amount: "$2,500",
//     time: "8 min ago",
//   },
//   {
//     id: "WD-82946",
//     user: "John Smith",
//     amount: "$1,200",
//     time: "22 min ago",
//   },
//   {
//     id: "WD-82945",
//     user: "Michael Brown",
//     amount: "$800",
//     time: "39 min ago",
//   },
// ];

// export default function PendingActions() {
//   return (
//     <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-white">Pending Actions</p>

//           <p className="mt-1 text-xs text-zinc-500">
//             Requests requiring attention
//           </p>
//         </div>

//         <span className="rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
//           {requests.length} pending
//         </span>
//       </div>

//       <div className="space-y-2">
//         {requests.map((request) => (
//           <div
//             key={request.id}
//             className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/10 p-3"
//           >
//             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
//               <ArrowUpFromLine size={17} />
//             </div>

//             <div className="min-w-0 flex-1">
//               <div className="flex items-center gap-2">
//                 <p className="text-sm font-medium text-white">{request.id}</p>

//                 <span className="h-1 w-1 rounded-full bg-zinc-700" />

//                 <p className="text-xs text-zinc-500">{request.user}</p>
//               </div>

//               <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
//                 <Clock3 size={11} />
//                 {request.time}
//               </div>
//             </div>

//             <div className="text-right">
//               <p className="text-sm font-medium text-white">{request.amount}</p>

//               <button className="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#f0b90b] hover:underline">
//                 Review
//                 <ChevronRight size={11} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
