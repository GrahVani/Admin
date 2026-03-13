"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePlans, usePlatformFeatures } from "@/hooks/queries/useSubscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PlanEditorPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const qc = useQueryClient();
  const isNew = id === "new";

  // Fetch all plans to find ours (if editing)
  const { data: plans = [], isLoading: isPlansLoading } = usePlans();
  const { data: platformFeatures = [], isLoading: isFeaturesLoading } = usePlatformFeatures();

  // Find target plan and initialize form
  const plan = isNew ? null : plans.find((p: any) => p.id === id);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tier: "essential",
    monthlyPrice: 0,
    annualPrice: 0,
    trialDays: 0,
    maxClients: 50,
    maxChartsPerMonth: 500,
    maxReportsPerMonth: 10,
    dynamicFeatures: {} as Record<string, boolean>,
    isActive: true,
  });

  // Hydrate form when plan is found
  useEffect(() => {
    if (!isNew && plan) {
      const initialFeatures: Record<string, boolean> = {};
      if (plan.features) {
        plan.features.forEach((pf: any) => {
          initialFeatures[pf.featureId] = pf.value === true || pf.value === "true";
        });
      }
      setForm({
        name: plan.name ?? "",
        slug: plan.slug ?? "",
        tier: plan.tier ?? "essential",
        monthlyPrice: plan.monthlyPrice ?? 0,
        annualPrice: plan.annualPrice ?? 0,
        trialDays: plan.trialDays ?? 0,
        maxClients: plan.maxClients ?? 50,
        maxChartsPerMonth: plan.maxChartsPerMonth ?? 500,
        maxReportsPerMonth: plan.maxReportsPerMonth ?? 10,
        dynamicFeatures: initialFeatures,
        isActive: plan.isActive ?? true,
      });
    }
  }, [plan, isNew]);

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        dynamicFeatures: Object.entries(data.dynamicFeatures).map(([featureId, value]) => ({
          featureId,
          value,
        })),
      };
      return isNew
        ? adminApiFetch("/api/v1/admin/plans", { method: "POST", body: JSON.stringify(payload) })
        : adminApiFetch(`/api/v1/admin/plans/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      router.push("/dashboard/subscriptions/plans");
    },
  });

  const toggleFeature = (featureId: string) =>
    setForm((f) => ({
      ...f,
      dynamicFeatures: {
        ...f.dynamicFeatures,
        [featureId]: !f.dynamicFeatures[featureId],
      },
    }));

  // Group features by category
  const categorizedFeatures = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    const order = ["Core Astrology", "Modules", "Analysis", "Power Tools", "Platform"];
    platformFeatures.forEach((feat: any) => {
      const cat = feat.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(feat);
    });
    
    // Sort logically
    return Object.entries(groups).sort((a, b) => {
      const indexA = order.indexOf(a[0]);
      const indexB = order.indexOf(b[0]);
      if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0]);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [platformFeatures]);

  if (isPlansLoading || isFeaturesLoading) {
    return <div className="text-center py-20 animate-pulse text-admin-text-muted">Loading Engine Schematic...</div>;
  }

  if (!isNew && !plan) {
    return <div className="text-center py-20 text-admin-danger/80">Blueprint not found in registry.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/subscriptions/plans" className="p-2 rounded-xl bg-admin-elevated border border-admin-border hover:border-admin-accent transition-all">
          <ArrowLeft className="w-5 h-5 text-admin-text-muted hover:text-admin-text" />
        </Link>
        <PageHeader
          title={isNew ? "Engineer New Plan Blueprint" : `Editing: ${form.name || plan.name}`}
          description="Configure foundational access limits and advanced engine matrices."
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Metadata & Limits */}
        <div className="xl:col-span-4 space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.2em] mb-3 border-b border-admin-border pb-2">
              Base Specifications
            </h3>
            
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Plan Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text focus:border-admin-accent transition-all" placeholder="e.g. Astro Pro" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Unique Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text focus:border-admin-accent transition-all" placeholder="e.g. astro-pro" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Tier Classification</label>
                  <select value={form.tier} onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))} className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text appearance-none cursor-pointer">
                    {["free", "essential", "professional", "enterprise"].map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Monthly Cost (₹)</label>
                  <input type="number" min="0" value={form.monthlyPrice} onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text font-mono" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
             <h3 className="text-[10px] font-bold text-admin-text-muted uppercase tracking-[0.2em] mb-3 border-b border-admin-border pb-2">
              Operational Limits
            </h3>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Concurrent Client Profiles</label>
                <div className="flex gap-2 items-center">
                  <input type="number" min="1" value={form.maxClients} onChange={(e) => setForm((f) => ({ ...f, maxClients: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text font-mono" />
                </div>
                <p className="text-[9px] text-admin-text-muted/60 pl-1 mt-0.5">Maximum saved clients allowed.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-admin-border/50">
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Charts / Mo</label>
                  <input type="number" value={form.maxChartsPerMonth} onChange={(e) => setForm((f) => ({ ...f, maxChartsPerMonth: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-admin-text-muted uppercase tracking-widest ml-1">Reports / Mo</label>
                  <input type="number" value={form.maxReportsPerMonth} onChange={(e) => setForm((f) => ({ ...f, maxReportsPerMonth: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-1.5 rounded-xl bg-admin-input border border-admin-border text-xs text-admin-text font-mono" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 bg-admin-bg/50">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-admin-text uppercase tracking-widest">Deployment Status</h3>
                  <p className="text-[9px] text-admin-text-muted">If deactivated, new users cannot subscribe.</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${form.isActive ? "bg-admin-success" : "bg-admin-border"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${form.isActive ? "left-7" : "left-1"}`} />
                  </div>
                </label>
            </div>
            
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending || !form.name || !form.slug}
              className="w-full btn-gold py-3 rounded-xl text-sm font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? "Executing Sequence..." : isNew ? "Initialize Protocol" : "Synchronize System"}
            </button>
          </div>
        </div>


        {/* RIGHT COLUMN: Dynamic Feature Matrix */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center gap-3 mb-1 px-1">
             <div className="w-1.5 h-5 bg-admin-accent rounded-full" />
             <h2 className="text-lg font-bold text-admin-text" style={{ fontFamily: "var(--font-display)" }}>Dynamic Feature Matrix Selection</h2>
          </div>

          {categorizedFeatures.length === 0 ? (
            <div className="glass-card p-8 text-center text-admin-text-muted/60 text-sm italic">
                Platform registry contains no configurable features.
            </div>
          ) : (
             <div className="columns-1 lg:columns-2 2xl:columns-3 gap-3">
                {categorizedFeatures.map(([category, features]) => {
                  const enabledCount = features.filter(f => form.dynamicFeatures[f.id]).length;
                  const totalCount = features.length;
                  
                  return (
                    <div key={category} className="glass-card p-0 overflow-hidden flex flex-col border border-admin-border/80 break-inside-avoid mb-3">
                      <div className="px-3 py-2 bg-admin-elevated/40 border-b border-admin-border/50 flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-admin-text-secondary">
                          {category}
                        </span>
                        <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded-md ${enabledCount === totalCount ? 'bg-admin-success/20 text-admin-success' : enabledCount > 0 ? 'bg-admin-accent/20 text-admin-accent' : 'bg-admin-border/50 text-admin-text-muted'}`}>
                          {enabledCount} / {totalCount}
                        </span>
                      </div>
                      
                      <div className="divide-y divide-admin-border/30 bg-admin-bg/20 flex-1">
                        {features.map((feat: any) => {
                          const isEnabled = form.dynamicFeatures[feat.id] === true;
                          return (
                            <label
                              key={feat.id}
                              className={`flex items-start gap-3 p-2.5 cursor-pointer hover:bg-admin-elevated/30 transition-colors group ${isEnabled ? 'bg-admin-accent/5' : ''}`}
                            >
                              <div
                                onClick={() => toggleFeature(feat.id)}
                                className={`mt-0.5 shrink-0 w-8 h-4 rounded-full transition-all duration-300 relative ${isEnabled ? "bg-admin-accent" : "bg-admin-border"}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${isEnabled ? "left-4.5" : "left-0.5"}`} />
                              </div>
                              <div className="flex flex-col flex-1" onClick={(e) => { e.preventDefault(); toggleFeature(feat.id); }}>
                                <span className={`text-[12px] font-bold ${isEnabled ? 'text-admin-text' : 'text-admin-text-muted group-hover:text-admin-text transition-colors'}`}>
                                  {feat.name}
                                </span>
                                {feat.description && (
                                  <span className="text-[10px] text-admin-text-muted/70 mt-0.5 leading-relaxed">
                                    {feat.description}
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
