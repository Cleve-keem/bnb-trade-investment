"use client";

import { useState } from "react";
import {
  Settings,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Bell,
  Save,
  RotateCcw,
  Lock,
  Mail,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type ToggleProps = {
  enabled: boolean;
  onChange: () => void;
};

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      type="button"
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-500">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-white/6 bg-white/2.5 px-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#f0b90b]/40"
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState("BNB");
  const [supportEmail, setSupportEmail] = useState("support@bnb.com");
  const [supportPhone, setSupportPhone] = useState("+234 800 000 0000");

  const [minInvestment, setMinInvestment] = useState("100");
  const [maxInvestment, setMaxInvestment] = useState("1000000");

  const [withdrawalFee, setWithdrawalFee] = useState("1.5");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [allowInvestments, setAllowInvestments] = useState(true);
  const [allowWithdrawals, setAllowWithdrawals] = useState(true);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [adminNotifications, setAdminNotifications] = useState(true);

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  const saveSettings = () => {
    toast.success("Settings saved successfully");
  };

  const resetSettings = () => {
    setPlatformName("BNB");
    setSupportEmail("support@bnb.com");
    setSupportPhone("+234 800 000 0000");

    setMinInvestment("100");
    setMaxInvestment("1000000");
    setWithdrawalFee("1.5");

    setMaintenanceMode(false);
    setAllowRegistrations(true);
    setAllowInvestments(true);
    setAllowWithdrawals(true);

    setEmailNotifications(true);
    setSecurityAlerts(true);
    setAdminNotifications(true);

    setTwoFactorRequired(false);

    toast.success("Settings reset");
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
              Manage platform configuration and administrative preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetSettings}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-[#f0b90b]/90"
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Maintenance warning */}
        {maintenanceMode && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0 text-amber-400"
            />

            <div>
              <p className="text-sm font-medium text-amber-300">
                Maintenance mode is enabled
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-400/70">
                Users may be unable to access parts of the platform while
                maintenance mode is active.
              </p>
            </div>
          </div>
        )}

        {/* General */}
        <Section
          icon={Settings}
          title="General"
          description="Basic information about your platform."
        >
          <div className="grid gap-5 py-5 sm:grid-cols-2">
            <Input
              label="Platform Name"
              value={platformName}
              onChange={setPlatformName}
            />

            <Input
              label="Support Email"
              value={supportEmail}
              onChange={setSupportEmail}
              type="email"
            />

            <Input
              label="Support Phone"
              value={supportPhone}
              onChange={setSupportPhone}
            />
          </div>
        </Section>

        {/* Wallet */}
        <Section
          icon={Wallet}
          title="Wallet"
          description="Configure virtual wallet and withdrawal settings."
        >
          <div className="py-1">
            <SettingRow
              title="Allow Withdrawals"
              description="Allow users to initiate simulated withdrawal requests."
            >
              <Toggle
                enabled={allowWithdrawals}
                onChange={() => setAllowWithdrawals(!allowWithdrawals)}
              />
            </SettingRow>

            <SettingRow
              title="Withdrawal Fee"
              description="Default percentage fee applied to withdrawal calculations."
            >
              <div className="relative w-32">
                <input
                  type="number"
                  value={withdrawalFee}
                  onChange={(event) => setWithdrawalFee(event.target.value)}
                  className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 pr-8 text-right text-sm text-white outline-none focus:border-[#f0b90b]/40"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                  %
                </span>
              </div>
            </SettingRow>
          </div>
        </Section>

        {/* Investments */}
        <Section
          icon={TrendingUp}
          title="Investments"
          description="Configure investment limits and platform availability."
        >
          <div className="py-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Minimum Investment"
                value={minInvestment}
                onChange={setMinInvestment}
                type="number"
              />

              <Input
                label="Maximum Investment"
                value={maxInvestment}
                onChange={setMaxInvestment}
                type="number"
              />
            </div>

            <div className="mt-1">
              <SettingRow
                title="Allow Investments"
                description="Allow users to create new simulated investments."
              >
                <Toggle
                  enabled={allowInvestments}
                  onChange={() => setAllowInvestments(!allowInvestments)}
                />
              </SettingRow>
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section
          icon={ShieldCheck}
          title="Security"
          description="Manage account and administrative security settings."
        >
          <div className="py-1">
            <SettingRow
              title="Require Two-Factor Authentication"
              description="Require administrators to use an additional authentication step."
            >
              <Toggle
                enabled={twoFactorRequired}
                onChange={() => setTwoFactorRequired(!twoFactorRequired)}
              />
            </SettingRow>

            <SettingRow
              title="Security Alerts"
              description="Receive notifications when important security events occur."
            >
              <Toggle
                enabled={securityAlerts}
                onChange={() => setSecurityAlerts(!securityAlerts)}
              />
            </SettingRow>
          </div>
        </Section>

        {/* Notifications */}
        <Section
          icon={Bell}
          title="Notifications"
          description="Control notifications sent to administrators."
        >
          <div className="py-1">
            <SettingRow
              title="Email Notifications"
              description="Receive important platform updates by email."
            >
              <Toggle
                enabled={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
            </SettingRow>

            <SettingRow
              title="Admin Notifications"
              description="Receive notifications about important user and transaction activity."
            >
              <Toggle
                enabled={adminNotifications}
                onChange={() => setAdminNotifications(!adminNotifications)}
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
              description="Allow new users to create accounts."
            >
              <Toggle
                enabled={allowRegistrations}
                onChange={() => setAllowRegistrations(!allowRegistrations)}
              />
            </SettingRow>

            <SettingRow
              title="Maintenance Mode"
              description="Temporarily place the platform into maintenance mode."
            >
              <Toggle
                enabled={maintenanceMode}
                onChange={() => setMaintenanceMode(!maintenanceMode)}
              />
            </SettingRow>
          </div>
        </Section>

        {/* Save footer */}
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-[#0b1016] p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <Check size={17} />
            </div>

            <div>
              <p className="text-xs font-medium text-white">
                Configuration ready
              </p>

              <p className="text-[11px] text-zinc-600">
                Changes are currently stored locally.
              </p>
            </div>
          </div>

          <button
            onClick={saveSettings}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-5 py-3 text-xs font-semibold text-black sm:w-auto"
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
