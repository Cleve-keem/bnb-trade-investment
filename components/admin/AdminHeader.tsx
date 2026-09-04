"use client";

import { Bell, Menu, Search, ChevronDown, ShieldCheck } from "lucide-react";

import { useState } from "react";

type Props = {
  onMenu: () => void;
};

export default function AdminHeader({ onMenu }: Props) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080c11]/90 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <button
          onClick={onMenu}
          className="rounded-xl border border-white/[0.07] p-2 text-zinc-400 transition hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative hidden w-full max-w-md sm:block">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
          />

          <input
            placeholder="Search users, transactions..."
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <button className="relative rounded-xl border border-white/[0.06] p-2.5 text-zinc-400 transition hover:text-white">
            <Bell size={19} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f0b90b]" />
          </button>

          {/* Admin profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((current) => !current)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5 pr-3 transition hover:bg-white/[0.04]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0b90b] text-sm font-bold text-black">
                A
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-white">Administrator</p>

                <div className="flex items-center gap-1">
                  <ShieldCheck size={10} className="text-[#f0b90b]" />

                  <p className="text-[10px] text-zinc-500">Super Admin</p>
                </div>
              </div>

              <ChevronDown
                size={14}
                className="hidden text-zinc-500 sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11161d] p-2 shadow-2xl">
                <div className="border-b border-white/[0.06] px-3 py-3">
                  <p className="text-sm font-medium text-white">
                    Administrator
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-500">Admin account</p>
                </div>

                <button className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">
                  Profile
                </button>

                <button className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-white/[0.04] hover:text-white">
                  Settings
                </button>

                <button className="mt-1 flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
