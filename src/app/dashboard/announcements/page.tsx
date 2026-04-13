"use client";

import React, { useState, useMemo } from "react";
import { useAnnouncements } from "@/hooks/queries/useAdminModules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pin, AlertTriangle, Info, Wrench, Sparkles, Plus, Calendar, Megaphone, 
  Pencil, Trash2, Search, Filter, Eye, EyeOff, CheckCircle, XCircle,
  Clock, Users, Globe, Zap, Bell, Target, MoreVertical, RefreshCw,
  ChevronDown, ArrowUpDown, X, AlertCircle
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { format, isPast, isFuture, isValid } from "date-fns";

// Announcement type configuration
const ANNOUNCEMENT_TYPES = [
  { id: "info", label: "Info", icon: Info, color: "blue", description: "General information" },
  { id: "warning", label: "Warning", icon: AlertTriangle, color: "amber", description: "Important alerts" },
  { id: "maintenance", label: "Maintenance", icon: Wrench, color: "purple", description: "System maintenance" },
  { id: "feature", label: "Feature", icon: Sparkles, color: "emerald", description: "New features" },
];

const TARGETS = [
  { id: "all", label: "All Users", icon: Globe },
  { id: "astrologers", label: "Astrologers", icon: Users },
  { id: "free_users", label: "Free Users", icon: Users },
  { id: "pro_users", label: "Pro Users", icon: Zap },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; icon: string; dot: string }> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: "text-blue-500", dot: "bg-blue-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: "text-amber-500", dot: "bg-amber-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-500", dot: "bg-purple-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-500", dot: "bg-emerald-500" },
};

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
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}

// Status badge component
function StatusBadge({ isActive, startDate, endDate }: { isActive: boolean; startDate?: string; endDate?: string }) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (!isActive) {
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">Inactive</span>;
  }

  if (start && isFuture(start)) {
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">Scheduled</span>;
  }

  if (end && isPast(end)) {
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">Expired</span>;
  }

  return <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live</span>;
}

// Announcement Modal
function AnnouncementModal({
  ann,
  onClose,
}: {
  ann: any | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!ann;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    title: ann?.title ?? "",
    content: ann?.content ?? "",
    type: ann?.type ?? "info",
    targetAudience: ann?.targetAudience ?? "all",
    isActive: ann?.isActive ?? true,
    isPinned: ann?.isPinned ?? false,
    startDate: ann?.startDate ? new Date(ann.startDate).toISOString().slice(0, 16) : "",
    endDate: ann?.endDate ? new Date(ann.endDate).toISOString().slice(0, 16) : "",
  });

  const selectedType = ANNOUNCEMENT_TYPES.find(t => t.id === form.type);
  const colors = selectedType ? COLOR_MAP[selectedType.color] : COLOR_MAP.blue;

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? adminApiFetch(`/api/v1/admin/announcements/${ann.id}`, { method: "PATCH", body: JSON.stringify(data) })
        : adminApiFetch("/api/v1/admin/announcements", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      setToast({ message: isEdit ? "Announcement updated" : "Announcement created", type: "success" });
      setTimeout(() => onClose(), 1000);
    },
    onError: (error: any) => {
      setToast({ message: error.message || "Operation failed", type: "error" });
    },
  });

  const handleSubmit = () => {
    mutation.mutate(form);
  };

  return (
    <>
      <Modal title={isEdit ? "Edit Announcement" : "Create Announcement"} isOpen={true} onClose={onClose}>
        <div className="space-y-5">
          {/* Type Selection */}
          <div>
            <label className="block text-sm text-slate-400 mb-3">Announcement Type</label>
            <div className="grid grid-cols-4 gap-2">
              {ANNOUNCEMENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = form.type === type.id;
                const typeColors = COLOR_MAP[type.color];
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setForm(f => ({ ...f, type: type.id }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `${typeColors.bg} ${typeColors.border} ${typeColors.text}`
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${isSelected ? typeColors.icon : ""}`} />
                    <p className="text-xs font-medium">{type.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              placeholder="Enter announcement title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Message</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
              placeholder="Enter announcement message..."
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Target Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {TARGETS.map((target) => {
                const Icon = target.icon;
                const isSelected = form.targetAudience === target.id;
                
                return (
                  <button
                    key={target.id}
                    onClick={() => setForm(f => ({ ...f, targetAudience: target.id }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "border-slate-700 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{target.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Start Date (Optional)</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">End Date (Optional)</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-3">
                {form.isActive ? <Eye className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-slate-500" />}
                <div>
                  <p className="text-sm font-medium text-slate-200">Active</p>
                  <p className="text-xs text-slate-500">Show this announcement to users</p>
                </div>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-slate-700"}`}
              >
                <motion.div
                  animate={{ x: form.isActive ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Pin className={`w-5 h-5 ${form.isPinned ? "text-amber-400" : "text-slate-500"}`} />
                <div>
                  <p className="text-sm font-medium text-slate-200">Pinned</p>
                  <p className="text-xs text-slate-500">Keep at the top of the list</p>
                </div>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.isPinned ? "bg-amber-500" : "bg-slate-700"}`}
              >
                <motion.div
                  animate={{ x: form.isPinned ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending || !form.title}
              className="flex-1 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {mutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              {isEdit ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </Modal>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// Main Announcements Page
export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const [modalOpen, setModalOpen] = useState<any | null | "new">(null);
  const [filter, setFilter] = useState<"all" | "active" | "scheduled" | "expired">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApiFetch(`/api/v1/admin/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      setToast({ message: "Announcement deleted", type: "success" });
    },
  });

  // Filter and sort announcements
  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];
    const now = new Date();

    // Search filter
    if (search) {
      result = result.filter(ann => 
        ann.title.toLowerCase().includes(search.toLowerCase()) ||
        ann.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(ann => ann.type === typeFilter);
    }

    // Status filter
    if (filter === "active") {
      result = result.filter(ann => {
        if (!ann.isActive) return false;
        const start = ann.startDate ? new Date(ann.startDate) : null;
        const end = ann.endDate ? new Date(ann.endDate) : null;
        return (!start || !isFuture(start)) && (!end || !isPast(end));
      });
    } else if (filter === "scheduled") {
      result = result.filter(ann => {
        const start = ann.startDate ? new Date(ann.startDate) : null;
        return start && isFuture(start);
      });
    } else if (filter === "expired") {
      result = result.filter(ann => {
        const end = ann.endDate ? new Date(ann.endDate) : null;
        return end && isPast(end);
      });
    }

    // Sort: Pinned first, then by date
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [announcements, search, typeFilter, filter]);

  // Stats
  const stats = {
    total: announcements.length,
    active: announcements.filter((a: any) => a.isActive).length,
    pinned: announcements.filter((a: any) => a.isPinned).length,
    scheduled: announcements.filter((a: any) => {
      const start = a.startDate ? new Date(a.startDate) : null;
      return start && isFuture(start);
    }).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Manage platform-wide notifications, alerts, and feature announcements"
        actions={
          <button
            onClick={() => setModalOpen("new")}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
          <p className="text-sm text-slate-500">Active</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.pinned}</p>
          <p className="text-sm text-slate-500">Pinned</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.scheduled}</p>
          <p className="text-sm text-slate-500">Scheduled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === "all"
                ? "bg-amber-500 text-slate-900"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            All Types
          </button>
          {ANNOUNCEMENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                typeFilter === type.id
                  ? `${COLOR_MAP[type.color].bg} ${COLOR_MAP[type.color].text}`
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))
        ) : filteredAnnouncements.length === 0 ? (
          <div className="glass-card py-24 text-center">
            <Megaphone className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No announcements found</h3>
            <p className="text-slate-500 mb-6">Create your first announcement to notify users</p>
            <button
              onClick={() => setModalOpen("new")}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold hover:bg-amber-400 transition-colors"
            >
              Create Announcement
            </button>
          </div>
        ) : (
          filteredAnnouncements.map((ann: any) => {
            const typeConfig = ANNOUNCEMENT_TYPES.find(t => t.id === ann.type) || ANNOUNCEMENT_TYPES[0];
            const colors = COLOR_MAP[typeConfig.color];
            const Icon = typeConfig.icon;
            const targetLabel = TARGETS.find(t => t.id === ann.targetAudience)?.label || "All Users";

            return (
              <motion.div
                key={ann.id}
                layout
                className={`glass-card p-5 relative ${!ann.isActive ? "opacity-50" : ""} ${ann.isPinned ? "border-amber-500/20" : ""}`}
              >
                {/* Pinned Indicator */}
                {ann.isPinned && (
                  <div className="absolute -top-px left-8 px-3 py-1 rounded-b-lg bg-amber-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </div>
                )}

                <div className="flex items-start gap-5">
                  {/* Type Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-slate-200">{ann.title}</h3>
                          <StatusBadge isActive={ann.isActive} startDate={ann.startDate} endDate={ann.endDate} />
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{ann.content}</p>
                        
                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {targetLabel}
                          </span>
                          {ann.startDate && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Starts: {format(new Date(ann.startDate), "MMM d, h:mm a")}
                            </span>
                          )}
                          {ann.endDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              Ends: {format(new Date(ann.endDate), "MMM d, h:mm a")}
                            </span>
                          )}
                          <span>Created: {format(new Date(ann.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalOpen(ann)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(ann.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && <AnnouncementModal ann={modalOpen === "new" ? null : modalOpen} onClose={() => setModalOpen(null)} />}
      
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
