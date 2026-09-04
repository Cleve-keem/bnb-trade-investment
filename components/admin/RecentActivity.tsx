import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BriefcaseBusiness,
  Wallet,
} from "lucide-react";

const activities = [
  {
    user: "Elisa Eve",
    description: "deposited funds",
    amount: "+$10,000",
    time: "2 min ago",
    type: "deposit",
  },
  {
    user: "John Smith",
    description: "started an investment",
    amount: "$5,000",
    time: "12 min ago",
    type: "investment",
  },
  {
    user: "David James",
    description: "requested withdrawal",
    amount: "$2,500",
    time: "24 min ago",
    type: "withdrawal",
  },
  {
    user: "Sarah Adams",
    description: "received investment return",
    amount: "+$840",
    time: "41 min ago",
    type: "return",
  },
];

export default function RecentActivity() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Recent Activity</p>

          <p className="mt-1 text-xs text-zinc-500">Latest platform activity</p>
        </div>

        <button className="text-xs font-medium text-[#f0b90b] hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-1">
        {activities.map((activity) => (
          <div
            key={`${activity.user}-${activity.time}`}
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/[0.025]"
          >
            <ActivityIcon type={activity.type} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-300">
                <span className="font-medium text-white">{activity.user}</span>{" "}
                {activity.description}
              </p>

              <p className="mt-0.5 text-xs text-zinc-600">{activity.time}</p>
            </div>

            <p className="text-sm font-medium text-white">{activity.amount}</p>
          </div>
        ))}
      </div>
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
