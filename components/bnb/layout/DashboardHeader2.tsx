"use client";

import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import NotificationPanel from "../dashboard/NotificationPanel2";

import { supabase } from "@/libs/supabase/browser";
import { useNotifications } from "@/hooks/useNotificatiton";

type Props = {
  onMenu: () => void;
};

export default function DashboardHeader({ onMenu }: Props) {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { hasNewNotifications, markNotificationsAsSeen } = useNotifications();

  /**
   * Close profile menu when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Open notifications.
   */
  const handleNotificationClick = () => {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);

    if (nextState) {
      markNotificationsAsSeen();
    }
  };

  /**
   * Logout
   */
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      toast.success("You have been logged out.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again.",
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080c11]/90 backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <button
          type="button"
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
            placeholder="Search assets, markets..."
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            onClick={handleNotificationClick}
            aria-label="Notifications"
            className="relative rounded-xl border border-white/[0.06] p-2.5 text-zinc-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Bell size={19} />

            {/* New notification indicator */}
            {hasNewNotifications && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f0b90b] ring-2 ring-[#080c11]" />
            )}
          </button>

          {/* Notification panel */}
          <NotificationPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1.5 pr-3 transition hover:bg-white/[0.05]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0b90b] text-sm font-bold text-black">
                B
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium text-white">Berry Ice</p>
                <p className="text-[10px] text-zinc-500">Personal</p>
              </div>

              <ChevronDown
                size={14}
                className={`hidden text-zinc-500 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11161d] p-1.5 shadow-2xl shadow-black/40">
                {/* User info */}
                <div className="border-b border-white/[0.06] px-3 py-3">
                  <p className="text-sm font-medium text-white">Berry Ice</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Personal Account
                  </p>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/profile");
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <User size={17} />
                  <span>Profile</span>
                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <Settings size={17} />
                  <span>Settings</span>
                </button>
                {/* Logout */}
                <div className="my-1 border-t border-white/[0.06]" />

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/[0.07] hover:text-red-300"
                >
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
