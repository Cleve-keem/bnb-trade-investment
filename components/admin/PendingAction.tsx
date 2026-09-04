import { ArrowUpFromLine, Clock3, ChevronRight } from "lucide-react";

const requests = [
  {
    id: "WD-82947",
    user: "Elisa Eve",
    amount: "$2,500",
    time: "8 min ago",
  },
  {
    id: "WD-82946",
    user: "John Smith",
    amount: "$1,200",
    time: "22 min ago",
  },
  {
    id: "WD-82945",
    user: "Michael Brown",
    amount: "$800",
    time: "39 min ago",
  },
];

export default function PendingActions() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Pending Actions</p>

          <p className="mt-1 text-xs text-zinc-500">
            Requests requiring attention
          </p>
        </div>

        <span className="rounded-full bg-[#f0b90b]/10 px-2.5 py-1 text-[10px] font-medium text-[#f0b90b]">
          {requests.length} pending
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/10 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <ArrowUpFromLine size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{request.id}</p>

                <span className="h-1 w-1 rounded-full bg-zinc-700" />

                <p className="text-xs text-zinc-500">{request.user}</p>
              </div>

              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
                <Clock3 size={11} />
                {request.time}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-white">{request.amount}</p>

              <button className="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#f0b90b] hover:underline">
                Review
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
