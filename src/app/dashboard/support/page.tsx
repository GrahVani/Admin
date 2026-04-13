"use client";

import React, { useState, useMemo } from "react";
import { useSupport, useSupportTicket } from "@/hooks/queries/useAdminModules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Clock, Send, Search, Filter, MessageSquare, User, Calendar,
  ChevronDown, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle,
  Check, X, MoreHorizontal, Mail, Phone, Tag, FileText, Edit3, Trash2,
  ArrowLeft, Reply, Paperclip, Download, UserCheck, Clock as ClockIcon
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { format, formatDistanceToNow } from "date-fns";

// Priority badge
function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { color: string; label: string }> = {
    urgent: { color: "rose", label: "Urgent" },
    high: { color: "amber", label: "High" },
    medium: { color: "blue", label: "Medium" },
    low: { color: "slate", label: "Low" },
  };
  const c = config[priority] || config.low;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${c.color}-500/10 text-${c.color}-400 border border-${c.color}-500/20`}>
      {c.label}
    </span>
  );
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    open: { color: "blue", icon: Clock, label: "Open" },
    in_progress: { color: "amber", icon: RefreshCw, label: "In Progress" },
    resolved: { color: "emerald", icon: CheckCircle, label: "Resolved" },
    closed: { color: "slate", icon: Check, label: "Closed" },
  };
  const c = config[status] || config.open;
  const Icon = c.icon;
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${c.color}-500/10 text-${c.color}-400 border border-${c.color}-500/20 flex items-center gap-1.5`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// Toast notification
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 ${
        type === "success" ? "bg-emerald-500 text-slate-900" : "bg-rose-500 text-white"
      }`}
    >
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}

// Ticket Detail Modal
function TicketDetailModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const qc = useQueryClient();
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
      setToast({ message: "Ticket updated", type: "success" });
    },
    onError: (error: any) => {
      setToast({ message: error.message || "Update failed", type: "error" });
    }
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateMutation.mutate({ status: newStatus });
  };

  const handleReply = () => {
    if (!reply.trim()) return;
    updateMutation.mutate({ 
      reply,
      status: ticket?.status === "open" ? "in_progress" : undefined
    });
  };

  if (isLoading) {
    return (
      <Modal title="Loading Ticket..." isOpen={true} onClose={onClose}>
        <div className="space-y-4 animate-pulse">
          <div className="h-20 rounded-xl bg-slate-800/50" />
          <div className="h-40 rounded-xl bg-slate-800/50" />
          <div className="h-20 rounded-xl bg-slate-800/50" />
        </div>
      </Modal>
    );
  }

  if (!ticket) return null;

  return (
    <>
      <Modal 
        title={`Ticket #${ticketId.slice(0, 8)}`} 
        isOpen={true} 
        onClose={onClose}
      >
        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">{ticket.subject}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="text-sm text-slate-500">
                  {format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {ticket.status !== "resolved" && (
                <button
                  onClick={() => handleStatusChange("resolved")}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Resolve
                </button>
              )}
              {ticket.status === "resolved" && (
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-600 transition-colors"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>

          {/* User Info Card */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-lg font-bold text-slate-900">
                {ticket.userEmail[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-200">{ticket.userEmail}</p>
                <p className="text-sm text-slate-500">User ID: {ticket.userId?.slice(0, 8)}...</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <p className="text-sm font-medium text-slate-400 mb-2">Description</p>
            <p className="text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Replies */}
          {ticket.replies && ticket.replies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400">Conversation History</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ticket.replies.map((reply: any, i: number) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl ${reply.isAdmin ? "bg-amber-500/10 border border-amber-500/20" : "bg-slate-800/30"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium ${reply.isAdmin ? "text-amber-400" : "text-slate-400"}`}>
                        {reply.isAdmin ? "Support Agent" : "Customer"}
                      </span>
                      <span className="text-xs text-slate-600">
                        {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{reply.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reply Box */}
          {ticket.status !== "closed" && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400">Add Reply</h3>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={!reply.trim() || updateMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {updateMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reply
                </button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Category</p>
              <p className="text-slate-300 capitalize">{ticket.category?.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Created</p>
              <p className="text-slate-300">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Last Updated</p>
              <p className="text-slate-300">{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</p>
            </div>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// Main Support Page
export default function SupportPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { data, isLoading, refetch } = useSupport({ page, status, priority, category });
  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination;

  // Search filter (client-side)
  const filteredTickets = useMemo(() => {
    if (!search) return tickets;
    return tickets.filter((t: any) => 
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [tickets, search]);

  // Stats
  const stats = {
    total: pagination?.total || 0,
    open: tickets.filter((t: any) => t.status === "open").length,
    inProgress: tickets.filter((t: any) => t.status === "in_progress").length,
    urgent: tickets.filter((t: any) => t.priority === "urgent").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Center"
        description="Manage customer support tickets and inquiries"
        actions={
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Tickets</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.open}</p>
          <p className="text-sm text-slate-500">Open</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.inProgress}</p>
          <p className="text-sm text-slate-500">In Progress</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-rose-400">{stats.urgent}</p>
          <p className="text-sm text-slate-500">Urgent</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets by subject, email, or ID..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 appearance-none cursor-pointer"
            style={{ minWidth: "140px" }}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 appearance-none cursor-pointer"
            style={{ minWidth: "140px" }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 appearance-none cursor-pointer"
            style={{ minWidth: "160px" }}
          >
            <option value="all">All Categories</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="feature_request">Feature Request</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-24 text-center">
            <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No tickets found</h3>
            <p className="text-slate-500">All caught up! No support tickets match your filters.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTickets.map((ticket: any) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-200 line-clamp-1">{ticket.subject}</p>
                        <p className="text-xs text-slate-500">#{ticket.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-medium text-slate-400">
                          {ticket.userEmail[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-300">{ticket.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                <p className="text-sm text-slate-500">
                  Showing {((page - 1) * 10) + 1} - {Math.min(page * 10, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal 
          ticketId={selectedTicketId} 
          onClose={() => setSelectedTicketId(null)} 
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
