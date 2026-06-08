"use client";

import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/ui/PageHeader";
import { getAuditLogs } from "@/lib/api";
import { exportAuditLogsToCSV, exportAuditLogsToExcel } from "@/lib/export";
import { formatDateTime, cn } from "@/lib/utils";
import { Search, Filter, Download, Eye, User, FileText, Settings, Shield, Clock, ChevronDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const actionTypes = ["All", "Created", "Updated", "Assigned", "Commented", "Escalated", "Resolved", "Closed", "Login", "Logout", "Registered", "Deleted", "Disabled", "Enabled"];
const modules = ["All", "Auth", "Tickets", "Users", "Departments", "Settings", "SLA", "System"];

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  _raw: Record<string, unknown>;
}

const actionIcons: Record<string, typeof FileText> = {
  Created: FileText,
  Updated: Settings,
  Assigned: User,
  Commented: Eye,
  Escalated: Shield,
  Resolved: Shield,
  Closed: Shield,
  Login: User,
  Logout: User,
  Registered: User,
  Deleted: Shield,
  Disabled: Shield,
  Enabled: Shield,
};

const actionColors: Record<string, string> = {
  Created: "bg-blue-100 text-blue-600",
  Updated: "bg-yellow-100 text-yellow-600",
  Assigned: "bg-purple-100 text-purple-600",
  Commented: "bg-gray-100 text-gray-600",
  Escalated: "bg-red-100 text-red-600",
  Resolved: "bg-green-100 text-green-600",
  Closed: "bg-gray-100 text-gray-600",
  Login: "bg-blue-100 text-blue-600",
  Logout: "bg-gray-100 text-gray-600",
  Registered: "bg-green-100 text-green-600",
  Deleted: "bg-red-100 text-red-600",
  Disabled: "bg-orange-100 text-orange-600",
  Enabled: "bg-green-100 text-green-600",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await getAuditLogs();
        const mapped: AuditLog[] = (data || []).map((log: any) => ({
          id: log.id as string,
          timestamp: new Date(log.created_at as string),
          user: (log.users as { full_name: string } | null)?.full_name ?? "System",
          action: log.action as string,
          module: log.module as string,
          details: (log.details as string) || "",
          ipAddress: (log.ip_address as string) || "N/A",
          _raw: log,
        }));
        setLogs(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "All" || log.action === actionFilter;
    const matchModule = moduleFilter === "All" || log.module === moduleFilter;
    const matchDateFrom = !dateFrom || log.timestamp >= new Date(dateFrom);
    const matchDateTo = !dateTo || log.timestamp <= new Date(dateTo + "T23:59:59");
    return matchSearch && matchAction && matchModule && matchDateFrom && matchDateTo;
  });

  const rawForExport = filtered.map((l) => l._raw);

  function handleExportCSV() {
    exportAuditLogsToCSV(rawForExport as never[], "audit-logs");
  }

  function handleExportExcel() {
    exportAuditLogsToExcel(rawForExport as never[], "audit-logs");
  }

  return (
    <MainLayout>
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes"
        actions={
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white border border-[#D8DDE3] text-[#3B4252] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F4F6F8] transition-colors">
              <Download size={16} /> Export <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-[#D8DDE3] rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-[#3B4252] hover:bg-[#F4F6F8]">Export as CSV</button>
              <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm text-[#3B4252] hover:bg-[#F4F6F8]">Export as Excel</button>
            </div>
          </div>
        }
      />

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors",
                showFilters ? "bg-[#3B4252] text-white border-[#3B4252]" : "border-[#D8DDE3] text-[#3B4252] hover:bg-[#F4F6F8]"
              )}
            >
              <Filter size={16} /> Filters <ChevronDown size={14} className={cn("transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-[#D8DDE3]">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4252] appearance-none"
              >
                {actionTypes.map((a) => <option key={a} value={a}>{a} Actions</option>)}
              </select>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4252] appearance-none"
              >
                {modules.map((m) => <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#6B7280]">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]"
                />
                <label className="text-sm text-[#6B7280]">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-[#D8DDE3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3B4252]"
                />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={item} className="bg-white rounded-xl border border-[#D8DDE3] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#6B7280]">
              <Loader2 size={24} className="animate-spin mr-2" />
              Loading audit logs...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D8DDE3] bg-[#F4F6F8]">
                    <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Timestamp</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B7280]">User</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Module</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Details</th>
                    <th className="text-left px-4 py-3 font-medium text-[#6B7280]">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => {
                    const Icon = actionIcons[log.action] || FileText;
                    return (
                      <tr key={log.id} className="border-b border-[#D8DDE3] last:border-b-0 hover:bg-[#F4F6F8] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[#6B7280]">
                            <Clock size={14} /> {formatDateTime(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1F2937]">{log.user}</td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", actionColors[log.action])}>
                            <Icon size={12} /> {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F4F6F8] text-[#6B7280] border border-[#D8DDE3]">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#6B7280] max-w-xs truncate">{log.details}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-[#6B7280]">{log.ipAddress}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-[#F4F6F8] rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] mb-1">No audit logs found</h3>
              <p className="text-sm text-[#6B7280] text-center max-w-sm">
                {search || actionFilter !== "All" || moduleFilter !== "All" || dateFrom || dateTo
                  ? "No audit logs match your filters. Try adjusting your search or filter criteria."
                  : "No audit logs have been recorded yet. Activities will appear here as users interact with the system."}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}
