"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Lock,
  QrCode,
  RotateCcw,
  Save,
  Settings,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { getSettingsErrorMessage } from "@/services/settings.service";
import type { AdminSettings } from "@/types/settings";
import { COIN_FIELDS } from "@/constants/admin/settings";
import { useAdminSettings } from "@/hooks/settings";
import { formatDateTime } from "@/libs/formatter/display";

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-[#f0b90b]" : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/5 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-xl">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/6 bg-[#0b1016]">
      <div className="flex items-start gap-4 border-b border-white/6 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
          <Icon size={19} />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-xs text-zinc-600">{description}</p>
        </div>
      </div>

      <div className="px-5">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  mono = false,
  badge,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
  badge?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs text-zinc-500">{label}</label>
        {badge}
      </div>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#f0b90b]/40 ${
          mono ? "font-mono text-xs" : ""
        }`}
      />

      {hint && (
        <p className="mt-2 text-[11px] leading-4 text-zinc-600">{hint}</p>
      )}
    </div>
  );
}

const mask = (value: string) =>
  !value
    ? "(off)"
    : value.length > 14
      ? `${value.slice(0, 6)}…${value.slice(-6)}`
      : value;

// Changes that deserve an "are you sure?"
function riskyChanges(before: AdminSettings, after: AdminSettings) {
  const lines: string[] = [];

  COIN_FIELDS.forEach(({ field, coin }) => {
    if (before[field] !== after[field]) {
      const next = after[field].trim();
      lines.push(
        `• ${coin} deposit address: ${mask(before[field])} → ${
          next ? mask(next) : "OFF (this coin is disabled for users)"
        }`,
      );
    }
  });

  if (!before.maintenanceMode && after.maintenanceMode) {
    lines.push("• Maintenance mode ON: new investments will be blocked.");
  }
  if (before.allowInvestments && !after.allowInvestments) {
    lines.push("• Investing will be paused for everyone.");
  }
  if (before.allowWithdrawals && !after.allowWithdrawals) {
    lines.push("• New withdrawal requests will be refused.");
  }
  if (before.allowRegistrations && !after.allowRegistrations) {
    lines.push("• New sign-ups will be closed.");
  }

  return lines;
}

export default function AdminSettingsPage() {
  const { settings, meta, isPending, isError, save, isSaving } =
    useAdminSettings();
  const [draft, setDraft] = useState<AdminSettings | null>(null);

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#080c11] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto h-64 max-w-275 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="min-h-screen bg-[#080c11] p-4 text-white sm:p-6 lg:p-8">
        <div className="mx-auto max-w-275 rounded-2xl border border-white/6 bg-[#0b1016] p-6 text-sm text-red-400">
          Couldn't load settings. Make sure you're signed in as an admin, then
          refresh.
        </div>
      </div>
    );
  }

  const form = draft ?? settings;

  const changes: Partial<AdminSettings> = {};
  (Object.keys(form) as (keyof AdminSettings)[]).forEach((field) => {
    if (form[field] !== settings[field]) {
      (changes as Record<string, unknown>)[field] = form[field];
    }
  });
  const dirty = Object.keys(changes).length > 0;

  const patch = (next: Partial<AdminSettings>) =>
    setDraft({ ...form, ...next });

  const saveSettings = async () => {
    if (!dirty || isSaving) return;

    const risky = riskyChanges(settings, form);
    if (
      risky.length > 0 &&
      !window.confirm(
        `Please confirm these changes:\n\n${risky.join("\n")}\n\nContinue?`,
      )
    ) {
      return;
    }

    try {
      const count = await save(changes);
      setDraft(null);
      toast.success(count > 0 ? "Settings saved" : "No changes to save");
    } catch (error) {
      toast.error(getSettingsErrorMessage(error));
    }
  };

  const discardChanges = () => {
    setDraft(null);
    toast.success("Changes discarded");
  };

  return (
    <div className="min-h-screen bg-[#080c11] text-white">
      <div className="mx-auto max-w-275 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#f0b90b]">
              Admin
            </p>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Manage platform configuration.{" "}
              {dirty && (
                <span className="text-amber-400">
                  You have unsaved changes.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={discardChanges}
              disabled={!dirty || isSaving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/6 bg-white/2 px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:text-white disabled:opacity-40"
            >
              <RotateCcw size={15} />
              Discard changes
            </button>

            <button
              onClick={saveSettings}
              disabled={!dirty || isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-[#f0b90b]/90 disabled:opacity-40"
            >
              <Save size={15} />
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Maintenance warning: shows the real, saved state */}
        {settings.maintenanceMode && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/6 p-4">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <p className="text-sm font-medium text-amber-300">
                Maintenance mode is on
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-400/70">
                Users can't start new investments. Deposits, withdrawals,
                payouts and sign-in keep working.
              </p>
            </div>
          </div>
        )}

        {/* General */}
        <Section
          icon={Settings}
          title="General"
          description="Shown to users on the Help page."
        >
          <div className="grid gap-5 py-5 sm:grid-cols-2">
            <Input
              label="Platform Name"
              value={form.platformName}
              onChange={(value) => patch({ platformName: value })}
            />

            <Input
              label="Support Email"
              type="email"
              value={form.supportEmail}
              onChange={(value) => patch({ supportEmail: value })}
              placeholder="support@yourdomain.com"
              hint="Leave empty to hide it."
            />

            <Input
              label="Support Phone"
              value={form.supportPhone}
              onChange={(value) => patch({ supportPhone: value })}
            />
          </div>
        </Section>

        {/* Deposit addresses */}
        <Section
          icon={QrCode}
          title="Deposit addresses"
          description="Where users send crypto. Empty means that coin is off."
        >
          <div className="space-y-5 py-5">
            {COIN_FIELDS.map(({ field, coin, label, placeholder }) => {
              const live = !!settings[field].trim();

              return (
                <Input
                  key={field}
                  label={label}
                  mono
                  value={form[field]}
                  placeholder={placeholder}
                  onChange={(value) => patch({ [field]: value })}
                  badge={
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        live
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {live ? `${coin} on for users` : `${coin} off`}
                    </span>
                  }
                />
              );
            })}

            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-amber-200/80">
              Check the address character by character before saving. Funds sent
              to a wrong address can't be recovered. Deposits users already
              submitted keep the address they were shown, so keep watching the
              old address until they're confirmed.
            </div>
          </div>
        </Section>

        {/* Wallet */}
        <Section
          icon={Wallet}
          title="Wallet"
          description="Control withdrawals."
        >
          <div className="py-1">
            <SettingRow
              title="Allow Withdrawals"
              description="When off, new withdrawal requests are refused. Requests already submitted can still be approved and completed."
            >
              <Toggle
                label="Allow withdrawals"
                enabled={form.allowWithdrawals}
                onChange={() =>
                  patch({ allowWithdrawals: !form.allowWithdrawals })
                }
              />
            </SettingRow>
          </div>
        </Section>

        {/* Investments */}
        <Section
          icon={TrendingUp}
          title="Investments"
          description="Control new investments. Each plan sets its own limits."
        >
          <div className="py-1">
            <SettingRow
              title="Allow Investments"
              description="When off, nobody can start a new investment. Existing investments keep running and still pay out."
            >
              <Toggle
                label="Allow investments"
                enabled={form.allowInvestments}
                onChange={() =>
                  patch({ allowInvestments: !form.allowInvestments })
                }
              />
            </SettingRow>
          </div>
        </Section>

        {/* Platform Controls */}
        <Section
          icon={Lock}
          title="Platform Controls"
          description="Control access to major platform features."
        >
          <div className="py-1">
            <SettingRow
              title="Allow New Registrations"
              description="When off, the sign-up page shows 'closed' and the database refuses new accounts, including ones created from the Supabase dashboard."
            >
              <Toggle
                label="Allow new registrations"
                enabled={form.allowRegistrations}
                onChange={() =>
                  patch({ allowRegistrations: !form.allowRegistrations })
                }
              />
            </SettingRow>

            <SettingRow
              title="Maintenance Mode"
              description="Pauses new investments. Deposits, withdrawals, payouts and sign-in keep working."
            >
              <Toggle
                label="Maintenance mode"
                enabled={form.maintenanceMode}
                onChange={() =>
                  patch({ maintenanceMode: !form.maintenanceMode })
                }
              />
            </SettingRow>
          </div>
        </Section>

        {/* Save footer */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/6 bg-[#0b1016] p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Check size={17} />
            </div>

            <div>
              <p className="text-xs font-medium text-white">
                Saved in the database
              </p>
              <p className="text-[11px] text-zinc-600">
                {meta?.updatedAt
                  ? `Last changed by ${meta.updatedBy ?? "an admin"} on ${formatDateTime(meta.updatedAt)}`
                  : "No changes have been made from this page yet."}
              </p>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={!dirty || isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-5 py-3 text-xs font-semibold text-black disabled:opacity-40 sm:w-auto"
          >
            <Save size={15} />
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import {
//   Settings,
//   Wallet,
//   TrendingUp,
//   ShieldCheck,
//   Bell,
//   Save,
//   RotateCcw,
//   Lock,
//   Mail,
//   AlertTriangle,
//   Check,
// } from "lucide-react";
// import { toast } from "sonner";

// type ToggleProps = {
//   enabled: boolean;
//   onChange: () => void;
// };

// function Toggle({ enabled, onChange }: ToggleProps) {
//   return (
//     <button
//       type="button"
//       onClick={onChange}
//       className={`relative h-6 w-11 rounded-full transition ${
//         enabled ? "bg-[#f0b90b]" : "bg-zinc-700"
//       }`}
//     >
//       <span
//         className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
//           enabled ? "left-6" : "left-1"
//         }`}
//       />
//     </button>
//   );
// }

// function SettingRow({
//   title,
//   description,
//   children,
// }: {
//   title: string;
//   description: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex flex-col gap-4 border-b border-white/5 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
//       <div className="max-w-xl">
//         <p className="text-sm font-medium text-white">{title}</p>
//         <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
//       </div>

//       <div className="shrink-0">{children}</div>
//     </div>
//   );
// }

// function Section({
//   icon: Icon,
//   title,
//   description,
//   children,
// }: {
//   icon: React.ElementType;
//   title: string;
//   description: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="rounded-2xl border border-white/6 bg-[#0b1016]">
//       <div className="flex items-start gap-4 border-b border-white/6 p-5">
//         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
//           <Icon size={19} />
//         </div>

//         <div>
//           <h2 className="text-sm font-semibold text-white">{title}</h2>
//           <p className="mt-1 text-xs text-zinc-600">{description}</p>
//         </div>
//       </div>

//       <div className="px-5">{children}</div>
//     </section>
//   );
// }

// function Input({
//   label,
//   value,
//   onChange,
//   type = "text",
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   type?: string;
// }) {
//   return (
//     <div>
//       <label className="mb-2 block text-xs text-zinc-500">{label}</label>

//       <input
//         type={type}
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#f0b90b]/40"
//       />
//     </div>
//   );
// }

// export default function AdminSettingsPage() {
//   const [platformName, setPlatformName] = useState("BNB");
//   const [supportEmail, setSupportEmail] = useState("support@bnb.com");
//   const [supportPhone, setSupportPhone] = useState("+234 800 000 0000");

//   const [minInvestment, setMinInvestment] = useState("100");
//   const [maxInvestment, setMaxInvestment] = useState("1000000");

//   const [withdrawalFee, setWithdrawalFee] = useState("1.5");

//   const [maintenanceMode, setMaintenanceMode] = useState(false);
//   const [allowRegistrations, setAllowRegistrations] = useState(true);
//   const [allowInvestments, setAllowInvestments] = useState(true);
//   const [allowWithdrawals, setAllowWithdrawals] = useState(true);

//   const [emailNotifications, setEmailNotifications] = useState(true);
//   const [securityAlerts, setSecurityAlerts] = useState(true);
//   const [adminNotifications, setAdminNotifications] = useState(true);

//   const [twoFactorRequired, setTwoFactorRequired] = useState(false);

//   const saveSettings = () => {
//     toast.success("Settings saved successfully");
//   };

//   const resetSettings = () => {
//     setPlatformName("BNB");
//     setSupportEmail("support@bnb.com");
//     setSupportPhone("+234 800 000 0000");

//     setMinInvestment("100");
//     setMaxInvestment("1000000");
//     setWithdrawalFee("1.5");

//     setMaintenanceMode(false);
//     setAllowRegistrations(true);
//     setAllowInvestments(true);
//     setAllowWithdrawals(true);

//     setEmailNotifications(true);
//     setSecurityAlerts(true);
//     setAdminNotifications(true);

//     setTwoFactorRequired(false);

//     toast.success("Settings reset");
//   };

//   return (
//     <div className="min-h-screen bg-[#080c11] text-white">
//       <div className="mx-auto max-w-275 space-y-6 p-4 sm:p-6 lg:p-8">
//         {/* Header */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#f0b90b]">
//               Admin
//             </p>

//             <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//               Settings
//             </h1>

//             <p className="mt-1 text-sm text-zinc-500">
//               Manage platform configuration and administrative preferences.
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={resetSettings}
//               className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:text-white"
//             >
//               <RotateCcw size={15} />
//               Reset
//             </button>

//             <button
//               onClick={saveSettings}
//               className="inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-[#f0b90b]/90"
//             >
//               <Save size={15} />
//               Save Changes
//             </button>
//           </div>
//         </div>

//         {/* Maintenance warning */}
//         {maintenanceMode && (
//           <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
//             <AlertTriangle
//               size={18}
//               className="mt-0.5 shrink-0 text-amber-400"
//             />

//             <div>
//               <p className="text-sm font-medium text-amber-300">
//                 Maintenance mode is enabled
//               </p>

//               <p className="mt-1 text-xs leading-5 text-amber-400/70">
//                 Users may be unable to access parts of the platform while
//                 maintenance mode is active.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* General */}
//         <Section
//           icon={Settings}
//           title="General"
//           description="Basic information about your platform."
//         >
//           <div className="grid gap-5 py-5 sm:grid-cols-2">
//             <Input
//               label="Platform Name"
//               value={platformName}
//               onChange={setPlatformName}
//             />

//             <Input
//               label="Support Email"
//               value={supportEmail}
//               onChange={setSupportEmail}
//               type="email"
//             />

//             <Input
//               label="Support Phone"
//               value={supportPhone}
//               onChange={setSupportPhone}
//             />
//           </div>
//         </Section>

//         {/* Wallet */}
//         <Section
//           icon={Wallet}
//           title="Wallet"
//           description="Configure virtual wallet and withdrawal settings."
//         >
//           <div className="py-1">
//             <SettingRow
//               title="Allow Withdrawals"
//               description="Allow users to initiate simulated withdrawal requests."
//             >
//               <Toggle
//                 enabled={allowWithdrawals}
//                 onChange={() => setAllowWithdrawals(!allowWithdrawals)}
//               />
//             </SettingRow>

//             <SettingRow
//               title="Withdrawal Fee"
//               description="Default percentage fee applied to withdrawal calculations."
//             >
//               <div className="relative w-32">
//                 <input
//                   type="number"
//                   value={withdrawalFee}
//                   onChange={(event) => setWithdrawalFee(event.target.value)}
//                   className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 pr-8 text-right text-sm text-white outline-none focus:border-[#f0b90b]/40"
//                 />

//                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
//                   %
//                 </span>
//               </div>
//             </SettingRow>
//           </div>
//         </Section>

//         {/* Investments */}
//         <Section
//           icon={TrendingUp}
//           title="Investments"
//           description="Configure investment limits and platform availability."
//         >
//           <div className="py-5">
//             <div className="grid gap-5 sm:grid-cols-2">
//               <Input
//                 label="Minimum Investment"
//                 value={minInvestment}
//                 onChange={setMinInvestment}
//                 type="number"
//               />

//               <Input
//                 label="Maximum Investment"
//                 value={maxInvestment}
//                 onChange={setMaxInvestment}
//                 type="number"
//               />
//             </div>

//             <div className="mt-1">
//               <SettingRow
//                 title="Allow Investments"
//                 description="Allow users to create new simulated investments."
//               >
//                 <Toggle
//                   enabled={allowInvestments}
//                   onChange={() => setAllowInvestments(!allowInvestments)}
//                 />
//               </SettingRow>
//             </div>
//           </div>
//         </Section>

//         {/* Security */}
//         <Section
//           icon={ShieldCheck}
//           title="Security"
//           description="Manage account and administrative security settings."
//         >
//           <div className="py-1">
//             <SettingRow
//               title="Require Two-Factor Authentication"
//               description="Require administrators to use an additional authentication step."
//             >
//               <Toggle
//                 enabled={twoFactorRequired}
//                 onChange={() => setTwoFactorRequired(!twoFactorRequired)}
//               />
//             </SettingRow>

//             <SettingRow
//               title="Security Alerts"
//               description="Receive notifications when important security events occur."
//             >
//               <Toggle
//                 enabled={securityAlerts}
//                 onChange={() => setSecurityAlerts(!securityAlerts)}
//               />
//             </SettingRow>
//           </div>
//         </Section>

//         {/* Notifications */}
//         <Section
//           icon={Bell}
//           title="Notifications"
//           description="Control notifications sent to administrators."
//         >
//           <div className="py-1">
//             <SettingRow
//               title="Email Notifications"
//               description="Receive important platform updates by email."
//             >
//               <Toggle
//                 enabled={emailNotifications}
//                 onChange={() => setEmailNotifications(!emailNotifications)}
//               />
//             </SettingRow>

//             <SettingRow
//               title="Admin Notifications"
//               description="Receive notifications about important user and transaction activity."
//             >
//               <Toggle
//                 enabled={adminNotifications}
//                 onChange={() => setAdminNotifications(!adminNotifications)}
//               />
//             </SettingRow>
//           </div>
//         </Section>

//         {/* Platform Controls */}
//         <Section
//           icon={Lock}
//           title="Platform Controls"
//           description="Control access to major platform features."
//         >
//           <div className="py-1">
//             <SettingRow
//               title="Allow New Registrations"
//               description="Allow new users to create accounts."
//             >
//               <Toggle
//                 enabled={allowRegistrations}
//                 onChange={() => setAllowRegistrations(!allowRegistrations)}
//               />
//             </SettingRow>

//             <SettingRow
//               title="Maintenance Mode"
//               description="Temporarily place the platform into maintenance mode."
//             >
//               <Toggle
//                 enabled={maintenanceMode}
//                 onChange={() => setMaintenanceMode(!maintenanceMode)}
//               />
//             </SettingRow>
//           </div>
//         </Section>

//         {/* Save footer */}
//         <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0b1016] p-5 sm:flex-row">
//           <div className="flex items-center gap-3">
//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
//               <Check size={17} />
//             </div>

//             <div>
//               <p className="text-xs font-medium text-white">
//                 Configuration ready
//               </p>

//               <p className="text-[11px] text-zinc-600">
//                 Changes are currently stored locally.
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={saveSettings}
//             className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-5 py-3 text-xs font-semibold text-black sm:w-auto"
//           >
//             <Save size={15} />
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
