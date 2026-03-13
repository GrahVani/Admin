"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApiFetch, adminApiFetchPost } from "@/lib/api";
import { 
  RefreshCw, CheckCircle, AlertTriangle, XCircle, 
  Database, Server, Activity, Clock, Play,
  ChevronDown, ChevronUp, ExternalLink, Zap, TrendingUp, 
  TrendingDown, Wifi, WifiOff, Bell, History, BarChart3,
  Terminal, X, ArrowUpRight, Minus, Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { formatDistanceToNow, format, subHours } from "date-fns";

// Types
interface ServiceHealth {
  name: string;
  status: "online" | "offline" | "degraded";
  latencyMs: number;
  url: string;
  lastChecked: string;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  version?: string;
  uptimeFormatted?: string;
  error?: string;
  consecutiveFailures: number;
  availability24h: number;
}

interface HealthAlert {
  id: string;
  service: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface ServiceDetails {
  name: string;
  latencyHistory: number[];
  statusHistory: { status: string; timestamp: string }[];
  alerts: HealthAlert[];
  availability24h: number;
}

interface HealthData {
  overallStatus: "healthy" | "degraded" | "critical";
  timestamp: string;
  services: ServiceHealth[];
  database: {
    status: "connected" | "disconnected" | "slow";
    latencyMs: number;
    queryCount?: number;
    slowQueries?: number;
  };
  statistics: {
    total: number;
    online: number;
    degraded: number;
    offline: number;
    avgResponseTime: number;
    uptimePercentage: number;
  };
}

// Status configs
const statusConfig = {
  online: { 
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    icon: CheckCircle, label: "Online", barColor: "bg-emerald-500"
  },
  degraded: { 
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20",
    icon: AlertTriangle, label: "Degraded", barColor: "bg-amber-500"
  },
  offline: { 
    color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20",
    icon: XCircle, label: "Offline", barColor: "bg-rose-500"
  },
};

const severityConfig = {
  critical: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle },
  info: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CheckCircle },
};

const overallStatusConfig = {
  healthy: { color: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30", icon: CheckCircle },
  degraded: { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", icon: AlertTriangle },
  critical: { color: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30", icon: WifiOff },
};

// API Hooks
function useEngineHealth() {
  return useQuery({
    queryKey: ["engine-health"],
    queryFn: () => adminApiFetch("/api/v1/admin/engine/health"),
    refetchInterval: 10_000,
    select: (res) => res?.data as HealthData,
  });
}

function useEngineHistory(hours = 24) {
  return useQuery({
    queryKey: ["engine-history", hours],
    queryFn: () => adminApiFetch(`/api/v1/admin/engine/health/history?hours=${hours}`),
    select: (res) => res?.data as any[],
  });
}

function useEngineAlerts() {
  return useQuery({
    queryKey: ["engine-alerts"],
    queryFn: () => adminApiFetch("/api/v1/admin/engine/health/alerts"),
    select: (res) => res?.data as HealthAlert[],
  });
}

function useServiceDetails(serviceName: string) {
  return useQuery({
    queryKey: ["engine-service-details", serviceName],
    queryFn: () => adminApiFetch(`/api/v1/admin/engine/health/services/${encodeURIComponent(serviceName)}`),
    enabled: !!serviceName,
    select: (res) => res?.data as ServiceDetails,
  });
}

function useTestService() {
  return useMutation({
    mutationFn: (serviceName: string) => 
      adminApiFetchPost(`/api/v1/admin/engine/health/services/${encodeURIComponent(serviceName)}/test`, {}),
  });
}

// Components
function LatencyMiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data?.length) return <div className="h-10 w-24 opacity-30" />;
  const chartData = data.slice(-10).map((val, i) => ({ value: val, index: i }));
  
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, color = "blue", trend }: any) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    purple: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors[color as keyof typeof colors]} border flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-slate-600 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

function ServiceCard({ service, onTest, onAnalytics }: { 
  service: ServiceHealth; 
  onTest: (name: string) => void;
  onAnalytics: (name: string) => void;
}) {
  const config = statusConfig[service.status];
  const StatusIcon = config.icon;

  return (
    <motion.div layout className={`glass-card overflow-hidden ${
      service.status === "offline" ? "border-rose-500/30" : 
      service.status === "degraded" ? "border-amber-500/30" : ""
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center`}>
              <Server className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">{service.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                {service.version && <span className="text-[10px] text-slate-500">v{service.version}</span>}
              </div>
            </div>
          </div>
          <LatencyMiniChart 
            data={[service.minLatencyMs, service.avgLatencyMs, service.latencyMs, service.maxLatencyMs]} 
            color={service.status === "online" ? "#10b981" : service.status === "degraded" ? "#f59e0b" : "#f43f5e"}
          />
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Current</p>
            <p className={`text-sm font-bold ${service.latencyMs < 100 ? "text-emerald-400" : service.latencyMs < 300 ? "text-amber-400" : "text-rose-400"}`}>
              {service.latencyMs}ms
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Avg</p>
            <p className="text-sm font-bold text-slate-300">{service.avgLatencyMs}ms</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Availability</p>
            <p className={`text-sm font-bold ${service.availability24h > 99 ? "text-emerald-400" : service.availability24h > 95 ? "text-amber-400" : "text-rose-400"}`}>
              {service.availability24h}%
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-500">Uptime</p>
            <p className="text-sm font-bold text-slate-300">{service.uptimeFormatted || "Just started"}</p>
          </div>
        </div>

        <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden mt-3">
          <motion.div 
            className={`h-full rounded-full ${config.barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (service.latencyMs / 500) * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <button 
            onClick={() => onTest(service.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Test
          </button>
          <button 
            onClick={() => onAnalytics(service.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-400 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <a 
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Endpoint
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function AlertsPanel({ alerts }: { alerts: HealthAlert[] }) {
  const [showResolved, setShowResolved] = useState(false);
  const filteredAlerts = showResolved ? alerts : alerts.filter(a => !a.resolved);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="font-semibold text-slate-100">Alerts</h2>
          {alerts.filter(a => !a.resolved).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium">
              {alerts.filter(a => !a.resolved).length}
            </span>
          )}
        </div>
        <button 
          onClick={() => setShowResolved(!showResolved)}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          {showResolved ? "Hide Resolved" : "Show Resolved"}
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No active alerts</p>
        ) : (
          filteredAlerts.slice(0, 10).map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            return (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border ${config.bg} ${config.border} ${alert.resolved ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 ${config.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${config.color}`}>{alert.service}</p>
                    <p className="text-xs text-slate-300">{alert.message}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LatencyTrendsChart({ data }: { data: any[] }) {
  if (!data?.length) return null;

  const chartData = data.map((snapshot: any) => ({
    time: format(new Date(snapshot.timestamp), "HH:mm"),
    avgLatency: snapshot.statistics.avgResponseTime,
    online: snapshot.statistics.online,
  }));

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-slate-100">Latency Trends (24h)</h2>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Line type="monotone" dataKey="avgLatency" stroke="#3b82f6" strokeWidth={2} dot={false} name="Avg Latency (ms)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TestModal({ service, result, onClose }: { service: string; result: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-slate-100">Test Endpoint: {service}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${result.success ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className={result.success ? "text-emerald-400" : "text-rose-400"}>
                  {result.success ? "Success" : "Failed"}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{result.latencyMs}ms</span>
                {result.statusCode && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Status {result.statusCode}</span>
                  </>
                )}
              </div>
              
              {result.error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-sm text-rose-400">{result.error}</p>
                </div>
              )}

              {result.bodyPreview && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Response Preview:</p>
                  <pre className="p-3 rounded-lg bg-slate-900 text-xs text-slate-300 overflow-x-auto">
                    {result.bodyPreview}
                  </pre>
                </div>
              )}

              {result.headers && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Headers:</p>
                  <div className="p-3 rounded-lg bg-slate-900 text-xs">
                    {Object.entries(result.headers).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-amber-400">{key}:</span>
                        <span className="text-slate-300">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// NEW: Service Analytics Modal
function AnalyticsModal({ serviceName, onClose }: { serviceName: string; onClose: () => void }) {
  const { data: details, isLoading } = useServiceDetails(serviceName);
  const { data: health } = useEngineHealth();
  
  const service = health?.services.find(s => s.name === serviceName);

  // Prepare latency chart data
  const latencyChartData = useMemo(() => {
    if (!details?.latencyHistory?.length) return [];
    return details.latencyHistory.map((val, i) => ({
      index: i,
      latency: val,
    }));
  }, [details?.latencyHistory]);

  // Prepare status timeline data
  const statusTimelineData = useMemo(() => {
    if (!details?.statusHistory?.length) return [];
    return details.statusHistory.slice(-20).map((s: any) => ({
      time: format(new Date(s.timestamp), "HH:mm:ss"),
      status: s.status,
    }));
  }, [details?.statusHistory]);

  // Service alerts
  const serviceAlerts = details?.alerts?.filter((a: HealthAlert) => a.service === serviceName) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              service?.status === "online" ? "bg-emerald-500/10 border border-emerald-500/20" :
              service?.status === "degraded" ? "bg-amber-500/10 border border-amber-500/20" :
              "bg-rose-500/10 border border-rose-500/20"
            }`}>
              <BarChart3 className={`w-5 h-5 ${
                service?.status === "online" ? "text-emerald-400" :
                service?.status === "degraded" ? "text-amber-400" : "text-rose-400"
              }`} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-lg">{serviceName}</h2>
              <p className="text-xs text-slate-400">Service Analytics & Performance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">Current Latency</p>
                  <p className={`text-2xl font-bold ${
                    (service?.latencyMs || 0) < 100 ? "text-emerald-400" : 
                    (service?.latencyMs || 0) < 300 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {service?.latencyMs}ms
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">Average Latency</p>
                  <p className="text-2xl font-bold text-slate-200">{service?.avgLatencyMs}ms</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">24h Availability</p>
                  <p className={`text-2xl font-bold ${
                    (service?.availability24h || 0) > 99 ? "text-emerald-400" : 
                    (service?.availability24h || 0) > 95 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {service?.availability24h}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">Uptime</p>
                  <p className="text-2xl font-bold text-slate-200">{service?.uptimeFormatted || "N/A"}</p>
                </div>
              </div>

              {/* Latency History Chart */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  Latency History
                </h3>
                {latencyChartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={latencyChartData}>
                        <defs>
                          <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="index" tick={{ fill: "#64748b", fontSize: 10 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(val: number) => [`${val}ms`, "Latency"]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="latency" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fill="url(#latencyGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">No latency history available</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Timeline */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    Recent Status Changes
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {statusTimelineData.length > 0 ? (
                      statusTimelineData.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === "online" ? "bg-emerald-500" :
                            item.status === "degraded" ? "bg-amber-500" : "bg-rose-500"
                          }`} />
                          <span className="text-xs text-slate-400 w-16">{item.time}</span>
                          <span className={`text-sm font-medium capitalize ${
                            item.status === "online" ? "text-emerald-400" :
                            item.status === "degraded" ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4">No status changes recorded</p>
                    )}
                  </div>
                </div>

                {/* Service Alerts */}
                <div className="glass-card p-4">
                  <h3 className="font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-400" />
                    Service Alerts
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {serviceAlerts.length > 0 ? (
                      serviceAlerts.slice(0, 10).map((alert: HealthAlert) => {
                        const config = severityConfig[alert.severity];
                        const Icon = config.icon;
                        return (
                          <div 
                            key={alert.id}
                            className={`p-3 rounded-lg border ${config.bg} ${config.border} ${alert.resolved ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              <Icon className={`w-4 h-4 ${config.color} mt-0.5`} />
                              <div className="flex-1">
                                <p className="text-xs text-slate-300">{alert.message}</p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                  {alert.resolved && " • Resolved"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-center py-4">No alerts for this service</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endpoint Info */}
              <div className="glass-card p-4">
                <h3 className="font-semibold text-slate-100 mb-3">Endpoint Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">URL:</span>
                    <a 
                      href={service?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                    >
                      {service?.url}
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500">Last Checked:</span>
                    <span className="ml-2 text-slate-300">
                      {service?.lastChecked ? formatDistanceToNow(new Date(service.lastChecked), { addSuffix: true }) : "N/A"}
                    </span>
                  </div>
                  {service?.version && (
                    <div>
                      <span className="text-slate-500">Version:</span>
                      <span className="ml-2 text-slate-300">{service.version}</span>
                    </div>
                  )}
                  {service?.consecutiveFailures !== undefined && service.consecutiveFailures > 0 && (
                    <div>
                      <span className="text-slate-500">Consecutive Failures:</span>
                      <span className="ml-2 text-rose-400">{service.consecutiveFailures}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Main Page
export default function EnginePage() {
  const { data: health, isLoading, dataUpdatedAt, refetch, isFetching } = useEngineHealth();
  const { data: history } = useEngineHistory(24);
  const { data: alerts } = useEngineAlerts();
  const testMutation = useTestService();
  
  const [filter, setFilter] = useState<"all" | "online" | "degraded" | "offline">("all");
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [analyticsService, setAnalyticsService] = useState<string | null>(null);

  const healthData = health;
  const filteredServices = useMemo(() => {
    if (!healthData?.services) return [];
    if (filter === "all") return healthData.services;
    return healthData.services.filter(s => s.status === filter);
  }, [healthData?.services, filter]);

  const counts = useMemo(() => ({
    all: healthData?.services.length || 0,
    online: healthData?.services.filter(s => s.status === "online").length || 0,
    degraded: healthData?.services.filter(s => s.status === "degraded").length || 0,
    offline: healthData?.services.filter(s => s.status === "offline").length || 0,
  }), [healthData?.services]);

  const handleTest = async (serviceName: string) => {
    setTestingService(serviceName);
    setTestResult(null);
    try {
      const result = await testMutation.mutateAsync(serviceName);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: "Test failed" });
    }
  };

  const overallConfig = healthData ? overallStatusConfig[healthData.overallStatus] : null;
  const OverallIcon = overallConfig?.icon || Activity;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-400" />
            System Monitor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Production-grade service monitoring with real-time analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {healthData && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${overallConfig?.bg} ${overallConfig?.border}`}>
              <OverallIcon className={`w-5 h-5 ${overallConfig?.color}`} />
              <span className={`font-semibold ${overallConfig?.color}`}>
                {healthData.overallStatus.toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : healthData ? (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Services Online" value={`${counts.online}/${counts.all}`} icon={Wifi} color="green" trend={healthData.statistics.uptimePercentage} />
            <StatCard label="Avg Response" value={`${healthData.statistics.avgResponseTime}ms`} subtext={healthData.statistics.avgResponseTime < 100 ? "Excellent" : "Good"} icon={Zap} color="blue" />
            <StatCard label="Degraded" value={counts.degraded} icon={AlertTriangle} color="amber" />
            <StatCard label="Offline" value={counts.offline} icon={WifiOff} color="rose" />
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  healthData.database.status === "connected" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : healthData.database.status === "slow"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-100">{healthData.database.latencyMs}ms</p>
                  <p className="text-xs text-slate-500">Database</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LatencyTrendsChart data={history || []} />
            </div>
            <AlertsPanel alerts={alerts || []} />
          </div>

          {/* Services Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-slate-400" />
                Microservices
              </h2>
              <div className="flex p-1 bg-slate-800/50 rounded-xl">
                {(["all", "online", "degraded", "offline"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter === f ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)} 
                    <span className="ml-1 opacity-70">({counts[f]})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.name}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ServiceCard 
                      service={service} 
                      onTest={handleTest}
                      onAnalytics={setAnalyticsService}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {dataUpdatedAt && (
            <p className="text-xs text-slate-500 text-center pt-4 border-t border-slate-800">
              Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()} ({formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })})
            </p>
          )}
        </>
      ) : null}

      {/* Test Modal */}
      {testingService && (
        <TestModal 
          service={testingService} 
          result={testResult} 
          onClose={() => { setTestingService(null); setTestResult(null); }} 
        />
      )}

      {/* Analytics Modal */}
      {analyticsService && (
        <AnalyticsModal 
          serviceName={analyticsService} 
          onClose={() => setAnalyticsService(null)} 
        />
      )}
    </div>
  );
}
