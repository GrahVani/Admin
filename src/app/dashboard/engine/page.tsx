"use client";

import React from "react";
import { useEngineHealth } from "@/hooks/queries/useEngineHealth";
import { Cpu, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

function statusIcon(status: string) {
  if (status === "online") return <CheckCircle className="w-5 h-5 text-admin-success" />;
  if (status === "degraded") return <AlertTriangle className="w-5 h-5 text-admin-warning" />;
  return <XCircle className="w-5 h-5 text-admin-danger" />;
}

function LatencyBar({ ms }: { ms: number }) {
  const pct = Math.min(100, (ms / 500) * 100);
  const color = ms < 100 ? "bg-admin-success" : ms < 300 ? "bg-admin-warning" : "bg-admin-danger";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-admin-elevated overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-admin-text-secondary w-12 text-right">{ms}ms</span>
    </div>
  );
}

export default function EnginePage() {
  const { data: health, isLoading, dataUpdatedAt, refetch } = useEngineHealth();

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-admin-text" style={{ fontFamily: "var(--font-display)" }}>
            System Monitor
          </h1>
          <p className="text-sm text-admin-text-secondary mt-1">
            Live service health — auto-refreshes every 10 seconds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
            health?.overallStatus === "healthy"
              ? "bg-admin-success/20 text-admin-success"
              : health?.overallStatus === "degraded"
              ? "bg-admin-warning/20 text-admin-warning"
              : "bg-admin-danger/20 text-admin-danger"
          }`}>
            <Cpu className="w-3.5 h-3.5" />
            {health?.overallStatus?.toUpperCase() ?? "CHECKING…"}
          </span>
          <button
            onClick={() => refetch()}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-admin-border hover:bg-admin-elevated transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-admin-text-muted" />
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(8)].map((_, i) => (
              <div key={i} className="glass-card p-5 h-40 animate-pulse" />
            ))
          : health?.services?.map((svc: any) => (
              <div key={svc.name} className="glass-card p-5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-admin-text">{svc.name}</p>
                    {statusIcon(svc.status)}
                  </div>
                  {svc.name.includes("Proxy") && (
                    <p className="text-[9px] text-admin-accent/70 font-medium uppercase tracking-[0.1em]">Node.js Middleware Layer</p>
                  )}
                  {svc.name.includes("Core") && (
                    <p className="text-[9px] text-admin-warning/70 font-medium uppercase tracking-[0.1em]">Python Calculation Engine</p>
                  )}
                  {svc.name === "API Gateway" && (
                    <p className="text-[9px] text-admin-info/70 font-medium uppercase tracking-[0.1em]">Entry Point & Routing</p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-admin-text-muted uppercase tracking-wider">Latency</p>
                    <span className={`text-[10px] font-bold ${
                      svc.latencyMs < 100 ? "text-admin-success" : svc.latencyMs < 300 ? "text-admin-warning" : "text-admin-danger"
                    }`}>
                      {svc.latencyMs}ms
                    </span>
                  </div>
                  <LatencyBar ms={svc.latencyMs} />
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${
                    svc.status === "online" ? "text-admin-success" : svc.status === "degraded" ? "text-admin-warning" : "text-admin-danger"
                  }`}>
                    {svc.status}
                  </span>
                  <span className="text-[9px] text-admin-text-muted font-mono">{svc.url?.replace(/^https?:\/\//, '').split('/')[0]}</span>
                </div>
              </div>
            )) ?? null}
      </div>

      {/* Overall Summary */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-bold text-admin-text uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Platform Summary
        </h2>
        {health ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-admin-elevated text-center">
              <p className="text-2xl font-bold text-admin-success" style={{ fontFamily: "var(--font-display)" }}>
                {health.services?.filter((s: any) => s.status === "online").length ?? 0}
              </p>
              <p className="text-xs text-admin-text-muted mt-1">Services Online</p>
            </div>
            <div className="p-4 rounded-xl bg-admin-elevated text-center">
              <p className="text-2xl font-bold text-admin-warning" style={{ fontFamily: "var(--font-display)" }}>
                {health.services?.filter((s: any) => s.status === "degraded").length ?? 0}
              </p>
              <p className="text-xs text-admin-text-muted mt-1">Degraded</p>
            </div>
            <div className="p-4 rounded-xl bg-admin-elevated text-center">
              <p className="text-2xl font-bold text-admin-danger" style={{ fontFamily: "var(--font-display)" }}>
                {health.services?.filter((s: any) => s.status === "offline").length ?? 0}
              </p>
              <p className="text-xs text-admin-text-muted mt-1">Offline</p>
            </div>
          </div>
        ) : (
          <p className="text-admin-text-muted text-sm">Loading system data…</p>
        )}
        {dataUpdatedAt && (
          <p className="text-[10px] text-admin-text-muted mt-4">
            Last checked: {new Date(dataUpdatedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
