"use client";

import React, { useState } from "react";
import { useAnnouncements } from "@/hooks/queries/useAdminModules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  Pin, AlertTriangle, Info, Wrench, Sparkles, Plus, Calendar, Megaphone, Pencil, Trash2
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal }      from "@/components/ui/Modal";

const ANNOUNCEMENT_TYPES = ["info", "warning", "maintenance", "feature"];
const TARGETS = ["all", "astrologers", "free_users", "pro_users"];

function AnnouncementModal({
  ann,
  onClose,
}: {
  ann: any | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!ann;
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

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? adminApiFetch(`/api/v1/admin/announcements/${ann.id}`, { method: "PATCH", body: JSON.stringify(data) })
        : adminApiFetch("/api/v1/admin/announcements", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-announcements"] }); onClose(); },
  });

  return (
    <Modal title={isEdit ? "Refine Broadcast Payload" : "Initialize New Broadcast"} isOpen={true} onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Broadcast Directive / Title</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:border-admin-accent transition-all" placeholder="e.g. SYSTEM_MAINTENANCE_LEVEL_01" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Message Body / Semantic Content</label>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text h-28 resize-none focus:border-admin-accent transition-all leading-relaxed" placeholder="Detailed broadcast message..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Transmission Mode</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text appearance-none cursor-pointer">
              {ANNOUNCEMENT_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Target Cluster</label>
            <select value={form.targetAudience} onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text appearance-none cursor-pointer">
              {TARGETS.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Activation Epoch</label>
            <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Termination Epoch</label>
            <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text" />
          </div>
        </div>

        <div className="flex gap-10 pt-2 border-t border-admin-border/30">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${form.isActive ? "bg-admin-accent" : "bg-admin-elevated"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${form.isActive ? "left-7" : "left-1"}`} />
            </div>
            <span className="text-[11px] font-black text-admin-text uppercase tracking-widest opacity-60 group-hover:opacity-100 italic">Global Visibility</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div onClick={() => setForm(f => ({ ...f, isPinned: !f.isPinned }))} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${form.isPinned ? "bg-admin-accent" : "bg-admin-elevated"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${form.isPinned ? "left-7" : "left-1"}`} />
            </div>
            <span className="text-[11px] font-black text-admin-text uppercase tracking-widest opacity-60 group-hover:opacity-100 italic">Persistent Priority</span>
          </label>
        </div>

        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="w-full btn-gold py-4 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <div className="w-5 h-5 border-2 border-admin-deep/30 border-t-admin-deep rounded-full animate-spin" /> : <Megaphone className="w-4 h-4" />}
          {mutation.isPending ? "Broadcasting Sequence..." : isEdit ? "Update Broadcast Matrix" : "Deploy Live Broadcast"}
        </button>
      </div>
    </Modal>
  );
}

export default function AnnouncementsPage() {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const [modalOpen, setModalOpen] = useState<any | null | "new">(null);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApiFetch(`/api/v1/admin/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-announcements"] }),
  });

  const typeIcons: Record<string, any> = { info: Info, warning: AlertTriangle, maintenance: Wrench, feature: Sparkles };
  const typeColors: Record<string, string> = {
    info: "text-admin-info border-admin-info/20 bg-admin-info/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    warning: "text-admin-warning border-admin-warning/20 bg-admin-warning/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    maintenance: "text-purple-400 border-purple-500/20 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
    feature: "text-admin-success border-admin-success/20 bg-admin-success/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]",
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Emergency Broadcast Command"
        description="Global platform-wide notifications, maintenance telemetry, and feature rollout alerts"
        actions={
          <button onClick={() => setModalOpen("new")} className="btn-gold text-xs font-bold flex items-center gap-2 py-3 px-5 shadow-xl shadow-admin-accent/10">
            <Plus className="w-4 h-4" /> Initialize Master Broadcast
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5">
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-3xl bg-admin-elevated animate-pulse border border-admin-border" />)
        ) : announcements.length === 0 ? (
          <div className="glass-card py-32 text-center border-dashed border-2 flex flex-col items-center">
            <Megaphone className="w-16 h-16 text-admin-text-muted/10 mb-6" />
            <p className="text-admin-text-secondary text-sm font-medium tracking-wide">Platform communications buffer is empty.</p>
          </div>
        ) : (
          announcements.map((ann: any) => {
            const Icon = typeIcons[ann.type] || Info;
            return (
              <div key={ann.id} className={`group relative glass-card p-6 border border-admin-border transition-all duration-500 hover:border-admin-accent/30 ${!ann.isActive ? "opacity-40 grayscale" : ""}`}>
                <div className="flex items-start justify-between gap-8">
                  <div className="flex items-start gap-6 flex-1">
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${typeColors[ann.type]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-bold text-admin-text group-hover:text-admin-accent transition-colors">{ann.title}</h3>
                        {ann.isPinned && <Pin className="w-3.5 h-3.5 text-admin-accent animate-pulse" />}
                        <div className="flex gap-2">
                           <span className="text-[9px] font-black uppercase tracking-widest text-admin-text bg-admin-elevated border border-admin-border/50 px-2 py-1 rounded-lg">
                             {ann.targetAudience.replace(/_/g, " ")}
                           </span>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${ann.isActive ? 'text-admin-success bg-admin-success/5 border-admin-success/20' : 'text-admin-text-muted bg-admin-elevated border-admin-border'}`}>
                             {ann.isActive ? 'Live' : 'Archived'}
                           </span>
                        </div>
                      </div>
                      <p className="text-sm text-admin-text-secondary mt-3 leading-relaxed opacity-80 italic">
                        "{ann.content}"
                      </p>
                      <div className="flex flex-wrap items-center gap-6 mt-6 pt-5 border-t border-admin-border/40 text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-muted">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-admin-accent/50"/> Start: {ann.startDate ? new Date(ann.startDate).toLocaleString() : 'Immediate'}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-admin-danger/50"/> End: {ann.endDate ? new Date(ann.endDate).toLocaleString() : 'Permanent'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button onClick={() => setModalOpen(ann)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-admin-elevated text-admin-text border border-admin-border hover:border-admin-accent hover:text-admin-accent transition-all shadow-lg">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirm("Permanently purge this broadcast?") && deleteMutation.mutate(ann.id)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-admin-danger/5 text-admin-danger/40 border border-admin-danger/20 hover:bg-admin-danger/10 hover:text-admin-danger transition-all shadow-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <AnnouncementModal
          ann={modalOpen === "new" ? null : modalOpen}
          onClose={() => setModalOpen(null)}
        />
      )}
    </div>
  );
}
