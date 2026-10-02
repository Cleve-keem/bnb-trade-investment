import { formatDateTime } from "@/libs/formatter/date";
import { AdminDepositRow } from "../types/deposit";
import WalletAvatar from "../../wallets/components/walletAvatar";
import { formatMoney } from "@/libs/formatter/money";
import DepositStatusBadge from "./depositStatusBadge";
import DepositActions from "./depositActions";

const METHOD_LABEL: Record<AdminDepositRow["method"], string> = {
  bank_transfer: "Bank Transfer",
  card: "Card",
  crypto: "Crypto",
};

function Head({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
      {children}
    </th>
  );
}

export default function DepositsTable({
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
    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/6">
            <Head>User</Head>
            <Head>Deposit ID</Head>
            <Head>Amount</Head>
            <Head>Method</Head>
            <Head>Status</Head>
            <Head>Date</Head>
            <th className="w-32 px-5 py-4" />
          </tr>
        </thead>
        <tbody>
          {deposits.map((deposit) => (
            <tr
              key={deposit.deposit_id}
              className="border-b border-white/4 hover:bg-white/2"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <WalletAvatar name={deposit.full_name ?? deposit.email} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {deposit.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-zinc-600">{deposit.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-xs text-zinc-500">
                  {deposit.deposit_id.slice(0, 8)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="text-sm font-semibold text-white">
                  {formatMoney(deposit.amount)}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="text-xs text-zinc-400">
                  {METHOD_LABEL[deposit.method]}
                </span>
              </td>
              <td className="px-5 py-4">
                <DepositStatusBadge status={deposit.status} />
              </td>
              <td className="px-5 py-4">
                <span className="text-xs text-zinc-600">
                  {formatDateTime(deposit.created_at)}
                </span>
              </td>
              <td className="px-5 py-4">
                <DepositActions
                  deposit={deposit}
                  onConfirm={onConfirm}
                  onReject={onReject}
                  isConfirming={isConfirming}
                  isRejecting={isRejecting}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
