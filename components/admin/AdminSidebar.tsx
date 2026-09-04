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
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  ShieldCheck,
} from "lucide-react";

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

const overviewNavigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
];

const userNavigation = [
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

const financeNavigation = [
  {
    label: "Wallets",
    href: "/admin/wallets",
    icon: Wallet,
  },
  {
    label: "Deposits",
    href: "/admin/deposits",
    icon: ArrowDownToLine,
  },
  {
    label: "Withdrawals",
    href: "/admin/withdrawals",
    icon: ArrowUpFromLine,
  },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: Activity,
  },
];

const investmentNavigation = [
  {
    label: "Investments",
    href: "/admin/investments",
    icon: BriefcaseBusiness,
  },
  {
    label: "Investment Plans",
    href: "/admin/investment-plans",
    icon: BarChart3,
  },
];

const managementNavigation = [
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: FileText,
  },
];

export default function AdminSidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();

  const navigation = (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Logo */}
      <div className="mb-8 shrink-0">
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b] font-black text-black">
            B
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight text-white">BNB</p>

            <div className="flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-[#f0b90b]" />

              <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                Admin Panel
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
        <NavSection
          title="Overview"
          items={overviewNavigation}
          pathname={pathname}
          onClose={onClose}
        />

        <NavSection
          title="Users"
          items={userNavigation}
          pathname={pathname}
          onClose={onClose}
        />

        <NavSection
          title="Finance"
          items={financeNavigation}
          pathname={pathname}
          onClose={onClose}
        />

        <NavSection
          title="Investments"
          items={investmentNavigation}
          pathname={pathname}
          onClose={onClose}
        />

        <NavSection
          title="Management"
          items={managementNavigation}
          pathname={pathname}
          onClose={onClose}
        />

        {/* System */}
        <div className="mt-8">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            System
          </p>

          <Link
            href="/admin/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              pathname.startsWith("/admin/settings")
                ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                : "text-zinc-500 hover:bg-white/[0.035] hover:text-white"
            }`}
          >
            <Settings size={18} />

            <span>Settings</span>
          </Link>

          <Link
            href="/help"
            onClick={onClose}
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-500 transition hover:bg-white/[0.035] hover:text-white"
          >
            <CircleHelp size={18} />

            <span>Help & Support</span>
          </Link>
        </div>
      </div>

      {/* Admin account */}
      <div className="mt-4 shrink-0 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0b90b] text-sm font-bold text-black">
            A
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Administrator
            </p>

            <p className="truncate text-xs text-zinc-500">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close admin menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-col border-r border-white/[0.06] bg-[#0b1016] px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-5 rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>

        {navigation}
      </aside>
    </>
  );
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

function NavSection({
  title,
  items,
  pathname,
  onClose,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="mb-7">
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm transition ${
                isActive
                  ? "bg-[#f0b90b]/10 text-[#f0b90b]"
                  : "text-zinc-500 hover:bg-white/[0.035] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />

                <span>{item.label}</span>
              </div>

              {isActive && (
                <ChevronRight size={14} className="text-[#f0b90b]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
