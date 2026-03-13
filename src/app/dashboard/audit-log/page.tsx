"use client";

import React, { useState } from "react";
import { useAuditLogs } from "@/hooks/queries/useAdminModules";
import {
  ScrollText, Shield, Database, Settings, Activity, FileText, Eye, Info
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";

function AuditDetailModal({ log, onClose }: { log: any; onClose: () => void }) {
  const prev = log.previousValues;
  const next = log.newValues;

  return (
    <Modal title={`Log Detail: ${log.action.replace(/_/g, " ")}`} isOpen={true} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-admin-elevated border border-admin-border/50">
            <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider font-black">Operator</p>
            <p className="text-xs font-bold text-admin-text truncate">{log.adminEmail}</p>
          </div>
          <div className="p-3 rounded-xl bg-admin-elevated border border-admin-border/50">
            <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider font-black">Segment</p>
            <p className="text-xs font-bold text-admin-text capitalize">{log.targetType || "System"}</p>
          </div>
          <div className="p-3 rounded-xl bg-admin-elevated border border-admin-border/50">
            <p className="text-[10px] text-admin-text-muted mb-1 uppercase tracking-wider font-black">Vector (IP)</p>
            <p className="text-xs font-bold text-admin-text">{log.ipAddress || "Internal"}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-admin-text-muted mb-3 uppercase tracking-[0.2em] font-black opacity-50 flex items-center gap-2">
             <Info className="w-3 h-3" /> Differential Analysis
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-admin-danger/60 uppercase ml-1 tracking-widest">Inertial State (Old)</p>
              <div className="p-5 rounded-2xl bg-admin-deep border border-admin-border/40 h-72 overflow-auto scrollbar-thin font-mono text-[10px] text-admin-text-secondary leading-relaxed shadow-inner">
                {prev ? <pre className="whitespace-pre-wrap">{JSON.stringify(prev, null, 2)}</pre> : <span className="opacity-20 italic">No legacy data packets detected</span>}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-admin-success/60 uppercase ml-1 tracking-widest">Terminal State (New)</p>
              <div className="p-5 rounded-2xl bg-admin-deep border border-admin-border/40 h-72 overflow-auto scrollbar-thin font-mono text-[10px] text-admin-text-secondary leading-relaxed shadow-inner">
                {next ? <pre className="whitespace-pre-wrap">{JSON.stringify(next, null, 2)}</pre> : <span className="opacity-20 italic">Registry deletion event</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data, isLoading } = useAuditLogs(page, 20);
  const logs = data?.items || [];
  const pagination = data?.pagination;

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "text-admin-success";
    if (action.includes("DELETE")) return "text-admin-danger";
    if (action.includes("UPDATE")) return "text-admin-info";
    if (action.includes("ASSIGN")) return "text-purple-400";
    return "text-admin-text-secondary";
  };

  const getActionIcon = (action: string) => {
    if (action.includes("USER")) return Shield;
    if (action.includes("PLAN")) return FileText;
    if (action.includes("SETTING")) return Settings;
    if (action.includes("DB")) return Database;
    return Activity;
  };

  const columns = [
    {
      header: "Timestamp",
      accessor: (log: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-admin-text tracking-tight">
            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[9px] text-admin-text-muted font-black uppercase mt-0.5 tracking-[0.1em] opacity-50">
            {new Date(log.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: "Administrator",
      accessor: (log: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-admin-elevated border border-admin-border/50 flex items-center justify-center text-[10px] font-black text-admin-accent shadow-sm">
            {log.adminEmail[0].toUpperCase()}
          </div>
          <span className="text-xs font-bold text-admin-text truncate max-w-[150px]">{log.adminEmail}</span>
        </div>
      ),
    },
    {
      header: "Operational Action",
      accessor: (log: any) => {
        const ActionIcon = getActionIcon(log.action);
        return (
          <div className="flex items-center gap-2.5">
            <ActionIcon className={`w-3.5 h-3.5 ${getActionColor(log.action)}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
              {log.action.replace(/_/g, " ")}
            </span>
          </div>
        );
      },
    },
    {
      header: "Partition",
      accessor: (log: any) => (
        <span className="text-[9px] font-black text-admin-text-muted bg-admin-elevated/50 px-2.5 py-1 rounded-lg border border-admin-border/30 uppercase tracking-[0.15em]">
          {log.targetType || "SYSTEM"}
        </span>
      ),
    },
    {
      header: "Relay Context",
      accessor: (log: any) => (
        <p className="text-[11px] text-admin-text-secondary font-mono truncate max-w-[150px] opacity-60">
          {log.targetId || "Global Space"}
        </p>
      ),
    },
    {
      header: "",
      accessor: (log: any) => (
        <div className="text-right">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
            className="p-2 rounded-xl bg-admin-elevated/50 hover:bg-admin-accent/10 hover:text-admin-accent transition-all group"
          >
            <Eye className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Administrative Ledger"
        description="Immutable chronicle of platform governance and operational telemetry"
        actions={
          <div className="flex items-center gap-2 bg-admin-elevated/40 border border-admin-border/50 px-4 py-2 rounded-2xl">
            <ScrollText className="w-4 h-4 text-admin-accent" />
            <span className="text-[10px] font-black text-admin-text uppercase tracking-[0.2em]">
              {pagination?.total || 0} Total Packets
            </span>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        onRowClick={(log) => setSelectedLog(log)}
        pagination={pagination ? {
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPage(p)
        } : undefined}
      />

      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
