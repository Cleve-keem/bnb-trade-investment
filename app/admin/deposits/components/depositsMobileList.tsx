// components/bnb/admin/deposits/DepositsMobileList.tsx
import { ArrowDownToLine } from "lucide-react";
import { formatDateTime } from "@/libs/formatter/date";
import { AdminDepositRow } from "../types/deposit";
import DepositStatusBadge from "./depositStatusBadge";
import { formatMoney } from "@/libs/formatter/money";
import DepositActions from "./depositActions";


const METHOD_LABEL: Record<AdminDepositRow["method"], string> = {
  bank_transfer: "Bank Transfer",
  card: "Card",
  crypto: "Crypto",
};

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-medium text-white">{value}</p>
    </div>
  );
}

export default function DepositsMobileList({
  deposits,
  onConfirm,
  onReject,
  isConfirming,
  isRejecting,
}: {
  deposits: AdminDepositRow[];
  onConfirm: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isConfirming: boolean;
  isRejecting: boolean;
}) {
  return (
    <div className="divide-y divide-white/[0.05] lg:hidden">
      {deposits.map((deposit) => (
        <div key={deposit.deposit_id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownToLine size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {deposit.full_name ?? "—"}
              </p>
              <p className="text-xs text-zinc-600">
                {deposit.deposit_id.slice(0, 8)}
              </p>
            </div>
            <DepositStatusBadge status={deposit.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="Amount" value={formatMoney(deposit.amount)} />
            <InfoBox label="Method" value={METHOD_LABEL[deposit.method]} />
            <InfoBox label="Date" value={formatDateTime(deposit.created_at)} />
          </div>

          {deposit.status === "pending" && (
            <div className="mt-3">
              <DepositActions
                deposit={deposit}
                onConfirm={onConfirm}
                onReject={onReject}
                isConfirming={isConfirming}
                isRejecting={isRejecting}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
