"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Loader2,
  QrCode,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  CRYPTO_OPTIONS,
  MAX_DEPOSIT,
  MIN_DEPOSIT,
  type CryptoCurrency,
} from "@/constants/deposit";
import { getDepositErrorMessage } from "@/services/deposit.service";
import { useDepositInstructions } from "@/hooks/deposit-instructions";
import { useRequestDeposit } from "@/hooks/deposit";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = "amount" | "details" | "progress";

// What the user was shown on the QR screen. This exact address is sent
// back to the database, which checks it is still the current one.
type Quote = {
  currency: CryptoCurrency;
  address: string;
  amount: number;
};

const money = (n: number) =>
  "$" +
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function DepositModal({ open, onClose }: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CryptoCurrency>("BTC");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const instructions = useDepositInstructions(open);
  const requestDeposit = useRequestDeposit();
  const submitting = requestDeposit.isPending;

  if (!open) return null;

  const firstAvailable =
    CRYPTO_OPTIONS.find((item) => instructions.isAvailable(item.value))
      ?.value ?? null;
  const activeCurrency = instructions.isAvailable(currency)
    ? currency
    : firstAvailable;
  const nothingAvailable =
    !instructions.isPending && !instructions.isError && firstAvailable === null;
  const quoteOption = quote
    ? CRYPTO_OPTIONS.find((item) => item.value === quote.currency)
    : null;

  function resetAndClose() {
    if (submitting) return;
    setStep("amount");
    setAmount("");
    setCurrency("BTC");
    setError(null);
    setCopied(false);
    setQuote(null);
    setReference(null);
    onClose();
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy automatically. Please copy the text manually.");
    }
  }

  // Step 1 -> 2: nothing is saved yet, we only show the address
  function continueToDetails() {
    const numericAmount = Number(amount);
    const decimals = amount.includes(".") ? amount.split(".")[1].length : 0;

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Enter a valid deposit amount greater than $0.");
      return;
    }
    if (decimals > 2) {
      setError("Use at most 2 decimal places.");
      return;
    }
    if (numericAmount < MIN_DEPOSIT) {
      setError(`Minimum deposit is $${MIN_DEPOSIT}.`);
      return;
    }
    if (numericAmount > MAX_DEPOSIT) {
      setError(`Maximum deposit is $${MAX_DEPOSIT.toLocaleString("en-US")}.`);
      return;
    }
    if (!activeCurrency) {
      setError("Deposits aren't available right now. Please try again later.");
      return;
    }

    const address = instructions.addressFor(activeCurrency);
    if (!address) {
      setError(`${activeCurrency} deposits aren't available yet.`);
      return;
    }

    setQuote({ currency: activeCurrency, address, amount: numericAmount });
    setError(null);
    setStep("details");
  }

  // Step 2 -> 3: this is when the deposit request is created
  async function confirmSent() {
    if (!quote || submitting) return;
    setError(null);

    try {
      const result = await requestDeposit.mutateAsync({
        amount: quote.amount,
        asset: quote.currency,
        address: quote.address,
      });
      setReference(result.reference);
      setStep("progress");
    } catch (err) {
      setError(getDepositErrorMessage(err));

      const raw = err instanceof Error ? err.message : String(err);
      if (/address was updated|not available yet/.test(raw)) {
        // Get the latest addresses and send the user back to the start
        await instructions.refetch();
        setQuote(null);
        setStep("amount");
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
      onClick={resetAndClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-title"
        onClick={(event) => event.stopPropagation()}
        className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#10161e] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f0b90b]/20 bg-[#f0b90b]/10">
              {step === "progress" ? (
                <Clock3 className="text-[#f0b90b]" size={21} />
              ) : step === "details" ? (
                <QrCode className="text-[#f0b90b]" size={21} />
              ) : (
                <Wallet className="text-[#f0b90b]" size={21} />
              )}
            </div>

            <div>
              <h2 id="deposit-title" className="text-lg font-semibold">
                {step === "amount"
                  ? "Deposit crypto"
                  : step === "details"
                    ? "Complete your deposit"
                    : "Deposit in progress"}
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                {step === "amount"
                  ? "Add funds to your account"
                  : step === "details"
                    ? "Send crypto to the address below"
                    : "Waiting for network confirmation"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close deposit modal"
            className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* STEP 1: Amount and cryptocurrency */}
          {step === "amount" && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-medium text-zinc-300">
                  Choose cryptocurrency
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {CRYPTO_OPTIONS.map((crypto) => {
                    const available = instructions.isAvailable(crypto.value);
                    const active = activeCurrency === crypto.value;

                    return (
                      <button
                        key={crypto.value}
                        type="button"
                        disabled={!available}
                        aria-disabled={!available}
                        title={
                          available || instructions.isPending
                            ? undefined
                            : `${crypto.value} deposits aren't available yet`
                        }
                        onClick={() => {
                          if (!available) return;
                          setCurrency(crypto.value);
                          setError(null);
                        }}
                        className={`rounded-2xl border p-3 text-left transition ${
                          !available
                            ? "cursor-not-allowed border-white/5 bg-white/1.5 opacity-45"
                            : active
                              ? "border-[#f0b90b]/60 bg-[#f0b90b]/[0.07]"
                              : "border-white/8 bg-white/2 hover:border-white/20"
                        }`}
                      >
                        <div
                          className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: `${crypto.color}20`,
                            color: crypto.color,
                          }}
                        >
                          {crypto.symbol}
                        </div>

                        <p className="text-sm font-semibold">{crypto.value}</p>
                        <p className="mt-1 truncate text-[10px] text-zinc-500">
                          {crypto.name}
                        </p>

                        {available && active && (
                          <CheckCircle2
                            size={15}
                            className="mt-2 text-[#f0b90b]"
                          />
                        )}

                        {!available && !instructions.isPending && (
                          <span className="mt-2 inline-block rounded bg-white/6 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-500">
                            Not available yet
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {instructions.isError && (
                  <div className="mt-3">
                    <ErrorMessage message="We couldn't load the deposit options." />
                    <button
                      type="button"
                      onClick={() => void instructions.refetch()}
                      className="mt-2 text-xs text-[#f0b90b] hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {nothingAvailable && (
                  <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200/80">
                    Deposits are temporarily unavailable. Please try again later
                    or contact support.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="deposit-amount"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Deposit amount
                </label>

                <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-[#f0b90b]/60">
                  <span className="mr-3 text-lg text-zinc-500">$</span>

                  <input
                    id="deposit-amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      setError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        continueToDetails();
                      }
                    }}
                    placeholder="0.00"
                    className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-700"
                  />

                  <span className="ml-2 text-xs font-semibold text-zinc-500">
                    USD
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[100, 250, 500, 1000].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setAmount(String(value));
                        setError(null);
                      }}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                        amount === String(value)
                          ? "border-[#f0b90b]/40 bg-[#f0b90b]/10 text-[#f0b90b]"
                          : "border-white/8 text-zinc-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      ${value.toLocaleString("en-US")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />

                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Crypto-only deposits
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    You&apos;ll receive the deposit address and QR code after
                    continuing. Make sure the selected currency and network
                    match before sending funds.
                  </p>
                </div>
              </div>

              {error && <ErrorMessage message={error} />}

              <button
                type="button"
                onClick={continueToDetails}
                disabled={instructions.isPending || !activeCurrency}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {instructions.isPending && (
                  <Loader2 size={17} className="animate-spin" />
                )}
                {instructions.isPending ? "Loading options..." : "Continue"}
              </button>

              <p className="text-center text-[11px] leading-5 text-zinc-600">
                Network fees may apply. Deposits are credited after the required
                network confirmations and our review.
              </p>
            </div>
          )}

          {/* STEP 2: QR code and deposit address */}
          {step === "details" && quote && quoteOption && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  if (submitting) return;
                  setStep("amount");
                  setError(null);
                }}
                className="inline-flex items-center gap-2 text-xs text-zinc-400 transition hover:text-white"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <div className="rounded-2xl border border-[#f0b90b]/20 bg-[#f0b90b]/5 p-4">
                <p className="text-xs text-zinc-400">Deposit amount in USD</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {money(quote.amount)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500">
                    Payment currency
                  </span>
                  <span className="rounded-lg bg-white/6 px-2.5 py-1 text-xs font-semibold">
                    {quote.currency}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500">Network</span>
                  <span className="text-xs font-medium text-zinc-200">
                    {quoteOption.network}
                  </span>
                </div>
                <p className="mt-3 text-[11px] leading-4 text-zinc-500">
                  Send the {quote.currency} equivalent of this amount at the
                  current exchange rate.
                </p>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-white/[0.07] bg-white/2 p-5">
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG
                    value={quote.address}
                    size={190}
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                  />
                </div>

                <p className="mt-4 text-sm font-medium">
                  Scan to send {quote.currency}
                </p>
                <p className="mt-1 text-center text-xs text-zinc-500">
                  Use a wallet that supports the correct network.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  {quote.currency} deposit address
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
                  <p className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-zinc-200">
                    {quote.address}
                  </p>

                  <button
                    type="button"
                    onClick={() => void copyText(quote.address)}
                    aria-label="Copy deposit address"
                    className="shrink-0 rounded-lg bg-white/6 p-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>

                {copied && (
                  <p className="mt-2 text-xs text-emerald-400">
                    Copied to clipboard
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-400"
                />
                <p className="text-xs leading-5 text-amber-200/80">
                  Only send {quote.currency} on the {quoteOption.network} to
                  this address. Transfers sent through an unsupported network or
                  with the wrong asset may be permanently lost.
                </p>
              </div>

              {error && <ErrorMessage message={error} />}

              <button
                type="button"
                onClick={() => void confirmSent()}
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {submitting ? "Submitting..." : "I've sent the funds"}
              </button>

              <p className="text-center text-[11px] leading-5 text-zinc-600">
                Your deposit remains unconfirmed until the transaction is
                detected and verified.
              </p>
            </div>
          )}

          {/* STEP 3: Deposit in progress */}
          {step === "progress" && quote && reference && (
            <div className="space-y-6 py-2">
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#f0b90b]/20 bg-[#f0b90b]/6">
                  <div className="absolute inset-2 animate-pulse rounded-full border border-[#f0b90b]/20" />
                  <Clock3 size={38} className="text-[#f0b90b]" />
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Your deposit is in progress
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                  Your deposit request has been created. Your balance will be
                  updated within a few minutes after we confirm your transfer.
                </p>

                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1.5 text-xs font-medium text-amber-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  Awaiting confirmation
                </span>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
                <ProgressRow
                  number="01"
                  title="Deposit request created"
                  description="Your deposit reference has been generated."
                  complete
                />

                <div className="ml-4 h-5 border-l border-white/10" />

                <ProgressRow
                  number="02"
                  title="Blockchain transaction"
                  description="Waiting for the transfer to be detected."
                  active
                />

                <div className="ml-4 h-5 border-l border-white/10" />

                <ProgressRow
                  number="03"
                  title="Confirmations and credit"
                  description="Your balance updates once we've verified your transfer."
                />
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-500">
                    Deposit reference
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyText(reference)}
                    aria-label="Copy deposit reference"
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/6 hover:text-white"
                  >
                    {copied ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <p className="mt-2 break-all font-mono text-xs text-zinc-200">
                  {reference}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
                  <span className="text-xs text-zinc-500">Amount</span>
                  <span className="text-sm font-semibold">
                    {money(quote.amount)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Asset</span>
                  <span className="text-sm font-medium">{quote.currency}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetAndClose}
                className="h-12 w-full rounded-xl border border-white/10 bg-white/4 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Done
              </button>

              <p className="text-center text-[11px] leading-5 text-zinc-600">
                You can close this window. We&apos;ll notify you as soon as your
                balance is updated.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/6 p-3 text-sm text-red-300"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

function ProgressRow({
  number,
  title,
  description,
  complete = false,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  complete?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          complete
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : active
              ? "border-[#f0b90b]/30 bg-[#f0b90b]/10 text-[#f0b90b]"
              : "border-white/10 bg-white/3 text-zinc-600"
        }`}
      >
        {complete ? (
          <Check size={15} />
        ) : active ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <span className="text-[10px] font-semibold">{number}</span>
        )}
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <p
          className={`text-sm font-medium ${
            complete || active ? "text-white" : "text-zinc-500"
          }`}
        >
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { QRCodeSVG } from "qrcode.react";
// import { AlertCircle, Check, CheckCircle2, Copy, X } from "lucide-react";
// import { toast } from "sonner";
// import {
//   BTC_NETWORK_LABEL,
//   DEPOSIT_ADDRESS,
//   MAX_DEPOSIT,
//   MIN_CONFIRMATIONS,
//   MIN_DEPOSIT,
// } from "@/constants/deposit";
// import { useRequestDeposit } from "@/hooks/deposit";
// import { formatUsd } from "@/libs/formatter/display";
// import { getDepositErrorMessage } from "@/services/deposit";

// type Props = { open: boolean; onClose: () => void };

// export default function DepositModal({ open, onClose }: Props) {
//   const [amount, setAmount] = useState("");
//   const [txid, setTxid] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [formError, setFormError] = useState<string | null>(null);
//   const [submitted, setSubmitted] = useState<{
//     reference: string;
//     amount: number;
//   } | null>(null);
//   const deposit = useRequestDeposit();

//   if (!open) return null;

//   const value = Number(amount);
//   const decimals = amount.includes(".") ? amount.split(".")[1].length : 0;

//   let amountError: string | null = null;
//   if (amount !== "") {
//     if (!Number.isFinite(value) || value <= 0)
//       amountError = "Enter a valid amount.";
//     else if (decimals > 2) amountError = "Use at most 2 decimal places.";
//     else if (value < MIN_DEPOSIT)
//       amountError = `Minimum deposit is ${formatUsd(MIN_DEPOSIT)}.`;
//     else if (value > MAX_DEPOSIT)
//       amountError = `Maximum deposit is ${formatUsd(MAX_DEPOSIT)}.`;
//   }

//   const cleanTxid = txid.trim().toLowerCase();
//   const txidError =
//     cleanTxid !== "" && !/^[0-9a-f]{64}$/.test(cleanTxid)
//       ? "A transaction ID has 64 characters (0-9 and a-f)."
//       : null;

//   const canSubmit =
//     amount !== "" &&
//     !amountError &&
//     !txidError &&
//     !!DEPOSIT_ADDRESS &&
//     !deposit.isPending;

//   async function copyAddress() {
//     try {
//       await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1800);
//     } catch {
//       toast.error("Couldn't copy. Select the address and copy it by hand.");
//     }
//   }

//   async function submit() {
//     if (!canSubmit) return;
//     setFormError(null);
//     try {
//       const result = await deposit.mutateAsync({
//         amount: value,
//         txid: cleanTxid || undefined,
//       });
//       setSubmitted({
//         reference: result.reference,
//         amount: Number(result.amount),
//       });
//     } catch (error) {
//       setFormError(getDepositErrorMessage(error));
//     }
//   }

//   function handleClose() {
//     if (deposit.isPending) return;
//     setAmount("");
//     setTxid("");
//     setCopied(false);
//     setFormError(null);
//     setSubmitted(null);
//     onClose();
//   }

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
//       <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/8 bg-[#10161e] p-6 shadow-2xl">
//         {submitted ? (
//           <div className="text-center">
//             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
//               <CheckCircle2 size={28} className="text-emerald-400" />
//             </div>

//             <h2 className="mt-5 text-xl font-semibold">
//               Deposit request received
//             </h2>
//             <p className="mt-2 text-sm leading-6 text-zinc-400">
//               Your balance will be updated within a few minutes after we confirm
//               your transfer. We'll send you a notification when it's done.
//             </p>

//             <div className="mt-6 space-y-3 rounded-2xl border border-white/8 bg-black/30 p-4 text-left text-sm">
//               <div className="flex justify-between gap-4">
//                 <span className="text-zinc-500">Amount</span>
//                 <span className="font-medium">
//                   {formatUsd(submitted.amount)}
//                 </span>
//               </div>
//               <div className="flex justify-between gap-4">
//                 <span className="text-zinc-500">Reference</span>
//                 <span className="break-all font-mono text-xs">
//                   {submitted.reference}
//                 </span>
//               </div>
//               <div className="flex justify-between gap-4">
//                 <span className="text-zinc-500">Status</span>
//                 <span className="text-[#f0b90b]">Pending confirmation</span>
//               </div>
//             </div>

//             <button
//               onClick={handleClose}
//               className="mt-6 h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928]"
//             >
//               Done
//             </button>
//           </div>
//         ) : (
//           <>
//             <div className="mb-6 flex items-start justify-between">
//               <div>
//                 <h2 className="text-xl font-semibold">Deposit Bitcoin</h2>
//                 <p className="mt-1 text-xs text-zinc-500">
//                   {BTC_NETWORK_LABEL}
//                 </p>
//               </div>
//               <button
//                 onClick={handleClose}
//                 aria-label="Close"
//                 className="rounded-xl p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
//               >
//                 <X size={19} />
//               </button>
//             </div>

//             <div className="space-y-5">
//               <div>
//                 <label className="mb-2 block text-xs font-medium text-zinc-400">
//                   Amount (USD)
//                 </label>
//                 <div className="flex h-12 items-center gap-2 rounded-xl border border-white/8 bg-black/30 px-3 focus-within:border-[#f0b90b]/40">
//                   <span className="text-zinc-500">$</span>
//                   <input
//                     value={amount}
//                     inputMode="decimal"
//                     placeholder={`Min ${MIN_DEPOSIT}`}
//                     onChange={(e) =>
//                       setAmount(e.target.value.replace(/[^0-9.]/g, ""))
//                     }
//                     className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
//                   />
//                 </div>
//                 {amountError ? (
//                   <p className="mt-1.5 text-xs text-red-400">{amountError}</p>
//                 ) : (
//                   <p className="mt-1.5 text-xs text-zinc-600">
//                     Send the Bitcoin equivalent of this amount.
//                   </p>
//                 )}
//               </div>

//               {DEPOSIT_ADDRESS ? (
//                 <>
//                   <div className="flex justify-center rounded-2xl border border-white/8 bg-white p-4">
//                     <QRCodeSVG value={DEPOSIT_ADDRESS} size={160} />
//                   </div>

//                   <div>
//                     <label className="mb-2 block text-xs font-medium text-zinc-400">
//                       Deposit address
//                     </label>
//                     <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/30 p-3">
//                       <p className="min-w-0 flex-1 break-all font-mono text-sm text-white">
//                         {DEPOSIT_ADDRESS}
//                       </p>
//                       <button
//                         onClick={copyAddress}
//                         aria-label="Copy deposit address"
//                         className="shrink-0 rounded-lg bg-white/5 p-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
//                       >
//                         {copied ? (
//                           <Check size={16} className="text-emerald-400" />
//                         ) : (
//                           <Copy size={16} />
//                         )}
//                       </button>
//                     </div>
//                     {copied && (
//                       <p className="mt-1.5 text-xs text-emerald-400">
//                         Address copied
//                       </p>
//                     )}
//                   </div>
//                 </>
//               ) : (
//                 <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
//                   Deposits aren't available right now. Please try again later.
//                 </p>
//               )}

//               <div>
//                 <label className="mb-2 block text-xs font-medium text-zinc-400">
//                   Transaction ID{" "}
//                   <span className="text-zinc-600">
//                     (optional, helps us confirm faster)
//                   </span>
//                 </label>
//                 <input
//                   value={txid}
//                   onChange={(e) => setTxid(e.target.value.replace(/\s/g, ""))}
//                   placeholder="Paste it after you've sent the funds"
//                   className="h-11 w-full rounded-xl border border-white/8 bg-black/30 px-3 font-mono text-xs outline-none placeholder:font-sans placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
//                 />
//                 {txidError && (
//                   <p className="mt-1.5 text-xs text-red-400">{txidError}</p>
//                 )}
//               </div>

//               <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
//                 <AlertCircle
//                   size={16}
//                   className="mt-0.5 shrink-0 text-amber-400"
//                 />
//                 <p className="text-xs leading-5 text-amber-200/80">
//                   Only send BTC on the Bitcoin network to this address. Sending
//                   any other asset or using a different network will result in
//                   permanent loss of funds. Your balance updates after{" "}
//                   {MIN_CONFIRMATIONS} network confirmations and our
//                   confirmation.
//                 </p>
//               </div>

//               {formError && <p className="text-sm text-red-400">{formError}</p>}

//               <button
//                 onClick={submit}
//                 disabled={!canSubmit}
//                 className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {deposit.isPending ? "Submitting…" : "I've sent the funds"}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Check, Copy, X, AlertCircle } from "lucide-react";
// import { QRCodeSVG } from "qrcode.react";

// type Props = {
//   open: boolean;
//   onClose: () => void;
// };

// const DEPOSIT_ADDRESS = "bc1qpxnvz7vghpdc2musffkfqjj9mm3ajkmkh4k0es";
// const NETWORK_LABEL = "Bitcoin Network (BTC)";
// const MIN_CONFIRMATIONS = 2;

// const btcSvgDataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 64 64"
//     width="64"
//     height="64"
//   >
//     <circle cx="32" cy="32" r="32" fill="#F7931A" />
//     <text
//       x="32"
//       y="44"
//       text-anchor="middle"
//       font-family="Arial, sans-serif"
//       font-size="42"
//       font-weight="bold"
//       fill="#FFFFFF"
//     >₿</text>
//   </svg>
// `)}`;

// export default function DepositModal({ open, onClose }: Props) {
//   const [copied, setCopied] = useState(false);
//   const [copyError, setCopyError] = useState(false);

//   if (!open) return null;

//   async function copyAddress() {
//     try {
//       await navigator.clipboard.writeText(DEPOSIT_ADDRESS);
//       setCopied(true);
//       setCopyError(false);

//       window.setTimeout(() => {
//         setCopied(false);
//       }, 1800);
//     } catch {
//       setCopied(false);
//       setCopyError(true);
//     }
//   }

//   return (
//     <div
//       className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="deposit-modal-title"
//         className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10161e] p-5 text-white shadow-2xl sm:p-6"
//         onClick={(event) => event.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between">
//           <div>
//             <h2 id="deposit-modal-title" className="text-xl font-semibold">
//               Deposit Bitcoin
//             </h2>

//             <p className="mt-1 text-xs text-zinc-500">{NETWORK_LABEL}</p>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close deposit modal"
//             className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         <div className="space-y-5">
//           {/* QR Code */}
//           <div className="flex flex-col items-center justify-center">
//             <div className="rounded-2xl border border-white/10 bg-white p-3">
//               <QRCodeSVG
//                 value={DEPOSIT_ADDRESS}
//                 size={180}
//                 level="H"
//                 bgColor="#FFFFFF"
//                 fgColor="#000000"
//                 imageSettings={{
//                   src: btcSvgDataUri,
//                   x: undefined,
//                   y: undefined,
//                   height: 36,
//                   width: 36,
//                   excavate: true,
//                   opacity: 1,
//                 }}
//               />
//             </div>

//             <p className="mt-3 text-xs text-zinc-500">
//               Scan to copy the Bitcoin deposit address
//             </p>
//           </div>

//           {/* Deposit Address */}
//           <div>
//             <label className="mb-2 block text-xs font-medium text-zinc-400">
//               Your deposit address
//             </label>

//             <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
//               <p className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-white sm:text-sm">
//                 {DEPOSIT_ADDRESS}
//               </p>

//               <button
//                 type="button"
//                 onClick={copyAddress}
//                 aria-label="Copy deposit address"
//                 className="shrink-0 rounded-lg bg-white/5 p-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
//               >
//                 {copied ? (
//                   <Check size={16} className="text-emerald-400" />
//                 ) : (
//                   <Copy size={16} />
//                 )}
//               </button>
//             </div>

//             {copied && (
//               <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
//                 <Check size={13} />
//                 Address copied to clipboard
//               </p>
//             )}

//             {copyError && (
//               <p className="mt-2 text-xs text-red-400">
//                 Could not copy automatically. Please select and copy the address
//                 manually.
//               </p>
//             )}
//           </div>

//           {/* Warning */}
//           <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
//             <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-400" />

//             <p className="text-xs leading-5 text-amber-200/80">
//               Only send BTC on the Bitcoin network to this address. Sending
//               another asset or using a different network may result in permanent
//               loss of funds. Your balance should update after{" "}
//               {MIN_CONFIRMATIONS} network confirmations, subject to your
//               platform&apos;s deposit processing rules.
//             </p>
//           </div>

//           {/* Close / Acknowledgment */}
//           <button
//             type="button"
//             onClick={onClose}
//             className="h-12 w-full rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] focus:outline-none focus:ring-2 focus:ring-[#f0b90b] focus:ring-offset-2 focus:ring-offset-[#10161e]"
//           >
//             I&apos;ve sent the funds
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import {
//   AlertCircle,
//   ArrowLeft,
//   Check,
//   CheckCircle2,
//   Clock3,
//   Copy,
//   Loader2,
//   QrCode,
//   ShieldCheck,
//   Wallet,
//   X,
// } from "lucide-react";
// import { QRCodeSVG } from "qrcode.react";

// type Props = {
//   open: boolean;
//   onClose: () => void;
// };

// type CryptoCurrency = "BTC" | "ETH" | "USDT";
// type Step = "amount" | "details" | "progress";

// type DepositResult = {
//   reference: string;
//   address: string;
//   expectedAmount?: number | string;
// };

// const CRYPTO_OPTIONS: {
//   value: CryptoCurrency;
//   name: string;
//   network: string;
//   color: string;
//   description: string;
// }[] = [
//   {
//     value: "BTC",
//     name: "Bitcoin",
//     network: "Bitcoin Network",
//     color: "#F7931A",
//     description: "BTC",
//   },
//   {
//     value: "ETH",
//     name: "Ethereum",
//     network: "Ethereum Network",
//     color: "#8B9EFF",
//     description: "ETH",
//   },
//   {
//     value: "USDT",
//     name: "Tether",
//     network: "Confirm supported USDT network",
//     color: "#26A17B",
//     description: "USDT",
//   },
// ];

// export default function DepositModal({ open, onClose }: Props) {
//   const [step, setStep] = useState<Step>("amount");
//   const [amount, setAmount] = useState("");
//   const [currency, setCurrency] = useState<CryptoCurrency>("BTC");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   const [deposit, setDeposit] = useState<DepositResult | null>(null);

//   if (!open) return null;

//   const selectedCrypto = CRYPTO_OPTIONS.find(
//     (item) => item.value === currency,
//   )!;

//   function resetAndClose() {
//     setStep("amount");
//     setAmount("");
//     setCurrency("BTC");
//     setSubmitting(false);
//     setError(null);
//     setCopied(false);
//     setDeposit(null);
//     onClose();
//   }

//   async function copyText(text: string) {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(true);
//       window.setTimeout(() => setCopied(false), 1800);
//     } catch {
//       setError("Unable to copy automatically. Please copy the text manually.");
//     }
//   }

//   async function createDeposit() {
//     const numericAmount = Number(amount);

//     if (
//       !amount.trim() ||
//       !Number.isFinite(numericAmount) ||
//       numericAmount <= 0
//     ) {
//       setError("Enter a valid deposit amount greater than $0.");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/v1/deposits/initiate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           amount: numericAmount,
//           method: "crypto",
//           cryptoCurrency: currency,
//         }),
//       });

//       const body = await response.json();

//       if (!response.ok) {
//         setError(
//           body.error ?? "Unable to create your deposit. Please try again.",
//         );
//         return;
//       }

//       const address = body.address;
//       const reference = body.deposit?.reference;
//       const expectedAmount = body.expectedAmount;

//       if (!address || !reference) {
//         setError(
//           "The deposit service did not return a wallet address and reference. Please contact support.",
//         );
//         return;
//       }

//       setDeposit({
//         reference,
//         address,
//         expectedAmount,
//       });

//       setStep("details");
//     } catch {
//       setError("Network error. Please check your connection and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   function showProgress() {
//     setStep("progress");
//     setError(null);
//   }

//   return (
//     <div
//       className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
//       onClick={resetAndClose}
//     >
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="deposit-title"
//         onClick={(event) => event.stopPropagation()}
//         className="my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#10161e] text-white shadow-2xl"
//       >
//         {/* Header */}
//         <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f0b90b]/20 bg-[#f0b90b]/10">
//               {step === "progress" ? (
//                 <Clock3 className="text-[#f0b90b]" size={21} />
//               ) : step === "details" ? (
//                 <QrCode className="text-[#f0b90b]" size={21} />
//               ) : (
//                 <Wallet className="text-[#f0b90b]" size={21} />
//               )}
//             </div>

//             <div>
//               <h2 id="deposit-title" className="text-lg font-semibold">
//                 {step === "amount"
//                   ? "Deposit crypto"
//                   : step === "details"
//                     ? "Complete your deposit"
//                     : "Deposit in progress"}
//               </h2>

//               <p className="mt-1 text-xs text-zinc-500">
//                 {step === "amount"
//                   ? "Add funds to your account"
//                   : step === "details"
//                     ? "Send crypto to the address below"
//                     : "Waiting for network confirmation"}
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={resetAndClose}
//             aria-label="Close deposit modal"
//             className="rounded-xl p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
//           >
//             <X size={19} />
//           </button>
//         </div>

//         <div className="p-5 sm:p-6">
//           {/* STEP 1: Amount and cryptocurrency */}
//           {step === "amount" && (
//             <div className="space-y-6">
//               <div>
//                 <p className="mb-3 text-sm font-medium text-zinc-300">
//                   Choose cryptocurrency
//                 </p>

//                 <div className="grid grid-cols-3 gap-2">
//                   {CRYPTO_OPTIONS.map((crypto) => {
//                     const active = currency === crypto.value;

//                     return (
//                       <button
//                         key={crypto.value}
//                         type="button"
//                         onClick={() => {
//                           setCurrency(crypto.value);
//                           setError(null);
//                         }}
//                         className={`rounded-2xl border p-3 text-left transition ${
//                           active
//                             ? "border-[#f0b90b]/60 bg-[#f0b90b]/[0.07]"
//                             : "border-white/8 bg-white/2 hover:border-white/20"
//                         }`}
//                       >
//                         <div
//                           className="mb-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
//                           style={{
//                             backgroundColor: `${crypto.color}20`,
//                             color: crypto.color,
//                           }}
//                         >
//                           {crypto.value === "BTC"
//                             ? "₿"
//                             : crypto.value === "ETH"
//                               ? "Ξ"
//                               : "₮"}
//                         </div>

//                         <p className="text-sm font-semibold">{crypto.value}</p>
//                         <p className="mt-1 truncate text-[10px] text-zinc-500">
//                           {crypto.name}
//                         </p>

//                         {active && (
//                           <CheckCircle2
//                             size={15}
//                             className="mt-2 text-[#f0b90b]"
//                           />
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>

//               <div>
//                 <label
//                   htmlFor="deposit-amount"
//                   className="mb-2 block text-sm font-medium text-zinc-300"
//                 >
//                   Deposit amount
//                 </label>

//                 <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-black/20 px-4 transition focus-within:border-[#f0b90b]/60">
//                   <span className="mr-3 text-lg text-zinc-500">$</span>

//                   <input
//                     id="deposit-amount"
//                     type="number"
//                     inputMode="decimal"
//                     min="0.01"
//                     step="0.01"
//                     value={amount}
//                     onChange={(event) => {
//                       setAmount(event.target.value);
//                       setError(null);
//                     }}
//                     onKeyDown={(event) => {
//                       if (event.key === "Enter") {
//                         void createDeposit();
//                       }
//                     }}
//                     placeholder="0.00"
//                     className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-zinc-700"
//                   />

//                   <span className="ml-2 text-xs font-semibold text-zinc-500">
//                     USD
//                   </span>
//                 </div>

//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {[100, 250, 500, 1000].map((value) => (
//                     <button
//                       key={value}
//                       type="button"
//                       onClick={() => {
//                         setAmount(String(value));
//                         setError(null);
//                       }}
//                       className={`rounded-lg border px-3 py-1.5 text-xs transition ${
//                         amount === String(value)
//                           ? "border-[#f0b90b]/40 bg-[#f0b90b]/10 text-[#f0b90b]"
//                           : "border-white/8 text-zinc-400 hover:border-white/20 hover:text-white"
//                       }`}
//                     >
//                       ${value.toLocaleString("en-US")}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
//                 <ShieldCheck
//                   size={19}
//                   className="mt-0.5 shrink-0 text-emerald-400"
//                 />

//                 <div>
//                   <p className="text-sm font-medium text-zinc-200">
//                     Crypto-only deposits
//                   </p>
//                   <p className="mt-1 text-xs leading-5 text-zinc-500">
//                     You&apos;ll receive the deposit address and QR code after
//                     continuing. Make sure the selected currency and network
//                     match before sending funds.
//                   </p>
//                 </div>
//               </div>

//               {error && <ErrorMessage message={error} />}

//               <button
//                 type="button"
//                 onClick={() => void createDeposit()}
//                 disabled={submitting}
//                 className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {submitting && <Loader2 size={17} className="animate-spin" />}
//                 {submitting ? "Preparing deposit..." : "Continue"}
//               </button>

//               <p className="text-center text-[11px] leading-5 text-zinc-600">
//                 Network fees may apply. Deposits are credited after the required
//                 confirmations and server-side verification.
//               </p>
//             </div>
//           )}

//           {/* STEP 2: QR code and deposit address */}
//           {step === "details" && deposit && (
//             <div className="space-y-5">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setStep("amount");
//                   setError(null);
//                 }}
//                 className="inline-flex items-center gap-2 text-xs text-zinc-400 transition hover:text-white"
//               >
//                 <ArrowLeft size={14} />
//                 Back
//               </button>

//               <div className="rounded-2xl border border-[#f0b90b]/20 bg-[#f0b90b]/5 p-4">
//                 <p className="text-xs text-zinc-400">Deposit amount in USD</p>
//                 <p className="mt-1 text-2xl font-semibold tracking-tight">
//                   $
//                   {Number(amount).toLocaleString("en-US", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </p>
//                 <div className="mt-3 flex items-center justify-between gap-3">
//                   <span className="text-xs text-zinc-500">
//                     Payment currency
//                   </span>
//                   <span className="rounded-lg bg-white/6 px-2.5 py-1 text-xs font-semibold">
//                     {currency}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex flex-col items-center rounded-2xl border border-white/[0.07] bg-white/2 p-5">
//                 <div className="rounded-2xl bg-white p-3">
//                   <QRCodeSVG
//                     value={deposit.address}
//                     size={190}
//                     level="H"
//                     bgColor="#FFFFFF"
//                     fgColor="#111827"
//                   />
//                 </div>

//                 <p className="mt-4 text-sm font-medium">
//                   Scan to send {currency}
//                 </p>
//                 <p className="mt-1 text-center text-xs text-zinc-500">
//                   Use a wallet that supports the correct network.
//                 </p>
//               </div>

//               {deposit.expectedAmount !== undefined && (
//                 <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
//                   <p className="text-xs text-zinc-500">Exact amount to send</p>
//                   <p className="mt-1 break-all font-mono text-sm font-semibold text-white">
//                     {deposit.expectedAmount} {currency}
//                   </p>
//                 </div>
//               )}

//               <div>
//                 <label className="mb-2 block text-xs font-medium text-zinc-400">
//                   {currency} deposit address
//                 </label>

//                 <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
//                   <p className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-zinc-200">
//                     {deposit.address}
//                   </p>

//                   <button
//                     type="button"
//                     onClick={() => void copyText(deposit.address)}
//                     aria-label="Copy deposit address"
//                     className="shrink-0 rounded-lg bg-white/6 p-2.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
//                   >
//                     {copied ? (
//                       <Check size={16} className="text-emerald-400" />
//                     ) : (
//                       <Copy size={16} />
//                     )}
//                   </button>
//                 </div>

//                 {copied && (
//                   <p className="mt-2 text-xs text-emerald-400">
//                     Copied to clipboard
//                   </p>
//                 )}
//               </div>

//               <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
//                 <AlertCircle
//                   size={16}
//                   className="mt-0.5 shrink-0 text-amber-400"
//                 />
//                 <p className="text-xs leading-5 text-amber-200/80">
//                   Only send {currency} using the supported network for this
//                   deposit. Transfers sent through an unsupported network or with
//                   the wrong asset may be permanently lost.
//                 </p>
//               </div>

//               {error && <ErrorMessage message={error} />}

//               <button
//                 type="button"
//                 onClick={showProgress}
//                 className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928]"
//               >
//                 <CheckCircle2 size={17} />
//                 I&apos;ve sent the funds
//               </button>

//               <p className="text-center text-[11px] leading-5 text-zinc-600">
//                 Your deposit remains unconfirmed until the transaction is
//                 detected and verified.
//               </p>
//             </div>
//           )}

//           {/* STEP 3: Deposit in progress */}
//           {step === "progress" && deposit && (
//             <div className="space-y-6 py-2">
//               <div className="flex flex-col items-center text-center">
//                 <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#f0b90b]/20 bg-[#f0b90b]/6">
//                   <div className="absolute inset-2 animate-pulse rounded-full border border-[#f0b90b]/20" />
//                   <Clock3 size={38} className="text-[#f0b90b]" />
//                 </div>

//                 <h3 className="mt-5 text-xl font-semibold">
//                   Your deposit is in progress
//                 </h3>

//                 <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
//                   Your deposit request has been created. We&apos;re waiting for
//                   the blockchain transaction to be detected and confirmed.
//                 </p>

//                 <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1.5 text-xs font-medium text-amber-300">
//                   <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
//                   Awaiting confirmation
//                 </span>
//               </div>

//               <div className="space-y-4 rounded-2xl border border-white/[0.07] bg-white/2.5 p-4">
//                 <ProgressRow
//                   number="01"
//                   title="Deposit request created"
//                   description="Your deposit reference has been generated."
//                   complete
//                 />

//                 <div className="ml-4 h-5 border-l border-white/10" />

//                 <ProgressRow
//                   number="02"
//                   title="Blockchain transaction"
//                   description="Waiting for the transfer to be detected."
//                   active
//                 />

//                 <div className="ml-4 h-5 border-l border-white/10" />

//                 <ProgressRow
//                   number="03"
//                   title="Confirmations and credit"
//                   description="Your balance updates after server-side verification."
//                 />
//               </div>

//               <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
//                 <div className="flex items-center justify-between gap-3">
//                   <span className="text-xs text-zinc-500">
//                     Deposit reference
//                   </span>
//                   <button
//                     type="button"
//                     onClick={() => void copyText(deposit.reference)}
//                     aria-label="Copy deposit reference"
//                     className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/6 hover:text-white"
//                   >
//                     {copied ? (
//                       <Check size={14} className="text-emerald-400" />
//                     ) : (
//                       <Copy size={14} />
//                     )}
//                   </button>
//                 </div>

//                 <p className="mt-2 break-all font-mono text-xs text-zinc-200">
//                   {deposit.reference}
//                 </p>

//                 <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
//                   <span className="text-xs text-zinc-500">Amount</span>
//                   <span className="text-sm font-semibold">
//                     $
//                     {Number(amount).toLocaleString("en-US", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </span>
//                 </div>

//                 <div className="mt-3 flex items-center justify-between">
//                   <span className="text-xs text-zinc-500">Asset</span>
//                   <span className="text-sm font-medium">{currency}</span>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={resetAndClose}
//                 className="h-12 w-full rounded-xl border border-white/10 bg-white/4 text-sm font-semibold text-white transition hover:bg-white/8"
//               >
//                 Done
//               </button>

//               <p className="text-center text-[11px] leading-5 text-zinc-600">
//                 You can close this window. This screen does not independently
//                 verify blockchain activity; check your deposit history for the
//                 latest confirmed status.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function ErrorMessage({ message }: { message: string }) {
//   return (
//     <div
//       role="alert"
//       className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/6 p-3 text-sm text-red-300"
//     >
//       <AlertCircle size={16} className="mt-0.5 shrink-0" />
//       <p>{message}</p>
//     </div>
//   );
// }

// function ProgressRow({
//   number,
//   title,
//   description,
//   complete = false,
//   active = false,
// }: {
//   number: string;
//   title: string;
//   description: string;
//   complete?: boolean;
//   active?: boolean;
// }) {
//   return (
//     <div className="flex items-start gap-3">
//       <div
//         className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
//           complete
//             ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
//             : active
//               ? "border-[#f0b90b]/30 bg-[#f0b90b]/10 text-[#f0b90b]"
//               : "border-white/10 bg-white/3 text-zinc-600"
//         }`}
//       >
//         {complete ? (
//           <Check size={15} />
//         ) : active ? (
//           <Loader2 size={15} className="animate-spin" />
//         ) : (
//           <span className="text-[10px] font-semibold">{number}</span>
//         )}
//       </div>

//       <div className="min-w-0 flex-1 pt-0.5">
//         <p
//           className={`text-sm font-medium ${
//             complete || active ? "text-white" : "text-zinc-500"
//           }`}
//         >
//           {title}
//         </p>
//         <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
//       </div>
//     </div>
//   );
// }

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
