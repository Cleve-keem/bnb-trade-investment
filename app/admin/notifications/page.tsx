"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Trash2,
  Bell,
  Send,
  Users,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { toast } from "sonner";

type NotificationType = "System" | "Security" | "Transaction" | "Promotion";

type NotificationStatus = "Sent" | "Scheduled" | "Draft";

type Audience = "All Users" | "Active Users" | "Admins";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience: Audience;
  status: NotificationStatus;
  createdAt: string;
  sentAt?: string;
  recipients: number;
};

const initialNotifications: AdminNotification[] = [
  {
    id: "NOT-10021",
    title: "Scheduled Maintenance",
    message:
      "The platform will undergo scheduled maintenance. Some features may be temporarily unavailable.",
    type: "System",
    audience: "All Users",
    status: "Sent",
    createdAt: "Sep 3, 2026 08:30 AM",
    sentAt: "Sep 3, 2026 08:35 AM",
    recipients: 1248,
  },
  {
    id: "NOT-10020",
    title: "Security Reminder",
    message:
      "Please review your account security settings and ensure your account information is up to date.",
    type: "Security",
    audience: "Active Users",
    status: "Sent",
    createdAt: "Sep 2, 2026 03:20 PM",
    sentAt: "Sep 2, 2026 03:25 PM",
    recipients: 892,
  },
  {
    id: "NOT-10019",
    title: "Withdrawal Processing Update",
    message:
      "Withdrawal processing times have been updated. Please review the latest platform information.",
    type: "Transaction",
    audience: "All Users",
    status: "Sent",
    createdAt: "Sep 2, 2026 10:15 AM",
    sentAt: "Sep 2, 2026 10:20 AM",
    recipients: 1248,
  },
  {
    id: "NOT-10018",
    title: "Platform Update",
    message:
      "A new platform update is now available with improvements and performance enhancements.",
    type: "System",
    audience: "All Users",
    status: "Sent",
    createdAt: "Sep 1, 2026 01:45 PM",
    sentAt: "Sep 1, 2026 01:50 PM",
    recipients: 1248,
  },
  {
    id: "NOT-10017",
    title: "Admin Meeting Reminder",
    message: "Reminder for the upcoming administrative review meeting.",
    type: "System",
    audience: "Admins",
    status: "Scheduled",
    createdAt: "Sep 1, 2026 09:00 AM",
    recipients: 8,
  },
  {
    id: "NOT-10016",
    title: "Welcome Message",
    message: "Welcome to BNB. Your account is ready to explore the platform.",
    type: "Promotion",
    audience: "Active Users",
    status: "Draft",
    createdAt: "Aug 31, 2026 04:30 PM",
    recipients: 892,
  },
];

function TypeBadge({ type }: { type: NotificationType }) {
  const config = {
    System: {
      icon: Info,
      className: "bg-blue-500/10 text-blue-400",
    },
    Security: {
      icon: AlertTriangle,
      className: "bg-red-500/10 text-red-400",
    },
    Transaction: {
      icon: Send,
      className: "bg-emerald-500/10 text-emerald-400",
    },
    Promotion: {
      icon: Bell,
      className: "bg-[#f0b90b]/10 text-[#f0b90b]",
    },
  };

  const Icon = config[type].icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${config[type].className}`}
    >
      <Icon size={12} />
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: NotificationStatus }) {
  const config = {
    Sent: {
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-400",
    },
    Scheduled: {
      icon: Clock3,
      className: "bg-blue-500/10 text-blue-400",
    },
    Draft: {
      icon: Clock3,
      className: "bg-zinc-500/10 text-zinc-400",
    },
  };

  const Icon = config[status].icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${config[status].className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0b90b]/10 text-[#f0b90b]">
        <Icon size={19} />
      </div>

      <p className="text-xs text-zinc-500">{label}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>

      <p className="mt-1 text-[11px] text-zinc-600">{description}</p>
    </div>
  );
}

function NotificationMenu({
  notification,
  onView,
  onDelete,
}: {
  notification: AdminNotification;
  onView: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />

          <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111820] p-1 shadow-2xl">
            <button
              onClick={() => {
                setOpen(false);
                onView();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <Eye size={15} />
              View Details
            </button>

            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>(initialNotifications);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState<"All" | NotificationType>("All");

  const [statusFilter, setStatusFilter] = useState<"All" | NotificationStatus>(
    "All",
  );

  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotification | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newType, setNewType] = useState<NotificationType>("System");
  const [newAudience, setNewAudience] = useState<Audience>("All Users");

  const filteredNotifications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return notifications.filter((notification) => {
      const matchesType =
        typeFilter === "All" || notification.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" || notification.status === statusFilter;

      const matchesSearch =
        !query ||
        notification.id.toLowerCase().includes(query) ||
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.audience.toLowerCase().includes(query);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [notifications, search, typeFilter, statusFilter]);

  const sentCount = notifications.filter(
    (notification) => notification.status === "Sent",
  ).length;

  const scheduledCount = notifications.filter(
    (notification) => notification.status === "Scheduled",
  ).length;

  const totalRecipients = notifications.reduce(
    (total, notification) => total + notification.recipients,
    0,
  );

  const deleteNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );

    toast.success("Notification deleted");
  };

  const createNotification = () => {
    if (!newTitle.trim() || !newMessage.trim()) {
      toast.error("Please enter a title and message");
      return;
    }

    const recipientCount =
      newAudience === "Admins"
        ? 8
        : newAudience === "Active Users"
          ? 892
          : 1248;

    const notification: AdminNotification = {
      id: `NOT-${10022 + notifications.length}`,
      title: newTitle.trim(),
      message: newMessage.trim(),
      type: newType,
      audience: newAudience,
      status: "Draft",
      createdAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      recipients: recipientCount,
    };

    setNotifications((current) => [notification, ...current]);

    setNewTitle("");
    setNewMessage("");
    setNewType("System");
    setNewAudience("All Users");
    setCreateOpen(false);

    toast.success("Notification created as draft");
  };

  return (
    <div className="min-h-screen bg-[#080c11] text-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#f0b90b]">
              Admin
            </p>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Create and manage platform notifications.
            </p>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f0b90b] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#f0b90b]/90"
          >
            <Plus size={17} />
            Create Notification
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Notifications"
            value={notifications.length.toString()}
            description="All notification records"
            icon={Bell}
          />

          <SummaryCard
            label="Sent"
            value={sentCount.toString()}
            description="Successfully sent"
            icon={CheckCircle2}
          />

          <SummaryCard
            label="Scheduled"
            value={scheduledCount.toString()}
            description="Waiting to be sent"
            icon={Clock3}
          />

          <SummaryCard
            label="Recipients"
            value={totalRecipients.toLocaleString()}
            description="Across notification records"
            icon={Users}
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
              />
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex gap-2 overflow-x-auto">
                {(
                  [
                    "All",
                    "System",
                    "Security",
                    "Transaction",
                    "Promotion",
                  ] as const
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium ${
                      typeFilter === type
                        ? "bg-[#f0b90b] text-black"
                        : "border border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {(["All", "Sent", "Scheduled", "Draft"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium ${
                        statusFilter === status
                          ? "bg-white/10 text-white"
                          : "border border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b1016] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Notification
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Type
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Audience
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Recipients
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Created
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredNotifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015]"
                  >
                    <td className="px-6 py-4">
                      <div className="max-w-[340px]">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-zinc-600">
                          {notification.message}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-700">
                          {notification.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <TypeBadge type={notification.type} />
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {notification.audience}
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {notification.recipients.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={notification.status} />
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {notification.createdAt}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <NotificationMenu
                        notification={notification}
                        onView={() => setSelectedNotification(notification)}
                        onDelete={() => deleteNotification(notification.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredNotifications.length === 0 && <EmptyState />}
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 lg:hidden">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">
                      {notification.title}
                    </p>

                    <StatusBadge status={notification.status} />
                  </div>

                  <p className="mt-1 text-[10px] text-zinc-700">
                    {notification.id}
                  </p>
                </div>

                <NotificationMenu
                  notification={notification}
                  onView={() => setSelectedNotification(notification)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              </div>

              <p className="mt-4 text-xs leading-5 text-zinc-500">
                {notification.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <TypeBadge type={notification.type} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Audience
                  </p>

                  <p className="mt-1 text-xs text-zinc-300">
                    {notification.audience}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Recipients
                  </p>

                  <p className="mt-1 text-xs text-zinc-300">
                    {notification.recipients.toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Created
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    {notification.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && <EmptyState />}
        </div>
      </div>

      {/* View Notification Modal */}
      {selectedNotification && (
        <Modal onClose={() => setSelectedNotification(null)}>
          <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
            <div>
              <p className="text-lg font-semibold">Notification Details</p>

              <p className="mt-1 text-xs text-zinc-600">
                {selectedNotification.id}
              </p>
            </div>

            <button
              onClick={() => setSelectedNotification(null)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={selectedNotification.type} />

                <StatusBadge status={selectedNotification.status} />
              </div>

              <h2 className="mt-4 text-lg font-semibold">
                {selectedNotification.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {selectedNotification.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Detail label="Audience" value={selectedNotification.audience} />

              <Detail
                label="Recipients"
                value={selectedNotification.recipients.toLocaleString()}
              />

              <Detail label="Created" value={selectedNotification.createdAt} />

              <Detail
                label="Sent At"
                value={selectedNotification.sentAt ?? "Not sent"}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Create Notification Modal */}
      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)}>
          <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
            <div>
              <p className="text-lg font-semibold">Create Notification</p>

              <p className="mt-1 text-xs text-zinc-600">
                Create a new platform notification.
              </p>
            </div>

            <button
              onClick={() => setCreateOpen(false)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-xs text-zinc-500">Title</label>

              <input
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Notification title"
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-[#f0b90b]/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs text-zinc-500">
                Message
              </label>

              <textarea
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Write your notification..."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-[#f0b90b]/40"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs text-zinc-500">Type</label>

                <select
                  value={newType}
                  onChange={(event) =>
                    setNewType(event.target.value as NotificationType)
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#111820] px-3 text-sm text-white outline-none focus:border-[#f0b90b]/40"
                >
                  <option value="System">System</option>
                  <option value="Security">Security</option>
                  <option value="Transaction">Transaction</option>
                  <option value="Promotion">Promotion</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-zinc-500">
                  Audience
                </label>

                <select
                  value={newAudience}
                  onChange={(event) =>
                    setNewAudience(event.target.value as Audience)
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#111820] px-3 text-sm text-white outline-none focus:border-[#f0b90b]/40"
                >
                  <option value="All Users">All Users</option>
                  <option value="Active Users">Active Users</option>
                  <option value="Admins">Admins</option>
                </select>
              </div>
            </div>

            <button
              onClick={createNotification}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f0b90b] py-3 text-sm font-semibold text-black hover:bg-[#f0b90b]/90"
            >
              <Plus size={17} />
              Create Draft
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0b1016] shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-1 break-words text-xs text-zinc-300">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] text-zinc-600">
        <Bell size={22} />
      </div>

      <p className="mt-4 text-sm font-medium text-zinc-300">
        No notifications found
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        Try changing your search or filters.
      </p>
    </div>
  );
}
