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
import NotificationPanel from "../dashboard/NotificationPanel2";
import { useUser } from "@/hooks/user";
import ProfileSkeleton from "../dashboard/ProfileSkeleton";
import { useLogoutMutation } from "@/hooks/auth";
import useNotifications from "@/hooks/useNotificatiton";
import Image from "next/image";

type Props = {
  onMenu: () => void;
};

export default function DashboardHeader({ onMenu }: Props) {
  const { hasNewNotifications } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: user, isPending } = useUser();
  const { logout } = useLogoutMutation();
  const router = useRouter();

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

  const handleNotificationClick = () => {
    setNotificationsOpen((current) => !current);
  };
  
  return (
    <header className="sticky top-0 z-30 border-b border-white/6 bg-[#080c11]/90 backdrop-blur-xl">
      <div className="flex h-18 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenu}
          className="rounded-xl border border-white/[0.07] p-2 text-zinc-400 transition hover:text-white lg:hidden"
        >
          <Menu size={20} />
        </button>
        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            onClick={handleNotificationClick}
            aria-label="Notifications"
            className="relative rounded-xl border border-white/6 p-2.5 text-zinc-400 transition hover:bg-white/4 hover:text-white"
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
          {isPending ? (
            <ProfileSkeleton />
          ) : (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/2 p-1.5 transition hover:bg-white/5"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl font-black text-black">
                  <Image
                    src="/logo2.png"
                    alt="BNB Logo"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 34px, 34px"
                  />
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-medium text-white">
                    {user?.fullname ?? "User"}
                  </p>
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
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 overflow-hidden rounded-2xl border border-white/8 bg-[#11161d] p-1.5 shadow-2xl shadow-black/40">
                  {/* User info */}
                  <div className="border-b border-white/6 px-3 py-3">
                    <p className="text-sm font-medium text-white">
                      {user?.fullname}
                    </p>
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
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
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
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <Settings size={17} />
                    <span>Settings</span>
                  </button>
                  {/* Logout */}
                  <div className="my-1 border-t border-white/6" />
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/7 hover:text-red-300"
                  >
                    <LogOut size={17} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
