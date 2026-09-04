"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Mar", value: 2800000 },
  { name: "Apr", value: 3200000 },
  { name: "May", value: 3600000 },
  { name: "Jun", value: 4100000 },
  { name: "Jul", value: 4400000 },
  { name: "Aug", value: 4650000 },
  { name: "Sep", value: 4820000 },
];

export default function AdminOverviewChart() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Platform Overview</p>

          <p className="mt-1 text-xs text-zinc-500">Total investment volume</p>
        </div>

        <select className="rounded-lg border border-white/[0.06] bg-[#11161d] px-3 py-2 text-xs text-zinc-400 outline-none">
          <option>7 months</option>
          <option>30 days</option>
          <option>12 months</option>
        </select>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#52525b",
                fontSize: 11,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#52525b",
                fontSize: 11,
              }}
              tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            />

            <Tooltip
              contentStyle={{
                background: "#11161d",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#fff",
              }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
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
      </div>
    </div>
  );
}
