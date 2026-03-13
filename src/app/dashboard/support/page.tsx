"use client";

import React, { useState } from "react";
import { useSupport, useSupportTicket } from "@/hooks/queries/useAdminModules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  ChevronDown, CheckCircle, Clock, Send
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable }  from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Drawer }      from "@/components/ui/Drawer";

const PRIORITIES = ["all", "low", "medium", "high", "urgent"];
const STATUSES = ["all", "open", "in_progress", "resolved", "closed"];
const CATEGORIES = ["all", "billing", "technical", "account", "feature_request", "other"];

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    high: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",
    urgent: "bg-admin-danger/10 text-admin-danger border-admin-danger/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${map[priority] || ""}`}>
      {priority}
    </span>
  );
}

function TicketDetailDrawer({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const qc = useQueryClient();
  const [reply, setReply] = useState("");

  const updateMutation = useMutation({
    mutationFn: (body: any) =>
      adminApiFetch(`/api/v1/admin/support/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-support"] });
      qc.invalidateQueries({ queryKey: ["admin-support-ticket", ticketId] });
      setReply("");
    },
  });

  return (
    <Drawer
      title={`Ticket Ledger #${ticketId.slice(0, 8)}`}
      isOpen={true}
      onClose={onClose}
      footer={
        <div className="p-4 bg-admin-deep border-t border-admin-border space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Engineer a professional resolution..."
            className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text h-28 resize-none focus:border-admin-accent transition-all leading-relaxed"
          />
          <button
            onClick={() => updateMutation.mutate({ resolution: reply })}
            disabled={!reply || updateMutation.isPending}
            className="w-full btn-gold py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg"
          >
            {updateMutation.isPending ? <div className="w-5 h-5 border-2 border-admin-deep/30 border-t-admin-deep rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            {updateMutation.isPending ? "Transmitting..." : "Send Intelligence Output"}
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-admin-elevated animate-pulse border border-admin-border" />)}
        </div>
      ) : ticket ? (
        <div className="p-6 space-y-8">
          {/* User Profile */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-admin-elevated/40 border border-admin-border/50">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-admin-accent to-admin-accent/40 flex items-center justify-center text-2xl font-black text-admin-deep shadow-lg">
               {ticket.userEmail[0].toUpperCase()}
             </div>
             <div>
               <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Subscriber Identifier</p>
               <p className="text-sm font-bold text-admin-text">{ticket.userEmail}</p>
             </div>
          </div>

          {/* Ticket Body */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] mb-1">Query Subject</p>
              <h3 className="text-lg font-bold text-admin-text leading-tight">{ticket.subject}</h3>
            </div>
            <div className="p-5 rounded-2xl bg-admin-deep/50 border border-admin-border text-sm text-admin-text-secondary whitespace-pre-wrap leading-relaxed italic opacity-80">
              {ticket.description}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
             <div className="p-4 rounded-2xl bg-admin-elevated/50 border border-admin-border flex flex-col items-center">
               <p className="text-[9px] font-black text-admin-text-muted mb-2 uppercase tracking-widest">Priority</p>
               <PriorityBadge priority={ticket.priority} />
             </div>
             <div className="p-4 rounded-2xl bg-admin-elevated/50 border border-admin-border flex flex-col items-center">
               <p className="text-[9px] font-black text-admin-text-muted mb-2 uppercase tracking-widest">Category</p>
               <span className="text-[10px] font-bold text-admin-text uppercase tracking-widest">{ticket.category.replace(/_/g, " ")}</span>
             </div>
             <div className="p-4 rounded-2xl bg-admin-elevated/50 border border-admin-border flex flex-col items-center">
               <p className="text-[9px] font-black text-admin-text-muted mb-2 uppercase tracking-widest">Status</p>
               <StatusBadge status={ticket.status} />
             </div>
          </div>

          {/* Strategic Actions */}
          <div className="flex gap-3 pt-4 border-t border-admin-border/50">
             {ticket.status !== "resolved" && (
               <button
                 onClick={() => updateMutation.mutate({ status: "resolved" })}
                 disabled={updateMutation.isPending}
                 className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-admin-success/5 text-admin-success border border-admin-success/20 hover:bg-admin-success/10 text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
               </button>
             )}
             {ticket.status !== "in_progress" && ticket.status !== "resolved" && (
               <button
                 onClick={() => updateMutation.mutate({ status: "in_progress" })}
                 disabled={updateMutation.isPending}
                 className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-500/5 text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 <Clock className="w-3.5 h-3.5" /> Flag Active
               </button>
             )}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data, isLoading } = useSupport({ page, status, priority, category });
  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination;

  const columns = [
    {
      header: "Strategic ID",
      accessor: (t: any) => (
        <span className="text-xs font-mono text-admin-text-secondary opacity-60">#{t.id.slice(0, 8)}</span>
      )
    },
    {
      header: "Subscriber",
      accessor: (t: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-admin-text truncate max-w-[140px]">{t.userEmail}</span>
        </div>
      )
    },
    {
      header: "Objective / Subject",
      accessor: (t: any) => (
        <span className="text-xs text-admin-text-secondary truncate max-w-[200px] block opacity-80 italic">"{t.subject}"</span>
      )
    },
    { header: "Priority", accessor: (t: any) => <PriorityBadge priority={t.priority} /> },
    { header: "Status", accessor: (t: any) => <StatusBadge status={t.status} /> },
    {
      header: "Last Sync",
      accessor: (t: any) => (
        <span className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest">
          {new Date(t.updatedAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Command Support Desk"
        description={`Active management of critical user inquiries and platform troubleshooting (${pagination?.total ?? 0} tickets)`}
      />

      {/* Strategic Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative w-44">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="appearance-none w-full pl-3 pr-8 py-3 rounded-xl bg-admin-input border border-admin-border text-[10px] font-black uppercase tracking-widest text-admin-text focus:outline-none focus:border-admin-accent cursor-pointer">
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
        </div>
        <div className="relative w-44">
          <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="appearance-none w-full pl-3 pr-8 py-3 rounded-xl bg-admin-input border border-admin-border text-[10px] font-black uppercase tracking-widest text-admin-text focus:outline-none focus:border-admin-accent cursor-pointer">
            {PRIORITIES.map(p => <option key={p} value={p}>{p === "all" ? "All Priorities" : p}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
        </div>
        <div className="relative w-44">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="appearance-none w-full pl-3 pr-8 py-3 rounded-xl bg-admin-input border border-admin-border text-[10px] font-black uppercase tracking-widest text-admin-text focus:outline-none focus:border-admin-accent cursor-pointer">
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c.replace(/_/g, " ")}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-admin-text-muted pointer-events-none" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        onRowClick={(t) => setSelectedTicketId(t.id)}
        pagination={pagination ? {
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          onPageChange: (p) => setPage(p)
        } : undefined}
      />

      {selectedTicketId && (
        <TicketDetailDrawer ticketId={selectedTicketId} onClose={() => setSelectedTicketId(null)} />
      )}
    </div>
  );
}
