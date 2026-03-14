"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiFetch, adminApiFetchCSV } from "@/lib/api";
import { 
  ScrollText, Shield, Database, Settings, Activity, FileText, Eye, 
  ChevronDown, ChevronLeft, ChevronRight, Download, X, Filter,
  Calendar, Clock, User, Search, Trash2, Edit, Plus, RotateCcw,
  CheckCircle, XCircle, AlertTriangle, History, Zap, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { format, formatDistanceToNow, subDays } from "date-fns";

// Types
interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  previousValues: any;
  newValues: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// Statistics Cards
function StatsCards({ logs }: { logs: AuditLog[] }) {
  const stats = useMemo(() => {
    const total = logs.length;
    const creates = logs.filter(l => l.action.includes("CREATE")).length;
    const updates = logs.filter(l => l.action.includes("UPDATE")).length;
    const deletes = logs.filter(l => l.action.includes("DELETE")).length;
    const uniqueAdmins = new Set(logs.map(l => l.adminId)).size;
    
    return [
      { label: "Total Actions", value: total, icon: ScrollText, color: "blue" },
      { label: "Created", value: creates, icon: Plus, color: "green" },
      { label: "Updated", value: updates, icon: Edit, color: "amber" },
      { label: "Deleted", value: deletes, icon: Trash2, color: "rose" },
      { label: "Active Admins", value: uniqueAdmins, icon: User, color: "purple" },
    ];
  }, [logs]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
            stat.color === "blue" ? "bg-blue-500/10 text-blue-400" :
            stat.color === "green" ? "bg-emerald-500/10 text-emerald-400" :
            stat.color === "amber" ? "bg-amber-500/10 text-amber-400" :
            stat.color === "rose" ? "bg-rose-500/10 text-rose-400" :
            "bg-violet-500/10 text-violet-400"
          }`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
          <p className="text-xs text-slate-500">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// Action Badge
function ActionBadge({ action }: { action: string }) {
  const config: Record<string, { icon: any; color: string; bg: string }> = {
    USER_CREATE: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    USER_UPDATE: { icon: Edit, color: "text-amber-400", bg: "bg-amber-500/10" },
    USER_DELETE: { icon: Trash2, color: "text-rose-400", bg: "bg-rose-500/10" },
    USER_ROLE_CHANGE: { icon: Shield, color: "text-violet-400", bg: "bg-violet-500/10" },
    USER_STATUS_CHANGE: { icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
    PLAN_CREATE: { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    PLAN_UPDATE: { icon: Edit, color: "text-amber-400", bg: "bg-amber-500/10" },
    PLAN_DELETE: { icon: Trash2, color: "text-rose-400", bg: "bg-rose-500/10" },
    SUBSCRIPTION_ASSIGN: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    SUBSCRIPTION_CANCEL: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
    SUBSCRIPTION_EXTEND: { icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
    SETTING_UPDATE: { icon: Settings, color: "text-amber-400", bg: "bg-amber-500/10" },
    CONTENT_CREATE: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    CONTENT_UPDATE: { icon: Edit, color: "text-amber-400", bg: "bg-amber-500/10" },
    CONTENT_DELETE: { icon: Trash2, color: "text-rose-400", bg: "bg-rose-500/10" },
    SUPPORT_RESOLVE: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  };
  
  const c = config[action] || { icon: Activity, color: "text-slate-400", bg: "bg-slate-500/10" };
  const Icon = c.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${c.color} ${c.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {action.replace(/_/g, " ")}
    </span>
  );
}

// Diff Viewer
function DiffViewer({ previous, current }: { previous: any; current: any }) {
  const changes: { field: string; old: any; new: any }[] = [];
  
  const allKeys = new Set([...Object.keys(previous || {}), ...Object.keys(current || {})]);
  
  allKeys.forEach(key => {
    const oldVal = previous?.[key];
    const newVal = current?.[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old: oldVal, new: newVal });
    }
  });
  
  if (changes.length === 0) {
    return <p className="text-slate-500 text-sm">No changes detected</p>;
  }
  
  return (
    <div className="space-y-2">
      {changes.map((change, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-800/50 text-sm">
          <span className="text-slate-400">{change.field}</span>
          <span className="text-rose-400 line-through">{JSON.stringify(change.old)}</span>
          <span className="text-emerald-400">{JSON.stringify(change.new)}</span>
        </div>
      ))}
    </div>
  );
}

// Detail Modal
function AuditDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <ActionBadge action={log.action} />
            <span className="text-slate-500">•</span>
            <span className="text-sm text-slate-400">
              {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Admin Info */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-800/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg font-bold text-amber-400">
              {log.adminEmail[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-200">{log.adminEmail}</p>
              <p className="text-xs text-slate-500">Admin ID: {log.adminId.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Target Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">Target Type</p>
              <p className="text-sm font-medium text-slate-200">{log.targetType || "System"}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">Target ID</p>
              <p className="text-sm font-mono text-slate-300">{log.targetId || "N/A"}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">IP Address</p>
              <p className="text-sm font-mono text-slate-300">{log.ipAddress || "Unknown"}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30">
              <p className="text-xs text-slate-500 mb-1">User Agent</p>
              <p className="text-sm text-slate-400 truncate">{log.userAgent || "Unknown"}</p>
            </div>
          </div>

          {/* Changes */}
          {(log.previousValues || log.newValues) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Changes
              </h3>
              <DiffViewer previous={log.previousValues} current={log.newValues} />
            </div>
          )}

          {/* Raw Data */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Complete Data
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Previous Values</p>
                <pre className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400 overflow-auto max-h-48">
                  {JSON.stringify(log.previousValues, null, 2) || "null"}
                </pre>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">New Values</p>
                <pre className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400 overflow-auto max-h-48">
                  {JSON.stringify(log.newValues, null, 2) || "null"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Main Page
export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch logs with filters
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", page, actionFilter, targetFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "50");
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (targetFilter !== "all") params.append("targetType", targetFilter);
      
      // Date range
      if (dateRange === "today") {
        params.append("startDate", format(new Date(), "yyyy-MM-dd"));
      } else if (dateRange === "week") {
        params.append("startDate", format(subDays(new Date(), 7), "yyyy-MM-dd"));
      } else if (dateRange === "month") {
        params.append("startDate", format(subDays(new Date(), 30), "yyyy-MM-dd"));
      }
      
      const response = await adminApiFetch(`/api/v1/admin/audit-logs?${params.toString()}`);
      return response.data;
    },
  });

  const logs: AuditLog[] = data?.items || [];
  const pagination = data;

  // Filter by search
  const filteredLogs = useMemo(() => {
    if (!search) return logs;
    return logs.filter(l => 
      l.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.targetType?.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  // Export to CSV
  const handleExport = () => {
    const csv = [
      ["Timestamp", "Admin", "Action", "Target Type", "Target ID", "IP Address"].join(","),
      ...filteredLogs.map(l => [
        l.createdAt,
        l.adminEmail,
        l.action,
        l.targetType || "",
        l.targetId || "",
        l.ipAddress || ""
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  // Unique actions for filter
  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueTargets = [...new Set(logs.map(l => l.targetType).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Complete history of administrative actions across the platform"
      />

      {/* Stats */}
      <StatsCards logs={logs} />

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by admin, action, or target..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <select 
              value={actionFilter} 
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action.replace(/_/g, " ")}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={targetFilter} 
              onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Targets</option>
              {uniqueTargets.map(target => (
                <option key={target} value={target}>{target}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              value={dateRange} 
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700 text-sm text-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Administrator</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Action</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Target</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">IP Address</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-12 rounded-lg bg-slate-800/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-300">
                          {format(new Date(log.createdAt), "HH:mm:ss")}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(log.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400">
                          {log.adminEmail[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300">{log.adminEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-300">{log.targetType || "System"}</span>
                        <span className="text-xs text-slate-500 font-mono">{log.targetId?.slice(0, 12)}...</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-slate-400">{log.ipAddress || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
            <p className="text-sm text-slate-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <AuditDetailModal 
            log={selectedLog} 
            onClose={() => setSelectedLog(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
