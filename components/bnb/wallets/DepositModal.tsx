"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const assets = ["Bitcoin", "Ethereum", "BNB", "USDT"];

export default function DepositModal({ open, onClose }: Props) {
  const [asset, setAsset] = useState("Bitcoin");
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const address =
    asset === "Bitcoin"
      ? "bc1qexamplebnbdepositaddress"
      : "0xExampleBNBDepositAddress";

  function copyAddress() {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function submit() {
    if (!amount || Number(amount) <= 0) return;
    setSubmitted(true);
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/8 bg-[#10161e] p-5 shadow-2xl sm:p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">Deposit Funds</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Add funds to your BNB wallet
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Check size={28} />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Deposit submitted</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Your deposit request has been recorded in this demo interface.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Asset
              </label>

              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/8 bg-white/3 px-4 text-sm outline-none focus:border-[#f0b90b]/50"
              >
                {assets.map((item) => (
                  <option key={item} value={item} className="bg-[#10161e]">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Amount
              </label>
              <div className="flex h-12 items-center rounded-xl border border-white/8 bg-white/3 px-4 focus-within:border-[#f0b90b]/50">
                <span className="text-zinc-500">$</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent px-2 text-sm outline-none"
                />
                <span className="text-xs text-zinc-600">USD</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Network
              </label>

              <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm">
                {asset === "Bitcoin" ? "Bitcoin Network" : "Supported Network"}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Deposit Address
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/20 p-3">
                <p className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-300">
                  {address}
                </p>
                <button
                  onClick={copyAddress}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3 text-xs leading-5 text-yellow-200/70">
              Demo address only. Do not send real funds to this address.
            </div> */}

            <button
              onClick={submit}
              className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928]"
            >
              Confirm Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
