"use client";

import Link from "next/link";

import React from "react";
import { usePlans } from "@/hooks/queries/useSubscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

const TIER_COLORS: Record<string, string> = {
  free:         "bg-admin-elevated/40 border-admin-border/50",
  essential:    "bg-blue-500/5 border-blue-500/20",
  professional: "bg-amber-500/5 border-amber-500/20",
  enterprise:   "bg-emerald-500/5 border-emerald-500/20",
};

const TIER_TEXT: Record<string, string> = {
  free: "text-slate-400",
  essential: "text-blue-400",
  professional: "text-amber-400",
  enterprise: "text-emerald-400",
};

export default function PlansPage() {
  const { data: plans = [], isLoading } = usePlans();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminApiFetch(`/api/v1/admin/plans/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-plans"] }),
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Subscription Architecture"
        description="Configuration of billing tiers and functional permissions"
        actions={
          <Link
            href="/dashboard/subscriptions/plans/new"
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Engineering New Tier
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-admin-elevated animate-pulse border border-admin-border" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="glass-card p-24 text-center border-dashed">
          <Layers className="w-12 h-12 text-admin-text-muted/20 mx-auto mb-6" />
          <p className="text-admin-text-muted text-sm font-medium">Platform architecture is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan: any) => {
            const features = plan.features ?? {};
            const enabledFeatures = Object.entries(features).filter(([_, v]) => v === true);
            return (
              <div
                key={plan.id}
                className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 p-6 flex flex-col ${TIER_COLORS[plan.tier] ?? "bg-admin-elevated border-admin-border"}`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.25em] ${TIER_TEXT[plan.tier] ?? "text-admin-text-muted"}`}>
                      {plan.tier}
                    </span>
                    <h3 className="text-lg font-bold text-admin-text mt-1">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                       <span className="text-2xl font-black text-admin-text" style={{ fontFamily: "var(--font-display)" }}>₹{plan.price}</span>
                       <span className="text-[10px] font-bold text-admin-text-muted uppercase">/{plan.intervalDays} Days</span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${plan.isActive ? "bg-admin-success animate-pulse" : "bg-admin-danger"}`} />
                </div>

                <div className="flex-1 space-y-2 mb-6">
                  {plan.features?.length === 0 ? (
                    <p className="text-[10px] font-bold text-admin-text-muted uppercase italic">Standard Tier Access Only</p>
                  ) : (
                    plan.features.slice(0, 5).map((pf: any) => (
                      <div key={pf.id} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-admin-accent/40" />
                        <span className="text-[11px] font-semibold text-admin-text-secondary truncate">
                          {pf.feature?.name ?? pf.featureId}
                        </span>
                      </div>
                    ))
                  )}
                  {plan.features?.length > 5 && (
                    <p className="text-[9px] font-black text-admin-accent uppercase tracking-widest pl-4">
                      + {plan.features.length - 5} More Capabilities
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-admin-border/50">
                  <Link
                    href={`/dashboard/subscriptions/plans/${plan.id}`}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-admin-primary/50 border border-admin-border hover:border-admin-accent/50 text-admin-text text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm(`Permanently decommission plan tier "${plan.name}"?`)) deleteMutation.mutate(plan.id);
                    }}
                    className="flex items-center justify-center rounded-xl aspect-square w-10 mx-auto bg-admin-danger/5 hover:bg-admin-danger/10 text-admin-danger transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
