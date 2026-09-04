"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Users,
  Database,
  X,
} from "lucide-react";

type AuditSeverity = "Info" | "Warning" | "Critical";

type AuditLog = {
  id: string;
  actor: string;
  actorEmail: string;
  action: string;
  target: string;
  targetId: string;
  description: string;
  severity: AuditSeverity;
  ipAddress: string;
  timestamp: string;
};

const auditLogs: AuditLog[] = [
  {
    id: "AUD-10021",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "Wallet Adjustment",
    target: "Wallet",
    targetId: "WAL-10001",
    description: "Wallet balance was manually adjusted for Elisa Eve.",
    severity: "Warning",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 3, 2026 09:42 AM",
  },
  {
    id: "AUD-10020",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "Withdrawal Approved",
    target: "Withdrawal",
    targetId: "WD-82941",
    description: "Withdrawal request was approved for processing.",
    severity: "Info",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 3, 2026 09:18 AM",
  },
  {
    id: "AUD-10019",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "User Suspended",
    target: "User",
    targetId: "USR-10482",
    description: "User account was temporarily suspended by an administrator.",
    severity: "Critical",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 3, 2026 08:56 AM",
  },
  {
    id: "AUD-10018",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "Investment Plan Updated",
    target: "Investment Plan",
    targetId: "PLAN-003",
    description: "Premium investment plan configuration was updated.",
    severity: "Warning",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 2, 2026 06:32 PM",
  },
  {
    id: "AUD-10017",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "Settings Updated",
    target: "System Settings",
    targetId: "SET-001",
    description: "Platform notification settings were modified.",
    severity: "Warning",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 2, 2026 05:14 PM",
  },
  {
    id: "AUD-10016",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "User Created",
    target: "User",
    targetId: "USR-10481",
    description: "A new user account was created on the platform.",
    severity: "Info",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 2, 2026 03:47 PM",
  },
  {
    id: "AUD-10015",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "Withdrawal Rejected",
    target: "Withdrawal",
    targetId: "WD-82937",
    description: "Withdrawal request was rejected by an administrator.",
    severity: "Warning",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 2, 2026 01:21 PM",
  },
  {
    id: "AUD-10014",
    actor: "Admin",
    actorEmail: "admin@bnb.com",
    action: "Login",
    target: "Admin Account",
    targetId: "ADMIN-001",
    description: "Administrator successfully logged into the dashboard.",
    severity: "Info",
    ipAddress: "192.168.1.10",
    timestamp: "Sep 2, 2026 09:04 AM",
  },
];

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const styles = {
    Info: "bg-blue-500/10 text-blue-400",
    Warning: "bg-amber-500/10 text-amber-400",
    Critical: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[severity]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          severity === "Info"
            ? "bg-blue-400"
            : severity === "Warning"
              ? "bg-amber-400"
              : "bg-red-400"
        }`}
      />

      {severity}
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

function AuditMenu({ onView }: { onView: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
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

          <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111820] p-1 shadow-2xl">
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
          </div>
        </>
      )}
    </div>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");

  const [severityFilter, setSeverityFilter] = useState<"All" | AuditSeverity>(
    "All",
  );

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return auditLogs.filter((log) => {
      const matchesSeverity =
        severityFilter === "All" || log.severity === severityFilter;

      const matchesSearch =
        !query ||
        log.id.toLowerCase().includes(query) ||
        log.actor.toLowerCase().includes(query) ||
        log.actorEmail.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.target.toLowerCase().includes(query) ||
        log.targetId.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query);

      return matchesSeverity && matchesSearch;
    });
  }, [search, severityFilter]);

  const warningCount = auditLogs.filter(
    (log) => log.severity === "Warning",
  ).length;

  const criticalCount = auditLogs.filter(
    (log) => log.severity === "Critical",
  ).length;

  const infoCount = auditLogs.filter((log) => log.severity === "Info").length;

  return (
    <div className="min-h-screen bg-[#080c11] text-white">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#f0b90b]">
            Admin
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Monitor important actions and administrative activity across the
            platform.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Events"
            value={auditLogs.length.toString()}
            description="Recorded audit events"
            icon={Activity}
          />

          <SummaryCard
            label="Info Events"
            value={infoCount.toString()}
            description="Normal system activity"
            icon={ShieldCheck}
          />

          <SummaryCard
            label="Warnings"
            value={warningCount.toString()}
            description="Events requiring attention"
            icon={ShieldAlert}
          />

          <SummaryCard
            label="Critical Events"
            value={criticalCount.toString()}
            description="High-priority events"
            icon={Database}
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search audit logs..."
                className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#f0b90b]/40"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(["All", "Info", "Warning", "Critical"] as const).map(
                (severity) => (
                  <button
                    key={severity}
                    onClick={() => setSeverityFilter(severity)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-medium transition ${
                      severityFilter === severity
                        ? "bg-[#f0b90b] text-black"
                        : "border border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:text-white"
                    }`}
                  >
                    {severity}
                  </button>
                ),
              )}
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
                    Event
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Actor
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Target
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Severity
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    IP Address
                  </th>

                  <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Timestamp
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015]"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {log.action}
                        </p>

                        <p className="mt-0.5 max-w-[280px] truncate text-[11px] text-zinc-600">
                          {log.description}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-700">
                          {log.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0b90b]/10 text-[#f0b90b]">
                          <Users size={14} />
                        </div>

                        <div>
                          <p className="text-xs font-medium">{log.actor}</p>

                          <p className="text-[10px] text-zinc-600">
                            {log.actorEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs text-zinc-300">{log.target}</p>

                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        {log.targetId}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <SeverityBadge severity={log.severity} />
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {log.ipAddress}
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {log.timestamp}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <AuditMenu onView={() => setSelectedLog(log)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && <EmptyState />}

          <TableFooter count={filteredLogs.length} />
        </div>

        {/* Mobile */}
        <div className="space-y-3 lg:hidden">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-white/[0.06] bg-[#0b1016] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{log.action}</p>

                    <SeverityBadge severity={log.severity} />
                  </div>

                  <p className="mt-1 text-[11px] text-zinc-600">{log.id}</p>
                </div>

                <AuditMenu onView={() => setSelectedLog(log)} />
              </div>

              <p className="mt-4 text-xs leading-5 text-zinc-500">
                {log.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Actor
                  </p>

                  <p className="mt-1 text-xs text-zinc-300">{log.actor}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Target
                  </p>

                  <p className="mt-1 text-xs text-zinc-300">{log.target}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    IP Address
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">{log.ipAddress}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                    Time
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">{log.timestamp}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && <EmptyState />}
        </div>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <button
            aria-label="Close modal"
            onClick={() => setSelectedLog(null)}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0b1016] shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.06] p-5">
              <div>
                <p className="text-lg font-semibold">Audit Event</p>

                <p className="mt-1 text-xs text-zinc-600">{selectedLog.id}</p>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-600">Severity</p>

                  <div className="mt-2">
                    <SeverityBadge severity={selectedLog.severity} />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-600">Timestamp</p>

                  <p className="mt-1 text-xs text-zinc-300">
                    {selectedLog.timestamp}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-white">
                  {selectedLog.action}
                </p>

                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  {selectedLog.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Detail label="Actor" value={selectedLog.actor} />

                <Detail label="Email" value={selectedLog.actorEmail} />

                <Detail label="Target" value={selectedLog.target} />

                <Detail label="Target ID" value={selectedLog.targetId} />

                <Detail label="IP Address" value={selectedLog.ipAddress} />

                <Detail label="Event ID" value={selectedLog.id} />
              </div>
            </div>
          </div>
        </div>
      )}
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
        <Activity size={22} />
      </div>

      <p className="mt-4 text-sm font-medium text-zinc-300">
        No audit logs found
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        Try changing your search or filter.
      </p>
    </div>
  );
}

function TableFooter({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
      <p className="text-xs text-zinc-600">
        Showing <span className="text-zinc-400">{count}</span> events
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled
          className="rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-zinc-700"
        >
          Previous
        </button>

        <button className="rounded-lg border border-[#f0b90b]/20 bg-[#f0b90b]/10 px-3 py-2 text-xs text-[#f0b90b]">
          1
        </button>

        <button className="rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-zinc-500 hover:text-white">
          Next
        </button>
      </div>
    </div>
  );
}
