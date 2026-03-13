"use client";

import React, { useState } from "react";
import { useDashboardStats, useDashboardGrowth } from "@/hooks/queries/useDashboardStats";
import {
  BarChart3, Gauge, TrendingUp, Users, CreditCard, Shield, Activity, Share2, Globe
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPICard }    from "@/components/ui/KPICard";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"ecosystem" | "governance">("ecosystem");
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: growthData, isLoading: growthLoading } = useDashboardGrowth(30);

  const kpis = statsData?.kpis || {};
  const planDistribution = statsData?.planDistribution || [];

  const ecosystemCards = [
    { label: "Pro Astrologers", value: kpis.totalAstrologers, trend: 12.4, icon: Users, color: "purple" as const, description: "Active Practitioners" },
    { label: "Client Registry", value: kpis.totalClients, trend: 8.1, icon: Globe, color: "success" as const, description: "Managed Customers" },
    { label: "Platform flux", value: kpis.totalPlatformUsers, trend: 10.2, icon: BarChart3, color: "accent" as const, description: "Total Active Segments" },
  ];

  const governanceCards = [
    { label: "Governance Force", value: kpis.totalAdmins, trend: 0, icon: Shield, color: "info" as const, description: "Platform Staff" },
    { label: "Pending Verifications", value: kpis.pendingVerifications, trend: kpis.pendingVerifications > 0 ? -5 : 0, icon: Gauge, color: "warning" as const, description: "Action Required" },
    { label: "Support Volatility", value: kpis.openTickets, trend: -2.4, icon: Activity, color: "danger" as const, description: "Ticket Backlog" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PageHeader
        title="Intelligence & Analytics"
        description="Comprehensive platform telemetry, growth projections, and administrative governance"
      />

      {/* Segment Navigation */}
      <div className="flex gap-1 p-1 bg-admin-elevated/40 border border-admin-border/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("ecosystem")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === "ecosystem" ? "bg-admin-accent text-admin-deep shadow-lg" : "text-admin-text-muted hover:text-admin-text"
          }`}
        >
          <Share2 className="w-3.5 h-3.5" /> Ecosystem Performance
        </button>
        <button
          onClick={() => setActiveTab("governance")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === "governance" ? "bg-admin-accent text-admin-deep shadow-lg" : "text-admin-text-muted hover:text-admin-text"
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Operations & Governance
        </button>
      </div>

      {/* Strategic KPIs based on Tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {statsLoading || growthLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-3xl bg-admin-elevated animate-pulse border border-admin-border" />)
        ) : (
          (activeTab === "ecosystem" ? ecosystemCards : governanceCards).map((card, i) => (
            <KPICard
              key={i}
              label={card.label}
              value={typeof card.value === 'string' ? parseFloat(card.value) : (card.value || 0)}
              trend={card.trend}
              icon={card.icon}
              color={card.color}
              description={card.description}
            />
          ))
        )}
      </div>

      {/* Secondary Analysis Layer */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Growth Matrix (Always shown for overall platform health) */}
        <div className="glass-card p-8 border border-admin-border/50">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-sm font-black text-admin-text uppercase tracking-[0.2em]">Subscriber Ingress (30D)</h2>
              <p className="text-[10px] text-admin-text-muted mt-1 font-bold uppercase tracking-widest">Growth Velocity Telemetry</p>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-admin-accent bg-admin-accent/5 border border-admin-accent/20 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-admin-accent/5">
              <TrendingUp className="w-3 h-3" /> Live Signal
            </div>
          </div>
          <div className="h-64 flex items-end gap-1.5 px-2">
            {growthLoading ? (
              <div className="w-full h-full bg-admin-elevated/20 animate-pulse rounded-2xl border border-admin-border/50" />
            ) : growthData?.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center border-dashed border-2 border-admin-border/30 rounded-2xl bg-admin-elevated/10">
                 <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Insufficient Data Packets</p>
              </div>
            ) : (
              growthData?.map((d: any, i: number) => {
                const max = Math.max(...growthData.map((x: any) => x.newSubscriptions), 1);
                const height = (d.newSubscriptions / max) * 100;
                return (
                  <div key={i} className="flex-1 group relative">
                    <div
                      className="w-full bg-admin-accent/20 hover:bg-admin-accent transition-all duration-500 rounded-t-lg group-hover:shadow-[0_0_15px_rgba(var(--admin-accent-rgb),0.3)]"
                      style={{ height: `${Math.max(6, height)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-admin-elevated border border-admin-border text-admin-text text-[10px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 pointer-events-none shadow-2xl z-10 uppercase tracking-widest flex flex-col items-center">
                      <span className="text-admin-accent mb-0.5">{d.newSubscriptions} New</span>
                      <span className="opacity-40">{new Date(d.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Tier Distribution Matrix */}
        <div className="glass-card p-8 border border-admin-border/50">
           <div className="mb-10">
            <h2 className="text-sm font-black text-admin-text uppercase tracking-[0.2em]">Tier Distribution Matrix</h2>
            <p className="text-[10px] text-admin-text-muted mt-1 font-bold uppercase tracking-widest">Market Share of Active Tiers</p>
          </div>
          <div className="space-y-6">
            {statsLoading ? (
              [...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-2xl bg-admin-elevated animate-pulse border border-admin-border/50" />)
            ) : planDistribution.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em]">Zero Active Tiers Detected</p>
              </div>
            ) : (
              planDistribution.map((plan: any) => {
                const total = planDistribution.reduce((acc: number, p: any) => acc + p.subscribers, 0);
                const pct = total > 0 ? (plan.subscribers / total) * 100 : 0;
                return (
                  <div key={plan.planName} className="group">
                    <div className="flex justify-between items-end mb-2">
                       <div className="flex items-center gap-3">
                         <span className="text-xs font-black text-admin-text uppercase tracking-widest group-hover:text-admin-accent transition-colors">{plan.planName}</span>
                         <span className="text-[9px] text-admin-text-muted font-black uppercase tracking-widest bg-admin-elevated/50 px-2 py-0.5 rounded-lg border border-admin-border/30">{plan.tier}</span>
                       </div>
                       <span className="text-[10px] font-black text-admin-text tracking-widest">{plan.subscribers} <span className="opacity-40">UNITS</span></span>
                    </div>
                    <div className="h-2.5 rounded-full bg-admin-elevated overflow-hidden border border-admin-border/50 p-[1px]">
                       <div
                         className="h-full rounded-full bg-gradient-to-r from-admin-accent/60 via-admin-accent to-admin-accent-hover transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--admin-accent-rgb),0.2)]"
                         style={{ width: `${pct}%` }}
                       />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
