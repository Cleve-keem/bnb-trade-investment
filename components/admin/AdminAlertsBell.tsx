"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  MessageCircle,
} from "lucide-react";

import type { PendingItem } from "@/types/admin";
import { ADMIN_ROUTES } from "@/libs/formatter/admin-routes";
import { useAdminPending } from "@/hooks/admin";
import { formatUsd, timeAgo } from "@/libs/formatter/display";

const ICONS = {
  withdrawal: { Icon: ArrowUpFromLine, style: "bg-red-500/10 text-red-400" },
  deposit: {
    Icon: ArrowDownToLine,
    style: "bg-emerald-500/10 text-emerald-400",
  },
  support: { Icon: MessageCircle, style: "bg-blue-500/10 text-blue-400" },
} as const;

const LINKS = {
  withdrawal: ADMIN_ROUTES.withdrawals,
  deposit: ADMIN_ROUTES.deposits,
  support: ADMIN_ROUTES.support,
} as const;

export default function AdminAlertsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data, isPending, isError } = useAdminPending({ limit: 8 });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative rounded-xl border border-white/6 p-2.5 text-zinc-400 transition hover:bg-white/4 hover:text-white"
      >
        <Bell size={19} />
        {total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-4 top-19 z-50 overflow-hidden rounded-2xl border border-white/8 bg-[#11161d] shadow-2xl shadow-black/40 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-96">
          <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
            <p className="text-sm font-medium text-white">Needs attention</p>
            <span className="text-xs text-zinc-500">{total} total</span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isPending ? (
              <p className="p-6 text-center text-sm text-zinc-500">Loading…</p>
            ) : isError ? (
              <p className="p-6 text-center text-sm text-red-400">
                Couldn't load notifications.
              </p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">
                Nothing needs your attention.
              </p>
            ) : (
              items.map((item) => (
                <AlertRow
                  key={`${item.kind}-${item.id}`}
                  item={item}
                  onClick={() => setOpen(false)}
                />
              ))
            )}
          </div>

          {total > items.length && (
            <p className="border-t border-white/6 px-4 py-3 text-center text-xs text-zinc-500">
              +{total - items.length} more. Open the pages to see them all.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function AlertRow({
  item,
  onClick,
}: {
  item: PendingItem;
  onClick: () => void;
}) {
  const { Icon, style } = ICONS[item.kind];

  return (
    <Link
      href={LINKS[item.kind]}
      onClick={onClick}
      className="flex items-center gap-3 border-b border-white/4 px-4 py-3 transition last:border-0 hover:bg-white/3"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">
          {item.kind === "support"
            ? `Message from ${item.userName}`
            : item.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {item.kind === "support" ? item.title : item.userName} ·{" "}
          {timeAgo(item.createdAt)}
        </p>
      </div>

      {item.amount !== null && (
        <p className="shrink-0 text-sm font-medium text-white">
          {formatUsd(item.amount)}
        </p>
      )}
    </Link>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import {
//   ArrowDownToLine,
//   ArrowUpFromLine,
//   Bell,
//   MessageCircle,
// } from "lucide-react";
// import { useAdminPending } from "@/hooks/useAdminPending";
// import { ADMIN_ROUTES } from "@/libs/admin-routes";
// import { formatUsd, timeAgo } from "@/libs/display";
// import type { PendingItem } from "@/types/admin";

// const ICONS = {
//   withdrawal: { Icon: ArrowUpFromLine, style: "bg-red-500/10 text-red-400" },
//   deposit: {
//     Icon: ArrowDownToLine,
//     style: "bg-emerald-500/10 text-emerald-400",
//   },
//   support: { Icon: MessageCircle, style: "bg-blue-500/10 text-blue-400" },
// } as const;

// const LINKS = {
//   withdrawal: ADMIN_ROUTES.withdrawals,
//   deposit: ADMIN_ROUTES.deposits,
//   support: ADMIN_ROUTES.support,
// } as const;

// export default function AdminAlertsBell() {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);
//   const { data, isPending, isError } = useAdminPending({ limit: 8 });

//   const items = data?.items ?? [];
//   const total = data?.total ?? 0;

//   useEffect(() => {
//     const onClickOutside = (event: MouseEvent) => {
//       if (ref.current && !ref.current.contains(event.target as Node))
//         setOpen(false);
//     };
//     document.addEventListener("mousedown", onClickOutside);
//     return () => document.removeEventListener("mousedown", onClickOutside);
//   }, []);

//   return (
//     <div ref={ref} className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen((value) => !value)}
//         aria-label="Notifications"
//         aria-expanded={open}
//         className="relative rounded-xl border border-white/6 p-2.5 text-zinc-400 transition hover:bg-white/4 hover:text-white"
//       >
//         <Bell size={19} />
//         {total > 0 && (
//           <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
//             {total > 9 ? "9+" : total}
//           </span>
//         )}
//       </button>

//       {open && (
//         <div className="fixed inset-x-4 top-19 z-50 overflow-hidden rounded-2xl border border-white/8 bg-[#11161d] shadow-2xl shadow-black/40 sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-96">
//           <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
//             <p className="text-sm font-medium text-white">Needs attention</p>
//             <span className="text-xs text-zinc-500">{total} total</span>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {isPending ? (
//               <p className="p-6 text-center text-sm text-zinc-500">Loading…</p>
//             ) : isError ? (
//               <p className="p-6 text-center text-sm text-red-400">
//                 Couldn't load notifications.
//               </p>
//             ) : items.length === 0 ? (
//               <p className="p-6 text-center text-sm text-zinc-500">
//                 Nothing needs your attention.
//               </p>
//             ) : (
//               items.map((item) => (
//                 <AlertRow
//                   key={`${item.kind}-${item.id}`}
//                   item={item}
//                   onClick={() => setOpen(false)}
//                 />
//               ))
//             )}
//           </div>

//           {total > items.length && (
//             <p className="border-t border-white/6 px-4 py-3 text-center text-xs text-zinc-500">
//               +{total - items.length} more. Open the pages to see them all.
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function AlertRow({
//   item,
//   onClick,
// }: {
//   item: PendingItem;
//   onClick: () => void;
// }) {
//   const { Icon, style } = ICONS[item.kind];

//   return (
//     <Link
//       href={LINKS[item.kind]}
//       onClick={onClick}
//       className="flex items-center gap-3 border-b border-white/4 px-4 py-3 transition last:border-0 hover:bg-white/3"
//     >
//       <div
//         className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style}`}
//       >
//         <Icon size={16} />
//       </div>

//       <div className="min-w-0 flex-1">
//         <p className="truncate text-sm text-white">
//           {item.kind === "support"
//             ? `Message from ${item.userName}`
//             : item.title}
//         </p>
//         <p className="mt-0.5 truncate text-xs text-zinc-500">
//           {item.kind === "support" ? item.title : item.userName} ·{" "}
//           {timeAgo(item.createdAt)}
//         </p>
//       </div>

//       {item.amount !== null && (
//         <p className="shrink-0 text-sm font-medium text-white">
//           {formatUsd(item.amount)}
//         </p>
//       )}
//     </Link>
//   );
// }
