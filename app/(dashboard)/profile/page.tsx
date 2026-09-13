"use client";

import { useState } from "react";
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

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);

  function saveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
                B
              </div>

              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Berry Ice</h2>
                  <CheckCircle2 size={17} className="text-emerald-400" />
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  Verified BNB account
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
                value="Berry Ice"
              />

              <Field label="Username" icon={<User size={16} />} value="Eve" />

              <Field
                label="Email"
                icon={<Mail size={16} />}
                value="berryIce@gmail.com"
              />

              <Field
                label="Phone"
                icon={<Phone size={16} />}
                value="+1 (810) 746-5628"
              />
            </div>

            <button
              onClick={saveProfile}
              className="mt-7 flex h-11 items-center gap-2 rounded-xl bg-[#f0b90b] px-5 text-sm font-semibold text-black"
            >
              {saved && <CheckCircle2 size={16} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/6 bg-[#0d131a] p-6">
            <h2 className="font-medium">Security</h2>

            <div className="mt-5 space-y-3">
              <SecurityItem
                icon={<ShieldCheck size={17} />}
                title="Account verification"
                status="Verified"
              />

              <SecurityItem
                icon={<Lock size={17} />}
                title="Password"
                status="Protected"
              />

              {/* <SecurityItem
                icon={<ShieldCheck size={17} />}
                title="Two-factor authentication"
                status="Enabled"
              /> */}
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
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-zinc-500">{label}</label>

      <div className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/2 px-3">
        <span className="text-zinc-600">{icon}</span>

        <input
          defaultValue={value}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function SecurityItem({
  icon,
  title,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/2 p-3">
      <div className="flex items-center gap-3">
        <span className="text-[#f0b90b]">{icon}</span>

        <div>
          <p className="text-xs font-medium">{title}</p>
          <p className="mt-1 text-[10px] text-emerald-400">{status}</p>
        </div>
      </div>
    </div>
  );
}
