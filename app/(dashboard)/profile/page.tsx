"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import DashboardShell from "@/components/bnb/layout/DashBoardShell";
import LogoutButton from "@/components/bnb/profile/LogoutButton";
import { useUserProfile } from "@/hooks/user";
import { toast } from "sonner";

export default function ProfilePage() {
  const { profile, isPending, isError, updateProfile, isSaving, saveError } =
    useUserProfile();
  const [form, setForm] = useState({ fullName: "", username: "", phone: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullname ?? "",
        username: profile.username ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  async function handleSave() {
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const initial = profile?.fullname?.trim()?.charAt(0).toUpperCase() ?? "U";

  if (isPending) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-5xl">
          <div className="h-48 animate-pulse rounded-3xl bg-white/5" />
        </div>
      </DashboardShell>
    );
  }

  if (isError || !profile) {
    return (
      <DashboardShell>
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/6 bg-[#0d131a] p-6 text-sm text-red-400">
          Couldn't load your profile. Try refreshing the page.
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Profile</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Manage your personal information and account security.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/6 bg-[#0d131a]">
          <div className="h-32 bg-linear-to-r from-[#f0b90b]/20 via-transparent to-transparent" />

          <div className="-mt-12 px-6 pb-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#0d131a] bg-[#f0b90b] text-3xl font-bold text-black">
                {initial}
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{profile.fullname}</h2>
                  {profile.email_verified_at && (
                    <CheckCircle2 size={17} className="text-emerald-400" />
                  )}
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {profile.email_verified_at
                    ? "Verified BNB account"
                    : "Unverified account"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-6">
            <h2 className="font-medium">Personal Information</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full Name"
                icon={<User size={16} />}
                value={form.fullName}
                onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}
              />

              <Field
                label="Username"
                icon={<User size={16} />}
                value={form.username}
                onChange={(v) => setForm((f) => ({ ...f, username: v }))}
              />

              <Field
                label="Email"
                icon={<Mail size={16} />}
                value={profile.email}
                readOnly
              />

              <Field
                label="Phone"
                icon={<Phone size={16} />}
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              />
            </div>

            {saveError && (
              <p className="mt-4 text-sm text-red-400">
                {saveError instanceof Error
                  ? saveError.message
                  : "Couldn't save changes."}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-7 flex h-11 items-center gap-2 rounded-xl bg-[#f0b90b] px-5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saved && <CheckCircle2 size={16} />}
              {isSaving ? "Saving…" : saved ? "Saved" : "Save Changes"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-6">
            <h2 className="font-medium">Security</h2>

            <div className="mt-5 space-y-3">
              <SecurityItem
                icon={<ShieldCheck size={17} />}
                title="Account verification"
                status={profile.email_verified_at ? "Verified" : "Unverified"}
                positive={!!profile.email_verified_at}
              />

              <SecurityItem
                icon={<Lock size={17} />}
                title="Password"
                status="Protected"
                positive
              />

              {/* Two-factor authentication: not implemented yet */}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-500">{label}</label>
      <div
        className={`flex h-11 items-center gap-3 rounded-xl border border-white/[0.07] px-3 ${
          readOnly ? "bg-white/1.5" : "bg-white/2"
        }`}
      >
        <span className="text-zinc-600">{icon}</span>
        <input
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-transparent text-sm outline-none ${
            readOnly ? "text-zinc-500" : ""
          }`}
        />
      </div>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  status,
  positive,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/2 p-3">
      <div className="flex items-center gap-3">
        <span className="text-[#f0b90b]">{icon}</span>
        <div>
          <p className="text-xs font-medium">{title}</p>
          <p
            className={`mt-1 text-[10px] ${positive ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
