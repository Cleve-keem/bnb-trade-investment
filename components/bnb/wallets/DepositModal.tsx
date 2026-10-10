"use client";

import { useState } from "react";
import { Check, Copy, X, AlertCircle, QrCode } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

const DEPOSIT_ADDRESS = "bc1qYOUR_REAL_ADDRESS_HERE";
const NETWORK_LABEL = "Bitcoin Network (BTC)";
const MIN_CONFIRMATIONS = 2;

export default function DepositModal({ open, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  function copyAddress() {
    navigator.clipboard?.writeText(DEPOSIT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/8 bg-[#10161e] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Deposit Bitcoin</h2>
            <p className="mt-1 text-xs text-zinc-500">{NETWORK_LABEL}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex justify-center rounded-2xl border border-white/8 bg-white p-4">
            {/* Swap for a real QR code of DEPOSIT_ADDRESS — e.g. the
                `qrcode` npm package rendered server-side, or a client
                component using `qrcode.react`. Placeholder icon below. */}
            <QrCode size={160} className="text-black" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Your deposit address
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/30 p-3">
              <p
                className="min-w-0 flex-1 select-none break-all font-mono text-sm text-white"
              >
                {DEPOSIT_ADDRESS}
              </p>
              <button
                onClick={copyAddress}
                aria-label="Copy deposit address"
                className="shrink-0 rounded-lg bg-white/5 p-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-400" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            {copied && (
              <p className="mt-1.5 text-xs text-emerald-400">
                Address copied to clipboard
              </p>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs leading-5 text-amber-200/80">
              Only send BTC on the Bitcoin network to this address. Sending any
              other asset or using a different network will result in permanent
              loss of funds. Your balance updates after {MIN_CONFIRMATIONS}{" "}
              network confirmations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928]"
          >
            I've sent the funds
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import {
//   Check,
//   Copy,
//   X,
//   Landmark,
//   CreditCard,
//   Bitcoin,
//   Loader2,
// } from "lucide-react";

// type Props = { open: boolean; onClose: () => void };
// type Method = "bank_transfer" | "card" | "crypto";

// const CRYPTO_OPTIONS = ["BTC", "ETH", "USDT"];

// const PLATFORM_BANK_DETAILS = {
//   bankName: "Example Bank",
//   accountName: "BNB Trading Ltd",
//   accountNumber: "0123456789",
// };

// export default function DepositModal({ open, onClose }: Props) {
//   const [method, setMethod] = useState<Method>("bank_transfer");
//   const [amount, setAmount] = useState("");
//   const [cryptoCurrency, setCryptoCurrency] = useState("BTC");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [result, setResult] = useState<{
//     reference: string;
//     address?: string;
//     expectedAmount?: number;
//     checkoutUrl?: string;
//   } | null>(null);
//   const [copied, setCopied] = useState(false);

//   if (!open) return null;

//   function reset() {
//     setAmount("");
//     setResult(null);
//     setError(null);
//     onClose();
//   }

//   function copy(text: string) {
//     navigator.clipboard?.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   }

//   async function submit() {
//     const numericAmount = Number(amount);
//     if (!amount || numericAmount <= 0) {
//       setError("Enter an amount greater than $0.");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/v1/deposits/initiate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amount: numericAmount,
//           method,
//           cryptoCurrency: method === "crypto" ? cryptoCurrency : undefined,
//         }),
//       });
//       const body = await res.json();

//       if (!res.ok) {
//         setError(body.error ?? "Something went wrong.");
//         return;
//       }

//       if (method === "card" && body.checkoutUrl) {
//         window.location.href = body.checkoutUrl;
//         return;
//       }

//       setResult({
//         reference: body.deposit.reference,
//         address: body.address,
//         expectedAmount: body.expectedAmount,
//       });
//     } catch {
//       setError("Network error — try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
//       <div className="w-full max-w-lg rounded-3xl border border-white/8 bg-[#10161e] p-5 shadow-2xl sm:p-6">
//         <div className="mb-6 flex items-start justify-between">
//           <div>
//             <h2 className="text-xl font-semibold">Deposit Funds</h2>
//             <p className="mt-1 text-xs text-zinc-500">
//               Add money to your BNB balance
//             </p>
//           </div>
//           <button
//             onClick={reset}
//             className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         {result ? (
//           <div className="space-y-5">
//             <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
//               <Check className="mx-auto text-emerald-400" size={28} />
//               <p className="mt-2 text-sm font-medium text-white">
//                 Request created
//               </p>
//               <p className="mt-1 text-xs text-zinc-500">
//                 Reference: {result.reference}
//               </p>
//             </div>

//             {method === "bank_transfer" && (
//               <div className="space-y-3 rounded-xl border border-white/8 bg-black/20 p-4 text-sm">
//                 <Row label="Bank" value={PLATFORM_BANK_DETAILS.bankName} />
//                 <Row
//                   label="Account name"
//                   value={PLATFORM_BANK_DETAILS.accountName}
//                 />
//                 <Row
//                   label="Account number"
//                   value={PLATFORM_BANK_DETAILS.accountNumber}
//                   onCopy={() => copy(PLATFORM_BANK_DETAILS.accountNumber)}
//                 />
//                 <Row
//                   label="Transfer reference (required)"
//                   value={result.reference}
//                   onCopy={() => copy(result.reference)}
//                   emphasis
//                 />
//                 <p className="pt-1 text-xs leading-5 text-zinc-500">
//                   Include the reference above in your transfer description so we
//                   can match it to your account. Your balance updates once we
//                   confirm receipt — usually within one business day.
//                 </p>
//               </div>
//             )}

//             {method === "crypto" && result.address && (
//               <div className="space-y-3 rounded-xl border border-white/8 bg-black/20 p-4 text-sm">
//                 <Row
//                   label={`${cryptoCurrency} deposit address`}
//                   value={result.address}
//                   onCopy={() => copy(result.address!)}
//                   mono
//                 />
//                 {result.expectedAmount !== undefined && (
//                   <Row
//                     label="Amount to send"
//                     value={`${result.expectedAmount} ${cryptoCurrency}`}
//                   />
//                 )}
//                 <p className="pt-1 text-xs leading-5 text-zinc-500">
//                   Send exactly the amount above to this address. This address is
//                   unique to this deposit — your balance updates automatically
//                   once the network confirms it.
//                 </p>
//               </div>
//             )}

//             <button
//               onClick={reset}
//               className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black hover:bg-[#ffc928]"
//             >
//               Done
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-5">
//             <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/8 bg-white/3 p-1">
//               <MethodTab
//                 icon={Landmark}
//                 label="Bank"
//                 active={method === "bank_transfer"}
//                 onClick={() => setMethod("bank_transfer")}
//               />
//               <MethodTab
//                 icon={CreditCard}
//                 label="Card"
//                 active={method === "card"}
//                 onClick={() => setMethod("card")}
//               />
//               <MethodTab
//                 icon={Bitcoin}
//                 label="Crypto"
//                 active={method === "crypto"}
//                 onClick={() => setMethod("crypto")}
//               />
//             </div>

//             <div>
//               <label className="mb-2 block text-xs font-medium text-zinc-400">
//                 Amount (USD)
//               </label>
//               <div className="flex h-12 items-center rounded-xl border border-white/8 bg-white/3 px-4 focus-within:border-[#f0b90b]/50">
//                 <span className="text-zinc-500">$</span>
//                 <input
//                   type="number"
//                   min="0"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   placeholder="0.00"
//                   className="w-full bg-transparent px-2 text-sm outline-none"
//                 />
//               </div>
//             </div>

//             {method === "crypto" && (
//               <div>
//                 <label className="mb-2 block text-xs font-medium text-zinc-400">
//                   Currency
//                 </label>
//                 <select
//                   value={cryptoCurrency}
//                   onChange={(e) => setCryptoCurrency(e.target.value)}
//                   className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none focus:border-[#f0b90b]/50"
//                 >
//                   {CRYPTO_OPTIONS.map((c) => (
//                     <option key={c} value={c} className="bg-[#10161e]">
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {method === "bank_transfer" && (
//               <p className="text-xs leading-5 text-zinc-500">
//                 You'll get our bank details and a unique reference to include in
//                 your transfer. Confirmation is manual and usually takes up to
//                 one business day.
//               </p>
//             )}
//             {method === "card" && (
//               <p className="text-xs leading-5 text-zinc-500">
//                 You'll be redirected to a secure checkout page. Your balance
//                 updates automatically once the payment confirms.
//               </p>
//             )}
//             {method === "crypto" && (
//               <p className="text-xs leading-5 text-zinc-500">
//                 You'll get a unique deposit address generated just for this
//                 transaction. Your balance updates automatically once the network
//                 confirms it.
//               </p>
//             )}

//             {error && <p className="text-sm text-red-400">{error}</p>}

//             <button
//               onClick={submit}
//               disabled={submitting}
//               className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] disabled:opacity-60"
//             >
//               {submitting && <Loader2 size={16} className="animate-spin" />}
//               {submitting ? "Processing..." : "Continue"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function MethodTab({
//   icon: Icon,
//   label,
//   active,
//   onClick,
// }: {
//   icon: typeof Landmark;
//   label: string;
//   active: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`flex flex-col items-center gap-1 rounded-lg py-2.5 text-xs font-medium transition ${
//         active
//           ? "bg-[#f0b90b]/10 text-[#f0b90b]"
//           : "text-zinc-500 hover:text-white"
//       }`}
//     >
//       <Icon size={17} />
//       {label}
//     </button>
//   );
// }

// function Row({
//   label,
//   value,
//   onCopy,
//   mono,
//   emphasis,
// }: {
//   label: string;
//   value: string;
//   onCopy?: () => void;
//   mono?: boolean;
//   emphasis?: boolean;
// }) {
//   return (
//     <div className="flex items-center justify-between gap-3">
//       <div className="min-w-0">
//         <p className="text-[11px] text-zinc-500">{label}</p>
//         <p
//           className={`truncate ${mono ? "font-mono text-xs" : "text-sm"} ${emphasis ? "font-semibold text-[#f0b90b]" : "text-white"}`}
//         >
//           {value}
//         </p>
//       </div>
//       {onCopy && (
//         <button
//           onClick={onCopy}
//           className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
//         >
//           <Copy size={14} />
//         </button>
//       )}
//     </div>
//   );
// }

// // "use client";

// // import { useState } from "react";
// // import { Check, Copy, X } from "lucide-react";

// // type Props = {
// //   open: boolean;
// //   onClose: () => void;
// // };

// // const assets = ["Bitcoin", "Ethereum", "BNB", "USDT"];

// // export default function DepositModal({ open, onClose }: Props) {
// //   const [asset, setAsset] = useState("Bitcoin");
// //   const [amount, setAmount] = useState("");
// //   const [copied, setCopied] = useState(false);
// //   const [submitted, setSubmitted] = useState(false);

// //   if (!open) return null;

// //   const address =
// //     asset === "Bitcoin"
// //       ? "bc1qexamplebnbdepositaddress"
// //       : "0xExampleBNBDepositAddress";

// //   function copyAddress() {
// //     navigator.clipboard?.writeText(address);
// //     setCopied(true);
// //     setTimeout(() => setCopied(false), 1500);
// //   }

// //   function submit() {
// //     if (!amount || Number(amount) <= 0) return;
// //     setSubmitted(true);
// //   }

// //   return (
// //     <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
// //       <div className="w-full max-w-lg rounded-3xl border border-white/8 bg-[#10161e] p-5 shadow-2xl sm:p-6">
// //         <div className="mb-6 flex items-start justify-between">
// //           <div>
// //             <h2 className="text-xl font-semibold">Deposit Funds</h2>
// //             <p className="mt-1 text-xs text-zinc-500">
// //               Add funds to your BNB wallet
// //             </p>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
// //           >
// //             <X size={19} />
// //           </button>
// //         </div>

// //         {submitted ? (
// //           <div className="py-10 text-center">
// //             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
// //               <Check size={28} />
// //             </div>
// //             <h3 className="mt-5 text-lg font-semibold">Deposit submitted</h3>
// //             <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
// //               Your deposit request has been recorded in this demo interface.
// //             </p>
// //             <button
// //               onClick={onClose}
// //               className="mt-6 rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black"
// //             >
// //               Done
// //             </button>
// //           </div>
// //         ) : (
// //           <div className="space-y-5">
// //             <div>
// //               <label className="mb-2 block text-xs font-medium text-zinc-400">
// //                 Asset
// //               </label>

// //               <select
// //                 value={asset}
// //                 onChange={(e) => setAsset(e.target.value)}
// //                 className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none focus:border-[#f0b90b]/50"
// //               >
// //                 {assets.map((item) => (
// //                   <option key={item} value={item} className="bg-[#10161e]">
// //                     {item}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>

// //             <div>
// //               <label className="mb-2 block text-xs font-medium text-zinc-400">
// //                 Amount
// //               </label>
// //               <div className="flex h-12 items-center rounded-xl border border-white/8 bg-white/3 px-4 focus-within:border-[#f0b90b]/50">
// //                 <span className="text-zinc-500">$</span>
// //                 <input
// //                   type="number"
// //                   min="0"
// //                   value={amount}
// //                   onChange={(e) => setAmount(e.target.value)}
// //                   placeholder="0.00"
// //                   className="w-full bg-transparent px-2 text-sm outline-none"
// //                 />
// //                 <span className="text-xs text-zinc-600">USD</span>
// //               </div>
// //             </div>
// //             <div>
// //               <label className="mb-2 block text-xs font-medium text-zinc-400">
// //                 Network
// //               </label>

// //               <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
// //                 {asset === "Bitcoin" ? "Bitcoin Network" : "Supported Network"}
// //               </div>
// //             </div>

// //             <div>
// //               <label className="mb-2 block text-xs font-medium text-zinc-400">
// //                 Deposit Address
// //               </label>

// //               <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 p-3">
// //                 <p className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-300">
// //                   {address}
// //                 </p>
// //                 <button
// //                   onClick={copyAddress}
// //                   className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
// //                 >
// //                   {copied ? <Check size={16} /> : <Copy size={16} />}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3 text-xs leading-5 text-yellow-200/70">
// //               Demo address only. Do not send real funds to this address.
// //             </div> */}

// //             <button
// //               onClick={submit}
// //               className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928]"
// //             >
// //               Confirm Deposit
// //             </button>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
