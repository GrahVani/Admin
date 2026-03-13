"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import {
  Users, CreditCard, UserCheck, AlertTriangle, TrendingUp, TrendingDown,
  Minus, Activity, Cpu, LifeBuoy, Shield
} from "lucide-react";
import { useEngineHealth } from "@/hooks/queries/useEngineHealth";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { KPICard } from "@/components/ui/KPICard";

function ServiceStatusDot({ status }: { status: string }) {
  const color =
    status === "online" ? "bg-admin-success" : status === "degraded" ? "bg-admin-warning" : "bg-admin-danger";
  return (
    <span className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse shrink-0`} />
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => adminApiFetch("/api/v1/admin/dashboard/stats"),
    refetchInterval: 30_000,
    select: (r) => r?.data,
  });

  const { data: growthData = [] } = useQuery({
    queryKey: ["dashboard-growth"],
    queryFn: () => adminApiFetch("/api/v1/admin/dashboard/growth?days=30"),
    select: (r) => r?.data ?? [],
  });

  const { data: health } = useEngineHealth();

  const platformKpis = [
    { label: "Ecosystem Flux", value: stats?.kpis?.totalPlatformUsers ?? 0, icon: Users, trend: 12, color: "accent" as const, description: "Total Platform Participants" },
    { label: "Astrologer Network", value: stats?.kpis?.totalAstrologers ?? 0, icon: UserCheck, trend: 5, color: "purple" as const, description: "Active Practitioners (Non-Admin)" },
    { label: "Client Database", value: stats?.kpis?.totalClients ?? 0, icon: Users, trend: 8, color: "success" as const, description: "End-Users/Clients Managed" },
  ];

  const governanceKpis = [
    { label: "Governance Force", value: stats?.kpis?.totalAdmins ?? 0, icon: Shield, trend: 0, color: "info" as const, description: "Internal Admins/Staff" },
    { label: "Pending Verification", value: stats?.kpis?.pendingVerifications ?? 0, icon: AlertTriangle, trend: (stats?.kpis?.pendingVerifications || 0) > 0 ? -2 : 0, color: "warning" as const, description: "Action Required" },
    { label: "Open Support Desk", value: stats?.kpis?.openTickets ?? 0, icon: LifeBuoy, trend: -5, color: "danger" as const, description: "Awaiting Resolution" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {isError && (
        <div className="p-4 rounded-2xl bg-admin-danger/10 border border-admin-danger/20 flex items-center gap-3 text-admin-danger">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Communication Link Severed</p>
            <p className="opacity-80">Failed to fetch platform metrics. Internal governance data may be stale.</p>
          </div>
        </div>
      )}

      {/* Ecosystem Flux Section */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1 opacity-50">Ecosystem Flux</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {platformKpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} loading={isLoading} />
          ))}
        </div>
      </div>

      {/* Internal Governance Section */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-admin-text-muted uppercase tracking-[0.2em] ml-1 opacity-50">Internal Governance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {governanceKpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} loading={isLoading} />
          ))}
        </div>
      </div>

      {/* Growth Chart + Plan Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-admin-text uppercase tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
              Subscription Growth (30d)
            </h2>
            <Activity className="w-4 h-4 text-admin-accent" />
          </div>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a843" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                <XAxis dataKey="date" tick={{ fill: "#8892a8", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#8892a8", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111a2e", border: "1px solid #1e2d4a", borderRadius: "12px" }}
                  labelStyle={{ color: "#e8ecf4", fontSize: 11 }}
                />
                <Area type="monotone" dataKey="newSubscriptions" stroke="#d4a843" fill="url(#colorSubs)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-admin-text-muted text-sm">
              {isLoading ? "Loading chart…" : "No subscription data yet"}
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-bold text-admin-text uppercase tracking-wider mb-5" style={{ fontFamily: "var(--font-display)" }}>
            Subscription Distribution
          </h2>
          {stats?.planDistribution?.length > 0 ? (
            <div className="space-y-3">
              {stats.planDistribution.map((plan: any, i: number) => {
                const total = stats.kpis?.totalSubscriptions || 1;
                const pct = Math.round((plan.subscribers / total) * 100);
                const tierColors: Record<string, string> = {
                  free: "bg-slate-500",
                  essential: "bg-blue-500",
                  professional: "bg-amber-500",
                  enterprise: "bg-emerald-500",
                };
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-admin-text font-medium capitalize">{plan.planName}</span>
                      <span className="text-admin-text-secondary">{plan.subscribers} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-admin-elevated overflow-hidden">
                      <div
                        className={`h-full rounded-full ${tierColors[plan.tier] || "bg-admin-accent"} transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-admin-text-muted text-sm py-8 text-center">
              {isLoading ? "Loading…" : "No subscription plans yet"}
            </p>
          )}
        </div>
      </div>

      {/* System Health Widget */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-admin-text uppercase tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
            System Health
          </h2>
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
            health?.overallStatus === "healthy"
              ? "bg-admin-success/20 text-admin-success"
              : health?.overallStatus === "degraded"
              ? "bg-admin-warning/20 text-admin-warning"
              : "bg-admin-danger/20 text-admin-danger"
          }`}>
            {health?.overallStatus?.toUpperCase() ?? "CHECKING…"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {health?.services?.map((svc: any) => (
            <div key={svc.name} className="flex items-center gap-2.5 p-3 rounded-xl bg-admin-elevated">
              <ServiceStatusDot status={svc.status} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-admin-text truncate">{svc.name}</p>
                <p className="text-[10px] text-admin-text-muted">{svc.latencyMs}ms</p>
              </div>
            </div>
          )) ?? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-admin-elevated animate-pulse" />
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold text-admin-text uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Recent Admin Activity
        </h2>
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.recentActivity.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-admin-elevated transition-colors">
                <div className="w-2 h-2 rounded-full bg-admin-accent mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-admin-text">
                    <span className="font-semibold">{log.adminEmail}</span>{" "}
                    <span className="text-admin-text-secondary">{log.action?.replace(/_/g, " ").toLowerCase()}</span>
                  </p>
                  <p className="text-[11px] text-admin-text-muted mt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-admin-text-muted text-sm py-6 text-center">
            {isLoading ? "Loading activity…" : "No recent activity"}
          </p>
        )}
      </div>
    </div>
  );
}
