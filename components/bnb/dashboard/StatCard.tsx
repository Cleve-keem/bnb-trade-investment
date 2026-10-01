import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/libs/formatter/money";

type Props = {
  title: string;
  value: number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
};

export default function StatCard({
  title,
  value,
  change,
  positive,
  icon,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            ${formatMoney(value)}
          </p>

          {/* Only render the change badge when we actually have a real
              figure — no hardcoded fallback percentage. */}
          {change && (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {positive ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {change}
            </div>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/4 text-[#f0b90b]">
          {icon}
        </div>
      </div>
    </div>
  );
}

// import { ArrowDownRight, ArrowUpRight } from "lucide-react";

// type Props = {
//   title: string;
//   value: string;
//   change?: string;
//   positive?: boolean;
//   icon: React.ReactNode;
// };

// export default function StatCard({
//   title,
//   value,
//   change,
//   positive,
//   icon,
// }: Props) {
//   return (
//     <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-5">
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="text-xs font-medium text-zinc-500">{title}</p>
//           <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
//             {value}
//           </p>

//           {change && (
//             <div
//               className={`mt-2 flex items-center gap-1 text-xs font-medium ${
//                 positive ? "text-emerald-400" : "text-red-400"
//               }`}
//             >
//               {positive ? (
//                 <ArrowUpRight size={14} />
//               ) : (
//                 <ArrowDownRight size={14} />
//               )}

//               {change}
//             </div>
//           )}
//         </div>

//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/4 text-[#f0b90b]">
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }
