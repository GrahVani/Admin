"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, BookOpen, Sparkles, Heart, BarChart3, Save, Trash2, Pencil,
  Search, Filter, Grid3X3, List as ListIcon, Eye, EyeOff, MoreVertical,
  ChevronDown, CheckSquare, Square, X, FileText, Tag, Clock, User,
  ArrowUpDown, Download, RefreshCw, AlertTriangle, CheckCircle,
  Sparkle, Flame, Moon, Sun, Star, Gem, Zap, Target
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { format } from "date-fns";

// Content type configuration
const CONTENT_TYPES = [
  { id: "remedy", label: "Remedies", icon: Heart, color: "rose", description: "Vedic remedies and solutions" },
  { id: "yoga", label: "Yogas", icon: Sparkles, color: "emerald", description: "Astrological yoga combinations" },
  { id: "dosha", label: "Doshas", icon: BarChart3, color: "amber", description: "Planetary dosha analysis" },
  { id: "chart_description", label: "Chart Descriptions", icon: BookOpen, color: "blue", description: "Birth chart interpretations" },
  { id: "prediction", label: "Predictions", icon: Target, color: "purple", description: "Future predictions and forecasts" },
  { id: "ritual", label: "Rituals", icon: Flame, color: "orange", description: "Spiritual rituals and practices" },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", icon: "text-rose-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: "text-emerald-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: "text-amber-500" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: "text-blue-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", icon: "text-purple-500" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", icon: "text-orange-500" },
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
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
}

// Content Modal for Create/Edit
function ContentModal({
  item,
  onClose,
}: {
  item: any | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!item;
  const [activeTab, setActiveTab] = useState<"basic" | "seo" | "metadata">("basic");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [form, setForm] = useState({
    title: item?.title ?? "",
    description: item?.description ?? "",
    contentType: item?.contentType ?? "remedy",
    contentKey: item?.contentKey ?? "",
    isPublished: item?.isPublished ?? false,
    tags: item?.tags?.join(", ") ?? "",
    metaTitle: item?.metaTitle ?? "",
    metaDescription: item?.metaDescription ?? "",
    author: item?.author ?? "",
  });

  const selectedType = CONTENT_TYPES.find(t => t.id === form.contentType);
  const colors = selectedType ? COLOR_MAP[selectedType.color] : COLOR_MAP.rose;

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? adminApiFetch(`/api/v1/admin/content/${item.id}`, { 
            method: "PATCH", 
            body: JSON.stringify(data) 
          })
        : adminApiFetch("/api/v1/admin/content", { 
            method: "POST", 
            body: JSON.stringify(data) 
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-content"] });
      setToast({ message: isEdit ? "Content updated successfully" : "Content created successfully", type: "success" });
      setTimeout(() => onClose(), 1000);
    },
    onError: (error: any) => {
      setToast({ message: error.message || "Operation failed", type: "error" });
    }
  });

  const handleSubmit = () => {
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0),
    };
    mutation.mutate(payload);
  };

  return (
    <>
      <Modal title={isEdit ? "Edit Content" : "Create New Content"} isOpen={true} onClose={onClose}>
        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-slate-800/50 rounded-xl">
          {[
            { id: "basic", label: "Basic Info", icon: FileText },
            { id: "seo", label: "SEO & Tags", icon: Tag },
            { id: "metadata", label: "Metadata", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {activeTab === "basic" && (
            <>
              {/* Content Type Selection */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">Content Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = form.contentType === type.id;
                    const typeColors = COLOR_MAP[type.color];
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => setForm(f => ({ ...f, contentType: type.id }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${typeColors.bg} ${typeColors.border} ${typeColors.text}`
                            : "border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? typeColors.icon : ""}`} />
                        <p className="text-xs font-medium">{type.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Content Key</label>
                  <input
                    value={form.contentKey}
                    onChange={(e) => setForm(f => ({ ...f, contentKey: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                    placeholder="e.g., VEDIC_REMEDY_001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Author</label>
                  <input
                    value={form.author}
                    onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                    placeholder="Content author"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="Enter content title..."
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                  placeholder="Enter detailed description..."
                />
              </div>
            </>
          )}

          {activeTab === "seo" && (
            <>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="vedic, remedy, mars, dosha..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Meta Title</label>
                <input
                  value={form.metaTitle}
                  onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                  placeholder="SEO title..."
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Meta Description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none"
                  placeholder="SEO description..."
                />
              </div>
            </>
          )}

          {activeTab === "metadata" && (
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-300">Last Updated</p>
                  <p className="text-xs text-slate-500">{item?.updatedAt ? format(new Date(item.updatedAt), "PPp") : "Not saved yet"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-300">Created By</p>
                  <p className="text-xs text-slate-500">{item?.createdBy || "Current User"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
            <div className="flex items-center gap-3">
              {form.isPublished ? (
                <Eye className="w-5 h-5 text-emerald-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {form.isPublished ? "Published" : "Draft"}
                </p>
                <p className="text-xs text-slate-500">
                  {form.isPublished ? "Visible to all users" : "Only visible to admins"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.isPublished ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <motion.div
                animate={{ x: form.isPublished ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
              />
            </button>
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
              {mutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

// Main Content Page
export default function ContentPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState<any | null | "new">(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-content", filter],
    queryFn: () => adminApiFetch(filter === "all" ? "/api/v1/admin/content" : `/api/v1/admin/content?type=${filter.toLowerCase()}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApiFetch(`/api/v1/admin/content/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-content"] });
      setSelectedItems([]);
      setToast({ message: "Content deleted successfully", type: "success" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => adminApiFetch(`/api/v1/admin/content/${id}`, { method: "DELETE" })));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-content"] });
      setSelectedItems([]);
      setToast({ message: `${selectedItems.length} items deleted`, type: "success" });
    },
  });

  const items = data?.data || [];

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];
    
    if (search) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        item.contentKey.toLowerCase().includes(search.toLowerCase()) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });
    
    return result;
  }, [items, search, sortBy]);

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItems(selectedItems.length === filteredItems.length ? [] : filteredItems.map((i: any) => i.id));
  };

  // Stats
  const stats = {
    total: items.length,
    published: items.filter((i: any) => i.isPublished).length,
    draft: items.filter((i: any) => !i.isPublished).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management"
        description="Manage astrological content, remedies, yogas, and chart descriptions"
        actions={
          <button
            onClick={() => setModalOpen("new")}
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Content
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          <p className="text-sm text-slate-500">Total Content</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-emerald-400">{stats.published}</p>
          <p className="text-sm text-slate-500">Published</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-amber-400">{stats.draft}</p>
          <p className="text-sm text-slate-500">Drafts</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 space-y-4">
        {/* Search and Actions */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, key, or tags..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
          <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-slate-700 text-slate-200" : "text-slate-500"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-slate-700 text-slate-200" : "text-slate-500"}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-amber-500 text-slate-900"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
            }`}
          >
            All Types
          </button>
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                filter === type.id
                  ? `${COLOR_MAP[type.color].bg} ${COLOR_MAP[type.color].text}`
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <span className="text-sm text-amber-400 font-medium">
              {selectedItems.length} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={() => bulkDeleteMutation.mutate(selectedItems)}
              className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </motion.div>
        )}
      </div>

      {/* Content Grid/List */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card py-24 text-center">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No content found</h3>
          <p className="text-slate-500 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {filteredItems.map((item: any) => {
            const typeConfig = CONTENT_TYPES.find(t => t.id === item.contentType) || CONTENT_TYPES[0];
            const colors = COLOR_MAP[typeConfig.color];
            const Icon = typeConfig.icon;
            const isSelected = selectedItems.includes(item.id);

            if (viewMode === "list") {
              return (
                <motion.div
                  key={item.id}
                  layout
                  className={`glass-card p-4 flex items-center gap-4 group ${isSelected ? "border-amber-500/30" : ""}`}
                >
                  <button
                    onClick={() => toggleSelection(item.id)}
                    className="text-slate-500 hover:text-amber-400"
                  >
                    {isSelected ? <CheckSquare className="w-5 h-5 text-amber-400" /> : <Square className="w-5 h-5" />}
                  </button>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-200 truncate">{item.title}</h3>
                    <p className="text-xs text-slate-500">{typeConfig.label} · {item.contentKey}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isPublished ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Published</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">Draft</span>
                    )}
                    <button
                      onClick={() => setModalOpen(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            }

            // Grid view
            return (
              <motion.div
                key={item.id}
                layout
                className={`glass-card p-5 group relative ${isSelected ? "border-amber-500/30" : ""}`}
              >
                {/* Selection Checkbox */}
                <button
                  onClick={() => toggleSelection(item.id)}
                  className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {typeConfig.label}
                      </span>
                      {item.isPublished ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="text-[10px] text-slate-500">Draft</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 line-clamp-1">{item.title}</h3>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4 min-h-[40px]">
                  {item.description || "No description provided"}
                </p>

                {/* Tags */}
                {item.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span>{item.contentKey}</span>
                  <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setModalOpen(item)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && <ContentModal item={modalOpen === "new" ? null : modalOpen} onClose={() => setModalOpen(null)} />}
      
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
