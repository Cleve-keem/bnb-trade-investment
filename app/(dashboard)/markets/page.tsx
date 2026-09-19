"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import { ArrowDownRight, ArrowUpRight, Search } from "lucide-react";
import useMarketAssets from "@/hooks/useMarketAssest";

export default function MarketsPage() {
  const { assets, isPending, isError } = useMarketAssets();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  }, [assets, query]);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Markets</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Track market prices and daily movements.
          </p>
        </div>

        <div className="flex h-11 max-w-md items-center gap-3 rounded-xl border border-white/[0.07] bg-white/2.5 px-4">
          <Search size={17} className="text-zinc-600" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#0d131a]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left">
              <thead className="border-b border-white/6 text-xs text-zinc-600">
                <tr>
                  <th className="px-5 py-4">Asset</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">24h Change</th>
                  <th className="px-5 py-4">Volume</th>
                </tr>
              </thead>
              <tbody>
                {isPending ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-zinc-600"
                    >
                      Loading markets…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-red-400"
                    >
                      Couldn't load market data.
                    </td>
                  </tr>
                ) : (
                  filtered.map((asset) => (
                    <tr
                      key={asset.symbol}
                      className="border-b border-white/4 last:border-0 hover:bg-white/2"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/5">
                            <Image
                              src={asset.iconUrl}
                              alt={asset.symbol}
                              fill
                              sizes="36px"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {asset.symbol}
                            </p>
                            <p className="text-xs text-zinc-600">
                              {asset.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 text-sm">
                        ${asset.price.toLocaleString()}
                      </td>
                      <td
                        className={`px-5 py-5 text-sm ${asset.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        <span className="flex items-center gap-1">
                          {asset.change >= 0 ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowDownRight size={14} />
                          )}
                          {Math.abs(asset.change).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-5 text-sm text-zinc-400">
                        ${asset.volume.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
