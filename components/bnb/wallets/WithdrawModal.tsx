"use client";

import { useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WithdrawModal({ open, onClose }: Props) {
  const [step, setStep] = useState<"form" | "review" | "success">("form");

  const [asset, setAsset] = useState("Bitcoin");
  const [network, setNetwork] = useState("Bitcoin Network");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  const available = 322609;
  const fee = 12.4;
  const numericAmount = Number(amount) || 0;
  const receive = Math.max(numericAmount - fee, 0);

  if (!open) return null;

  function close() {
    setStep("form");
    setAsset("Bitcoin");
    setNetwork("Bitcoin Network");
    setAddress("");
    setAmount("");
    onClose();
  }

  function review() {
    if (!address || numericAmount <= 0 || numericAmount > available) {
      return;
    }

    setStep("review");
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
            onClick={close}
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
              Your withdrawal request is now pending review. A confirmation link
              will be sent to elisaeve5628@gmail.com
            </p>

            <button
              onClick={close}
              className="mt-6 rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black"
            >
              Done
            </button>
          </div>
        ) : step === "review" ? (
          <div>
            <div className="space-y-3 rounded-2xl border border-white/6 bg-white/2 p-4">
              <SummaryRow label="Asset" value={asset} />
              <SummaryRow label="Network" value={network} />
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

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="h-12 flex-1 rounded-xl border border-white/8 text-sm font-medium"
              >
                Back
              </button>

              <button
                onClick={() => setStep("success")}
                className="h-12 flex-1 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black"
              >
                Confirm Withdrawal
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
                onChange={(e) => {
                  setAsset(e.target.value);

                  if (e.target.value === "Bitcoin") {
                    setNetwork("Bitcoin Network");
                  } else {
                    setNetwork("Supported Network");
                  }
                }}
                className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none"
              >
                <option className="bg-[#10161e]">Bitcoin</option>
                <option className="bg-[#10161e]">Ethereum</option>
                <option className="bg-[#10161e]">BNB</option>
                <option className="bg-[#10161e]">USDT</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Wallet Address
              </label>

              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address"
                className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 font-mono text-xs outline-none placeholder:font-sans placeholder:text-zinc-600 focus:border-[#f0b90b]/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Network
              </label>

              <select
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none"
              >
                <option className="bg-[#10161e]">
                  {asset === "Bitcoin"
                    ? "Bitcoin Network"
                    : "Supported Network"}
                </option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">
                  Amount
                </label>

                <span className="text-[10px] text-zinc-600">
                  Available ${available.toLocaleString()}
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

            {/* <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3">
              <div className="flex gap-2">
                <AlertTriangle
                  size={16}
                  className="mt-0.5 shrink-0 text-yellow-400"
                />

                <p className="text-xs leading-5 text-yellow-200/70">
                  Check the wallet address and network carefully before
                  submitting. This is a demo withdrawal flow.
                </p>
              </div>
            </div> */}

            <button
              onClick={review}
              disabled={
                !address || numericAmount <= 0 || numericAmount > available
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
