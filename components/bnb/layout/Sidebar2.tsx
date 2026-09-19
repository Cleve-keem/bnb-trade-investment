"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  // LogOut,
  Settings,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useUser } from "@/hooks/user";
import ProfileSkeleton from "../dashboard/ProfileSkeleton";

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

const mainNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Markets",
    href: "/markets",
    icon: BarChart3,
  },
  // {
  //   label: "Trade",
  //   href: "/trade",
  //   icon: Activity,
  // },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: BriefcaseBusiness,
  },
];

const investNavigation = [
  {
    label: "Investments",
    href: "/investments",
    icon: Wallet,
  },
  // {
  //   label: "AI Signals",
  //   href: "/ai-signals",
  //   icon: TrendingUp,
  // },
];

const activityNavigation = [
  {
    label: "Transactions",
    href: "/transactions",
    icon: Activity,
  },
];

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();
  const { data: user, isPending } = useUser();

  const userAvatar = user?.fullname?.trim()?.charAt(0).toUpperCase() ?? "U";

  const navigation = (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Logo */}
      <div className="mb-8 shrink-0">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b] font-black text-black">
            B
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight">BNB</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Trading
            </p>
          </div>
        </Link>
      </div>

      {/* Scrollable Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        <NavSection title="Overview" items={mainNavigation} onClose={onClose} />
        <NavSection title="Invest" items={investNavigation} onClose={onClose} />
        <NavSection
          title="Activity"
          items={activityNavigation}
          onClose={onClose}
        />

        {/* Account */}
        <div className="mt-8 pb-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Account
          </p>
          {/* Profile */}
          <Link
            href="/profile"
            onClick={onClose}
            className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              pathname === "/profile"
                ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                : "text-zinc-400 hover:bg-white/4 hover:text-white"
            }`}
          >
            <User size={18} />
            Profile
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            onClick={onClose}
            className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              pathname === "/settings"
                ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                : "text-zinc-400 hover:bg-white/4 hover:text-white"
            }`}
          >
            <Settings size={18} />
            Settings
          </Link>

          {/* Help & Support */}
          <Link
            href="/help"
            onClick={onClose}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              pathname === "/help"
                ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                : "text-zinc-400 hover:bg-white/4 hover:text-white"
            }`}
          >
            <CircleHelp size={18} />
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-65 flex-col border-r border-white/6 bg-[#0b1016] px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="absolute right-4 top-5 rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>

        {navigation}
        {/* Bottom Account Card */}
        {isPending ? (
          <ProfileSkeleton />
        ) : (
          <div className="mt-4 shrink-0">
            <div className="rounded-2xl border border-white/6 bg-white/2.5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold">
                  {userAvatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user?.fullname}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    Tier 1 account
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function NavSection({
  title,
  items,
  onClose,
}: {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
  }[];
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="mb-7">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
        {title}
      </p>

      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`group mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              active
                ? "bg-[#f0b90b]/10 font-medium text-[#f0b90b]"
                : "text-zinc-400 hover:bg-white/4 hover:text-white"
            }`}
          >
            <Icon size={18} />

            <span>{item.label}</span>

            {active && (
              <ChevronRight size={14} className="ml-auto opacity-70" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
