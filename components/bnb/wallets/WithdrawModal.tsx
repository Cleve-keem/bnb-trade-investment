"use client";

import { useState } from "react";
import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { supabase } from "@/libs/supabase/browser";
import { useQueryClient } from "@tanstack/react-query";
import { useWithdrawFormData } from "@/hooks/wallet";

type Props = { open: boolean; onClose: () => void };
type Asset = "BTC" | "ETH" | "BNB" | "USDT";

type NetworkOption = { id: string; label: string; pattern: RegExp };

const ASSET_NETWORKS: Record<Asset, NetworkOption[]> = {
  BTC: [
    {
      id: "BTC",
      label: "Bitcoin Network",
      pattern: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,59}$/,
    },
  ],
  ETH: [
    { id: "ERC20", label: "Ethereum (ERC-20)", pattern: /^0x[a-fA-F0-9]{40}$/ },
  ],
  BNB: [
    {
      id: "BEP20",
      label: "BNB Smart Chain (BEP-20)",
      pattern: /^0x[a-fA-F0-9]{40}$/,
    },
  ],
  USDT: [
    { id: "TRC20", label: "Tron (TRC-20)", pattern: /^T[a-zA-Z0-9]{33}$/ },
    { id: "ERC20", label: "Ethereum (ERC-20)", pattern: /^0x[a-fA-F0-9]{40}$/ },
    {
      id: "BEP20",
      label: "BNB Smart Chain (BEP-20)",
      pattern: /^0x[a-fA-F0-9]{40}$/,
    },
  ],
};

export default function WithdrawModal({ open, onClose }: Props) {
  const { data, isPending: dataLoading } = useWithdrawFormData();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [asset, setAsset] = useState<Asset>("BTC");
  const [networkId, setNetworkId] = useState(ASSET_NETWORKS.BTC[0].id);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const networks = ASSET_NETWORKS[asset];
  const activeNetwork = networks.find((n) => n.id === networkId) ?? networks[0];
  const available = data?.available ?? 0;
  const fee = data?.fee ?? 0;
  const numericAmount = Number(amount) || 0;
  const receive = Math.max(numericAmount - fee, 0);

  function reset() {
    setStep("form");
    setAsset("BTC");
    setNetworkId(ASSET_NETWORKS.BTC[0].id);
    setAddress("");
    setAmount("");
    setConfirmed(false);
    setError(null);
    onClose();
  }

  function changeAsset(next: Asset) {
    setAsset(next);
    setNetworkId(ASSET_NETWORKS[next][0].id);
  }

  function goToReview() {
    setError(null);

    if (!address.trim()) {
      setError("Enter a destination wallet address.");
      return;
    }
    if (!activeNetwork.pattern.test(address.trim())) {
      setError(
        `That doesn't look like a valid ${activeNetwork.label} address.`,
      );
      return;
    }
    if (numericAmount <= 0) {
      setError("Enter an amount greater than $0.");
      return;
    }
    if (numericAmount > available) {
      setError("That's more than your available balance.");
      return;
    }

    setStep("review");
  }

  async function confirmWithdrawal() {
    if (!confirmed) {
      setError("Confirm that the address and network are correct.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: rpcError } = await supabase.rpc("request_withdrawal", {
      p_amount: numericAmount,
      p_asset: asset,
      p_network: activeNetwork.id,
      p_destination_address: address.trim(),
    });

    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      setStep("form");
      return;
    }

    // Wallet's available balance just changed (locked_balance went up) --
    // refetch so the next time this modal opens, the number is right.
    queryClient.invalidateQueries({ queryKey: ["withdraw", "form-data"] });
    setStep("success");
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/8 bg-[#10161e] p-5 shadow-2xl sm:p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {step === "review"
                ? "Review Withdrawal"
                : step === "success"
                  ? "Withdrawal Submitted"
                  : "Withdraw Funds"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {step === "form"
                ? "Withdraw funds from your wallet"
                : step === "review"
                  ? "Check your withdrawal details"
                  : "Your request has been recorded"}
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {step === "success" ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Check size={28} />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Withdrawal submitted</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Your withdrawal request is now pending review.
              {data?.email && ` A confirmation will be sent to ${data.email}.`}
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black"
            >
              Done
            </button>
          </div>
        ) : step === "review" ? (
          <div>
            <div className="space-y-3 rounded-2xl border border-white/6 bg-white/2 p-4">
              <SummaryRow label="Asset" value={asset} />
              <SummaryRow label="Network" value={activeNetwork.label} />
              <SummaryRow
                label="Amount"
                value={`$${numericAmount.toLocaleString()}`}
              />

              <div>
                <p className="text-xs text-zinc-600">Wallet address</p>
                <p className="mt-1 break-all font-mono text-xs text-zinc-300">
                  {address}
                </p>
              </div>

              <div className="border-t border-white/6 pt-3">
                <SummaryRow label="Network fee" value={`$${fee.toFixed(2)}`} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">You receive</span>
                  <span className="text-lg font-semibold">
                    $
                    {receive.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#f0b90b]"
              />
              I've verified the address and network. Withdrawals sent to the
              wrong network can't be recovered.
            </label>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setStep("form")}
                disabled={submitting}
                className="h-12 flex-1 rounded-xl border border-white/8 text-sm font-medium disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={confirmWithdrawal}
                disabled={submitting}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black disabled:opacity-60"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Submitting..." : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Asset
              </label>
              <select
                value={asset}
                onChange={(e) => changeAsset(e.target.value as Asset)}
                className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none"
              >
                {(Object.keys(ASSET_NETWORKS) as Asset[]).map((a) => (
                  <option key={a} value={a} className="bg-[#10161e]">
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {networks.length > 1 && (
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Network
                </label>
                <select
                  value={networkId}
                  onChange={(e) => setNetworkId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none"
                >
                  {networks.map((n) => (
                    <option key={n.id} value={n.id} className="bg-[#10161e]">
                      {n.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Wallet Address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  activeNetwork.id === "TRC20"
                    ? "T..."
                    : activeNetwork.id === "BTC"
                      ? "bc1q..."
                      : "0x..."
                }
                className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 font-mono text-xs outline-none placeholder:font-sans placeholder:text-zinc-600 focus:border-[#f0b90b]/50"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">
                  Amount
                </label>
                <span className="text-[10px] text-zinc-600">
                  {dataLoading
                    ? "Loading..."
                    : `Available $${available.toLocaleString()}`}
                </span>
              </div>
              <div className="flex h-12 items-center rounded-xl border border-white/8 bg-white/3 px-4">
                <span className="text-zinc-500">$</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-2 text-sm outline-none"
                />
                <button
                  onClick={() => setAmount(String(available))}
                  className="text-[10px] font-semibold text-[#f0b90b]"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3">
              <div className="flex gap-2">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-yellow-400"
                />
                <p className="text-xs leading-5 text-yellow-200/70">
                  Double-check the wallet address and network before submitting.
                  Withdrawals sent to the wrong address or network can't be
                  reversed.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={goToReview}
              disabled={
                dataLoading ||
                !address ||
                numericAmount <= 0 ||
                numericAmount > available
              }
              className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review Withdrawal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-zinc-600">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { AlertTriangle, Check, X } from "lucide-react";

// type Props = {
//   open: boolean;
//   onClose: () => void;
// };

// export default function WithdrawModal({ open, onClose }: Props) {
//   const [step, setStep] = useState<"form" | "review" | "success">("form");

//   const [asset, setAsset] = useState("Bitcoin");
//   const [network, setNetwork] = useState("Bitcoin Network");
//   const [address, setAddress] = useState("");
//   const [amount, setAmount] = useState("");

//   const available = 322609;
//   const fee = 12.4;
//   const numericAmount = Number(amount) || 0;
//   const receive = Math.max(numericAmount - fee, 0);

//   if (!open) return null;

//   function close() {
//     setStep("form");
//     setAsset("Bitcoin");
//     setNetwork("Bitcoin Network");
//     setAddress("");
//     setAmount("");
//     onClose();
//   }

//   function review() {
//     if (!address || numericAmount <= 0 || numericAmount > available) {
//       return;
//     }

//     setStep("review");
//   }

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
//       <div className="w-full max-w-lg rounded-3xl border border-white/8 bg-[#10161e] p-5 shadow-2xl sm:p-6">
//         <div className="mb-6 flex items-start justify-between">
//           <div>
//             <h2 className="text-xl font-semibold">
//               {step === "review"
//                 ? "Review Withdrawal"
//                 : step === "success"
//                   ? "Withdrawal Submitted"
//                   : "Withdraw Funds"}
//             </h2>

//             <p className="mt-1 text-xs text-zinc-500">
//               {step === "form"
//                 ? "Withdraw funds from your wallet"
//                 : step === "review"
//                   ? "Check your withdrawal details"
//                   : "Your request has been recorded"}
//             </p>
//           </div>

//           <button
//             onClick={close}
//             className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         {step === "success" ? (
//           <div className="py-10 text-center">
//             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
//               <Check size={28} />
//             </div>

//             <h3 className="mt-5 text-lg font-semibold">Withdrawal submitted</h3>

//             <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
//               Your withdrawal request is now pending review. A confirmation link
//               will be sent to elisaeve5628@gmail.com
//             </p>

//             <button
//               onClick={close}
//               className="mt-6 rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black"
//             >
//               Done
//             </button>
//           </div>
//         ) : step === "review" ? (
//           <div>
//             <div className="space-y-3 rounded-2xl border border-white/6 bg-white/2 p-4">
//               <SummaryRow label="Asset" value={asset} />
//               <SummaryRow label="Network" value={network} />
//               <SummaryRow
//                 label="Amount"
//                 value={`$${numericAmount.toLocaleString()}`}
//               />

//               <div>
//                 <p className="text-xs text-zinc-600">Wallet address</p>
//                 <p className="mt-1 break-all font-mono text-xs text-zinc-300">
//                   {address}
//                 </p>
//               </div>

//               <div className="border-t border-white/6 pt-3">
//                 <SummaryRow label="Network fee" value={`$${fee.toFixed(2)}`} />

//                 <div className="mt-3 flex items-center justify-between">
//                   <span className="text-sm text-zinc-400">You receive</span>

//                   <span className="text-lg font-semibold">
//                     $
//                     {receive.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                     })}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 flex gap-3">
//               <button
//                 onClick={() => setStep("form")}
//                 className="h-12 flex-1 rounded-xl border border-white/8 text-sm font-medium"
//               >
//                 Back
//               </button>

//               <button
//                 onClick={() => setStep("success")}
//                 className="h-12 flex-1 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black"
//               >
//                 Confirm Withdrawal
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-5">
//             <div>
//               <label className="mb-2 block text-xs font-medium text-zinc-400">
//                 Asset
//               </label>

//               <select
//                 value={asset}
//                 onChange={(e) => {
//                   setAsset(e.target.value);

//                   if (e.target.value === "Bitcoin") {
//                     setNetwork("Bitcoin Network");
//                   } else {
//                     setNetwork("Supported Network");
//                   }
//                 }}
//                 className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none"
//               >
//                 <option className="bg-[#10161e]">Bitcoin</option>
//                 <option className="bg-[#10161e]">Ethereum</option>
//                 <option className="bg-[#10161e]">BNB</option>
//                 <option className="bg-[#10161e]">USDT</option>
//               </select>
//             </div>

//             <div>
//               <label className="mb-2 block text-xs font-medium text-zinc-400">
//                 Wallet Address
//               </label>

//               <input
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 placeholder="Enter wallet address"
//                 className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 font-mono text-xs outline-none placeholder:font-sans placeholder:text-zinc-600 focus:border-[#f0b90b]/50"
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-xs font-medium text-zinc-400">
//                 Network
//               </label>

//               <select
//                 value={network}
//                 onChange={(e) => setNetwork(e.target.value)}
//                 className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none"
//               >
//                 <option className="bg-[#10161e]">
//                   {asset === "Bitcoin"
//                     ? "Bitcoin Network"
//                     : "Supported Network"}
//                 </option>
//               </select>
//             </div>

//             <div>
//               <div className="mb-2 flex items-center justify-between">
//                 <label className="text-xs font-medium text-zinc-400">
//                   Amount
//                 </label>

//                 <span className="text-[10px] text-zinc-600">
//                   Available ${available.toLocaleString()}
//                 </span>
//               </div>

//               <div className="flex h-12 items-center rounded-xl border border-white/8 bg-white/3 px-4">
//                 <span className="text-zinc-500">$</span>

//                 <input
//                   type="number"
//                   min="0"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   placeholder="0.00"
//                   className="w-full bg-transparent px-2 text-sm outline-none"
//                 />

//                 <button
//                   onClick={() => setAmount(String(available))}
//                   className="text-[10px] font-semibold text-[#f0b90b]"
//                 >
//                   MAX
//                 </button>
//               </div>
//             </div>

//             {/* <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3">
//               <div className="flex gap-2">
//                 <AlertTriangle
//                   size={16}
//                   className="mt-0.5 shrink-0 text-yellow-400"
//                 />

//                 <p className="text-xs leading-5 text-yellow-200/70">
//                   Check the wallet address and network carefully before
//                   submitting. This is a demo withdrawal flow.
//                 </p>
//               </div>
//             </div> */}

//             <button
//               onClick={review}
//               disabled={
//                 !address || numericAmount <= 0 || numericAmount > available
//               }
//               className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
//             >
//               Review Withdrawal
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SummaryRow({ label, value }: { label: string; value: string }) {
//   return (
//     <div className="flex items-center justify-between gap-4">
//       <span className="text-xs text-zinc-600">{label}</span>
//       <span className="text-sm">{value}</span>
//     </div>
//   );
// }
