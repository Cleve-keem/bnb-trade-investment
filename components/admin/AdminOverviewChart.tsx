"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { OverviewRange } from "@/types/admin";
import { useAdminOverview } from "@/hooks/admin";
import { formatCompactUsd, formatUsd } from "@/libs/formatter/display";

const RANGES: { value: OverviewRange; label: string }[] = [
  { value: "30D", label: "30 days" },
  { value: "7M", label: "7 months" },
  { value: "12M", label: "12 months" },
];

export default function AdminOverviewChart() {
  const [range, setRange] = useState<OverviewRange>("7M");
  const { data = [], isPending, isError } = useAdminOverview(range);

  const latest = data.length ? data[data.length - 1].value : 0;

  return (
    <div className="min-w-0 rounded-2xl border border-white/6 bg-white/2.5 p-4 sm:p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Platform Overview</p>
          <p className="mt-1 text-xs text-zinc-500">
            Total invested:{" "}
            <span className="text-zinc-300">{formatUsd(latest)}</span>
          </p>
        </div>

        <select
          value={range}
          onChange={(event) => setRange(event.target.value as OverviewRange)}
          className="rounded-lg border border-white/6 bg-[#11161d] px-3 py-2 text-xs text-zinc-400 outline-none"
        >
          {RANGES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-56 w-full min-w-0 sm:h-72">
        {isPending ? (
          <div className="h-full animate-pulse rounded-xl bg-white/5" />
        ) : isError ? (
          <p className="flex h-full items-center justify-center text-sm text-red-400">
            Couldn't load the chart.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="adminChartGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#f0b90b" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#f0b90b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
                tick={{ fill: "#52525b", fontSize: 11 }}
              />
              <YAxis
                width={48}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525b", fontSize: 11 }}
                tickFormatter={(value) => formatCompactUsd(Number(value))}
              />
              <Tooltip
                contentStyle={{
                  background: "#11161d",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  formatUsd(Number(value)),
                  "Total invested",
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f0b90b"
                strokeWidth={2}
                fill="url(#adminChartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// "use client";

// import {
//   Area,
//   AreaChart,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// const data = [
//   { name: "Mar", value: 2800000 },
//   { name: "Apr", value: 3200000 },
//   { name: "May", value: 3600000 },
//   { name: "Jun", value: 4100000 },
//   { name: "Jul", value: 4400000 },
//   { name: "Aug", value: 4650000 },
//   { name: "Sep", value: 4820000 },
// ];

// export default function AdminOverviewChart() {
//   return (
//     <div className="rounded-2xl border border-white/6 bg-white/2.5 p-5">
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-white">Platform Overview</p>
//           <p className="mt-1 text-xs text-zinc-500">Total investment volume</p>
//         </div>

//         <select className="rounded-lg border border-white/6 bg-[#11161d] px-3 py-2 text-xs text-zinc-400 outline-none">
//           <option>7 months</option>
//           <option>30 days</option>
//           <option>12 months</option>
//         </select>
//       </div>

//       <div className="h-70 w-full">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data}>
//             <defs>
//               <linearGradient
//                 id="adminChartGradient"
//                 x1="0"
//                 y1="0"
//                 x2="0"
//                 y2="1"
//               >
//                 <stop offset="0%" stopColor="#f0b90b" stopOpacity={0.22} />
//                 <stop offset="100%" stopColor="#f0b90b" stopOpacity={0} />
//               </linearGradient>
//             </defs>

//             <XAxis
//               dataKey="name"
//               axisLine={false}
//               tickLine={false}
//               tick={{
//                 fill: "#52525b",
//                 fontSize: 11,
//               }}
//             />

//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{
//                 fill: "#52525b",
//                 fontSize: 11,
//               }}
//               tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
//             />

//             <Tooltip
//               contentStyle={{
//                 background: "#11161d",
//                 border: "1px solid rgba(255,255,255,0.08)",
//                 borderRadius: "12px",
//                 color: "#fff",
//               }}
//               formatter={(value) => `$${Number(value).toLocaleString()}`}
//             />

//             <Area
//               type="monotone"
//               dataKey="value"
//               stroke="#f0b90b"
//               strokeWidth={2}
//               fill="url(#adminChartGradient)"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
