"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  Plus, BookOpen, Sparkles, Heart, BarChart3, Save, Trash2, Pencil
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";

const CONTENT_TYPES = ["remedy", "yoga", "dosha", "chart_description"];

function ContentModal({
  item,
  onClose,
}: {
  item: any | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!item;
  const [form, setForm] = useState({
    title: item?.title ?? "",
    description: item?.description ?? "",
    contentType: item?.contentType ?? "remedy",
    contentKey: item?.contentKey ?? "",
    isPublished: item?.isPublished ?? true,
    metadata: item?.metadata ?? {},
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? adminApiFetch(`/api/v1/admin/content/${item.id}`, { method: "PATCH", body: JSON.stringify(data) })
        : adminApiFetch("/api/v1/admin/content", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-content"] }); onClose(); },
  });

  return (
    <Modal title={isEdit ? "Refine Knowledge Content" : "Engineer New Content"} isOpen={true} onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Classifier Type</label>
            <select value={form.contentType} onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text appearance-none cursor-pointer">
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">System Identifier / Code</label>
            <input value={form.contentKey} onChange={(e) => setForm((f) => ({ ...f, contentKey: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:border-admin-accent transition-all" placeholder="e.g. VEDIC_REMEDY_001" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Content Headline</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:border-admin-accent transition-all" placeholder="Enter administrative title..." />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Detailed Description / Semantic Body</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-4 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text h-40 resize-none focus:border-admin-accent transition-all leading-relaxed" placeholder="Detailed content payload..." />
        </div>

        <div className="pt-2 flex items-center justify-between">
           <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form.isPublished ? "bg-admin-accent" : "bg-admin-elevated"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${form.isPublished ? "left-7" : "left-1"}`} />
              </div>
              <span className="text-[11px] font-bold text-admin-text uppercase tracking-widest opacity-60 group-hover:opacity-100 italic">Live Production Visibility</span>
            </label>
        </div>

        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="w-full btn-gold py-4 rounded-2xl font-bold uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-2"
        >
          {mutation.isPending ? <div className="w-5 h-5 border-2 border-admin-deep/30 border-t-admin-deep rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {mutation.isPending ? "Processing Payload..." : isEdit ? "Update Content Module" : "Deploy New Content Tier"}
        </button>
      </div>
    </Modal>
  );
}

export default function ContentPage() {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState<any | null | "new">(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content", filter],
    queryFn: () => adminApiFetch(filter === "all" ? "/api/v1/admin/content" : `/api/v1/admin/content?type=${filter.toLowerCase()}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApiFetch(`/api/v1/admin/content/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-content"] }),
  });

  const items = data?.data || [];
  const typeIcons: Record<string, any> = { remedy: Heart, yoga: Sparkles, dosha: BarChart3, chart_description: BookOpen };
  const typeColors: Record<string, string> = {
    remedy: "text-pink-400 border-pink-500/20 bg-pink-500/5",
    yoga: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    dosha: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    chart_description: "text-blue-400 border-blue-500/20 bg-blue-500/5",
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Knowledge Base Management"
        description="Curate Remedies, Yogas, and Dosha descriptions for the platform engine"
        actions={
          <button onClick={() => setModalOpen("new")} className="btn-gold text-xs font-bold flex items-center gap-2 py-3 px-5 shadow-xl shadow-admin-accent/10">
            <Plus className="w-4 h-4" /> Initialize Knowledge Item
          </button>
        }
      />

      <div className="flex gap-2.5 overflow-x-auto pb-2">
        {["All", "Remedy", "Yoga", "Dosha", "Chart_Description"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border whitespace-nowrap ${
              filter === f 
                ? "bg-admin-accent text-admin-deep border-admin-accent shadow-lg shadow-admin-accent/20" 
                : "text-admin-text-secondary border-admin-border bg-admin-elevated/20 hover:bg-admin-elevated"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-admin-elevated animate-pulse border border-admin-border" />
          ))
        ) : items.length === 0 ? (
          <div className="col-span-full glass-card py-24 text-center border-dashed border-2">
            <BookOpen className="w-12 h-12 text-admin-text-muted/20 mx-auto mb-6" />
            <p className="text-admin-text-secondary text-sm font-medium">Platform content ledger is empty for this category.</p>
          </div>
        ) : (
          items.map((item: any) => {
            const Icon = typeIcons[item.contentType] || BookOpen;
            return (
              <div key={item.id} className="group relative glass-card p-6 border border-admin-border/50 hover:border-admin-accent/30 transition-all duration-500 flex flex-col">
                <div className="flex items-start gap-5 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 ${typeColors[item.contentType] || "bg-admin-elevated text-admin-text-muted"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-bold text-admin-text truncate group-hover:text-admin-accent transition-colors">{item.title}</h3>
                      {item.isPublished ? (
                        <div className="w-2 h-2 rounded-full bg-admin-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest bg-admin-elevated text-admin-text-muted px-2 py-0.5 rounded-full">Draft</span>
                      )}
                    </div>
                    <p className="text-xs text-admin-text-secondary line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{item.description || "Experimental knowledge item without documentation."}</p>
                    <div className="flex items-center gap-3 mt-4 text-[9px] font-black text-admin-text-muted uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                       {item.contentType.replace("_", " ")} · {item.contentKey}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6 pt-5 border-t border-admin-border/40 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                   <button onClick={() => setModalOpen(item)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-admin-elevated text-[10px] font-black uppercase tracking-widest text-admin-text hover:bg-admin-accent hover:text-admin-deep transition-all">
                     <Pencil className="w-3.5 h-3.5" /> Configure
                   </button>
                   <button onClick={() => confirm("Permanently purge this knowledge component?") && deleteMutation.mutate(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-admin-danger/5 text-admin-danger/50 hover:text-admin-danger hover:bg-admin-danger/10 transition-colors border border-transparent hover:border-admin-danger/20">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <ContentModal
          item={modalOpen === "new" ? null : modalOpen}
          onClose={() => setModalOpen(null)}
        />
      )}
    </div>
  );
}
