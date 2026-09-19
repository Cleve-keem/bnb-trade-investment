"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import useMarketAssets from "@/hooks/useMarketAssest";

export default function TopMovers() {
  const { assets, isPending, isError } = useMarketAssets();

  const movers = [...assets]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Top Movers</p>
          <p className="mt-1 text-xs text-zinc-500">24h market movement</p>
        </div>
        <Link
          href="/markets"
          className="flex items-center gap-1 text-xs text-[#f0b90b] hover:underline"
        >
          View all
          <ChevronRight size={13} />
        </Link>
      </div>

      {isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-xs text-red-400">Couldn't load market data.</p>
      ) : (
        <div className="space-y-4">
          {movers.map((asset) => (
            <div key={asset.symbol} className="flex items-center">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/5">
                <Image
                  src={asset.iconUrl}
                  alt={asset.symbol}
                  fill
                  sizes="36px"
                />
              </div>

              <div className="ml-3">
                <p className="text-sm font-medium">{asset.symbol}</p>
                <p className="text-[11px] text-zinc-500">{asset.name}</p>
              </div>

              <div className="ml-auto text-right">
                <p className="text-sm">${asset.price.toLocaleString()}</p>
                <p
                  className={`mt-0.5 flex items-center justify-end gap-1 text-[11px] ${
                    asset.change >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {asset.change >= 0 ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  {Math.abs(asset.change).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// import Link from "next/link";
// import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
// import { marketAssets } from "@/libs/bnb/demo-data";

// export default function TopMovers() {
//   const movers = [...marketAssets]
//     .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
//     .slice(0, 5);

//   return (
//     <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
//       <div className="mb-5 flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium">Top Movers</p>
//           <p className="mt-1 text-xs text-zinc-500">24h market movement</p>
//         </div>

//         <Link
//           href="/markets"
//           className="flex items-center gap-1 text-xs text-[#f0b90b] hover:underline"
//         >
//           View all
//           <ChevronRight size={13} />
//         </Link>
//       </div>

//       <div className="space-y-4">
//         {movers.map((asset) => (
//           <div key={asset.symbol} className="flex items-center">
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs font-bold">
//               {asset.icon}
//             </div>

//             <div className="ml-3">
//               <p className="text-sm font-medium">{asset.symbol}</p>
//               <p className="text-[11px] text-zinc-500">{asset.name}</p>
//             </div>

//             <div className="ml-auto text-right">
//               <p className="text-sm">${asset.price.toLocaleString()}</p>

//               <p
//                 className={`mt-0.5 flex items-center justify-end gap-1 text-[11px] ${
//                   asset.change >= 0 ? "text-emerald-400" : "text-red-400"
//                 }`}
//               >
//                 {asset.change >= 0 ? (
//                   <ArrowUpRight size={12} />
//                 ) : (
//                   <ArrowDownRight size={12} />
//                 )}
//                 {Math.abs(asset.change).toFixed(2)}%
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
