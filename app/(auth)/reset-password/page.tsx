"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/libs/supabase/browser";

function validate(password: string, confirm: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Use at least one letter and one number.";
  }
  if (password !== confirm) return "The two passwords don't match.";
  return null;
}

function ResetPasswordForm() {
  const router = useRouter();
  const tokenHash = useSearchParams().get("token_hash");
  const verified = useRef(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tokenHash) {
    return (
      <div className="text-center">
        <h1 className="text-xl font-semibold">This link isn't valid</h1>
        <p className="mt-2 text-sm text-zinc-500">
          The reset link is incomplete or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;

    const problem = validate(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // The link is checked once, when the user submits
      if (!verified.current) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "recovery",
        });

        if (verifyError) {
          setError(
            "This reset link has expired or was already used. Please request a new one.",
          );
          return;
        }
        verified.current = true;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Sign out everywhere, then ask for the new password
      await supabase.auth.signOut({ scope: "global" }).catch(() => {});
      toast.success("Password updated. Please sign in.");
      router.replace("/login?reset=success");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0b90b]/10 text-[#f0b90b]">
          <Lock size={22} />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          At least 8 characters, with a letter and a number.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs text-zinc-500">New password</label>
        <div className="flex h-12 items-center rounded-xl border border-white/10 bg-black/20 px-3 focus-within:border-[#f0b90b]/60">
          <input
            type={show ? "text" : "password"}
            value={password}
            autoComplete="new-password"
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="w-full bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
            className="text-zinc-500 hover:text-white"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs text-zinc-500">
          Confirm new password
        </label>
        <input
          type={show ? "text" : "password"}
          value={confirm}
          autoComplete="new-password"
          onChange={(e) => {
            setConfirm(e.target.value);
            setError(null);
          }}
          className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none focus:border-[#f0b90b]/60"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/6 p-3 text-sm text-red-300"
        >
          {error}{" "}
          {/expired|already used/.test(error) && (
            <Link href="/forgot-password" className="underline">
              Request a new link
            </Link>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] text-sm font-semibold text-black transition hover:bg-[#ffc928] disabled:opacity-60"
      >
        {busy && <Loader2 size={17} className="animate-spin" />}
        {busy ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080c11] p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#10161e] p-6 shadow-2xl sm:p-8">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}

// "use client";

// import FormField from "@/components/forms/FormField";
// import Logo from "@/components/Logo";
// import {
//   ResetPasswordInput,
//   resetPasswordSchema,
// } from "@/libs/validations/auth";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// import { ArrowLeft, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useState } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import Link from "next/link";

// function ResetPasswordFormContent() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [complete, setComplete] = useState<boolean>(false);

//   const email = searchParams.get("email") || "";
//   const token = searchParams.get("token") || "";

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ResetPasswordInput>({
//     resolver: zodResolver(resetPasswordSchema),
//   });

//   const updatePasswordMutation = useMutation({
//     mutationFn: async (values: ResetPasswordInput) => {
//       const response = await fetch("/api/v1/auth/confirm-password-reset", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           email,
//           token,
//           password: values.password,
//         }),
//       });

//       const result = await response.json();
//       if (!response.ok)
//         throw new Error(
//           result.error || "Failed to re-initialize account credentials.",
//         );
//       return result;
//     },
//     onMutate: () => {
//       return toast.loading("Overwriting cryptographic profile nodes...");
//     },
//     onSuccess: (data, variables, contextToastId) => {
//       toast.dismiss(contextToastId);
//       toast.success("Security keys successfully modified!");
//       setComplete(true);
//     },
//     onError: (error: any, variables, contextToastId) => {
//       toast.dismiss(contextToastId);
//       toast.error(error.message || "Failed to commit credential updates.");
//     },
//   });

//   if (!email || !token) {
//     return (
//       <div className="text-center py-6">
//         <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 mb-4 inline-block">
//           <ShieldAlert size={28} />
//         </div>
//         <h3 className="font-semibold text-xl text-zinc-100 tracking-tight mb-2">
//           Invalid Security Trace
//         </h3>
//         <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6 mx-auto">
//           This secure link is either malformed, broken, or has expired. Please
//           initiate a new passkey recovery request sequence.
//         </p>
//         <Link
//           href="/auth/forgot-password"
//           className="inline-flex items-center gap-2 text-xs font-medium text-[#e9ce39] hover:underline"
//         >
//           <ArrowLeft size={14} /> Re-request recovery link
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <>
//       {!complete ? (
//         <>
//           <div className="mb-6">
//             <h3 className="font-semibold text-2xl text-zinc-100 tracking-tight mb-1.5">
//               Reset Security Keys
//             </h3>
//             <p className="text-xs text-zinc-400 leading-relaxed">
//               Establishing a new secure override trace password for account
//               identifier:{" "}
//               <span className="text-zinc-200 font-medium">{email}</span>
//             </p>
//           </div>

//           <form
//             onSubmit={handleSubmit((values) =>
//               updatePasswordMutation.mutate(values),
//             )}
//             className="flex flex-col space-y-4"
//           >
//             <FormField
//               field={{
//                 id: 1,
//                 name: "New Master Password",
//                 fieldName: "password",
//                 type: "password",
//                 placeholder: "••••••••••••",
//                 icon: Lock,
//               }}
//               register={register}
//               error={errors.password?.message}
//             />

//             <FormField
//               field={{
//                 id: 2,
//                 name: "Confirm Master Password",
//                 fieldName: "confirmPassword",
//                 type: "password",
//                 placeholder: "••••••••••••",
//                 icon: Lock,
//               }}
//               register={register}
//               error={errors.confirmPassword?.message}
//             />

//             <button
//               type="submit"
//               disabled={updatePasswordMutation.isPending}
//               className={`w-full bg-[#dabc17] text-black font-bold py-2.5 rounded-lg text-sm tracking-wide transition-all ${
//                 updatePasswordMutation.isPending
//                   ? "opacity-50 cursor-not-allowed scale-[0.99]"
//                   : "hover:bg-[#ebd026] active:scale-[0.98]"
//               }`}
//             >
//               {updatePasswordMutation.isPending
//                 ? "Updating Security Ledgers..."
//                 : "Commit Credential Override"}
//             </button>
//           </form>
//         </>
//       ) : (
//         /* SUCCESS COMPLETION FLOW STATE */
//         <div className="text-center py-4 flex flex-col items-center">
//           <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
//             <CheckCircle2 size={26} />
//           </div>
//           <h3 className="font-semibold text-xl text-zinc-100 tracking-tight mb-2">
//             Credentials Rewritten
//           </h3>
//           <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-6">
//             Your master password node has been cleanly overwritten. You can now
//             securely log back into your dashboard workspace.
//           </p>
//           <button
//             onClick={() => router.push("/auth/login")}
//             className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 font-medium py-2 rounded-lg text-xs transition-colors"
//           >
//             Proceed to Secure Login Gate
//           </button>
//         </div>
//       )}
//     </>
//   );
// }

// export default function ResetPasswordPage() {
//   return (
//     <div className="flex justify-center items-center min-h-screen p-4 bg-black text-white antialiased">
//       <div className="w-full max-w-md p-4">
//         {/* Branding Node Header */}
//         <div className="flex flex-col items-center gap-2 mb-8">
//           <Logo />
//           <h2 className="text-xl">
//             <span className="text-[#e9ce39] font-semibold">BNB</span> Investment
//             Trade
//           </h2>
//           <p className="text-xs text-zinc-500 tracking-wider">
//             Secure . Reliable . Trusted
//           </p>
//         </div>

//         {/* Central Card Container */}
//         <div className="border border-[#e9cf393a] bg-[#09090B] p-6 rounded-xl shadow-2xl relative overflow-hidden">
//           {/* Next.js requires useSearchParams hooks to be wrapped in a Suspense boundary */}
//           <Suspense
//             fallback={
//               <div className="text-zinc-500 text-xs text-center py-8">
//                 Mounting secure handshake tunnel...
//               </div>
//             }
//           >
//             <ResetPasswordFormContent />
//           </Suspense>

//           {/* Bottom Navigation Safety Anchor */}
//           {!updatePasswordMutationIsPendingPlaceholder && (
//             <div className="mt-6 pt-5 border-t border-zinc-900 flex justify-center">
//               <Link
//                 href="/auth/login"
//                 className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-400 transition-colors group"
//               >
//                 <ArrowLeft
//                   size={12}
//                   className="transition-transform group-hover:-translate-x-0.5"
//                 />
//                 <span>Return to terminal gate</span>
//               </Link>
//             </div>
//           )}

//           <div className="absolute top-0 right-0 w-24 h-24 bg-[#dabc17] opacity-[0.01] rounded-full blur-2xl pointer-events-none" />
//         </div>
//       </div>
//     </div>
//   );
// }

// const updatePasswordMutationIsPendingPlaceholder = false;
