import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApiFetch, adminApiFetchPost } from "@/lib/api";

export interface ServiceHealth {
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

export interface HealthAlert {
  id: string;
  service: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface HealthData {
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

// Current health status
export function useEngineHealth() {
  return useQuery({
    queryKey: ["engine-health"],
    queryFn: () => adminApiFetch("/api/v1/admin/engine/health"),
    refetchInterval: 10_000,
    select: (res) => res?.data as HealthData,
  });
}

// Health summary (lightweight)
export function useEngineHealthSummary() {
  return useQuery({
    queryKey: ["engine-health-summary"],
    queryFn: () => adminApiFetch("/api/v1/admin/engine/health/summary"),
    refetchInterval: 30_000,
    select: (res) => res?.data,
  });
}

// Historical data for charts
export function useEngineHistory(hours = 24) {
  return useQuery({
    queryKey: ["engine-history", hours],
    queryFn: () => adminApiFetch(`/api/v1/admin/engine/health/history?hours=${hours}`),
    select: (res) => res?.data as any[],
  });
}

// Alerts
export function useEngineAlerts(includeResolved = false) {
  return useQuery({
    queryKey: ["engine-alerts", includeResolved],
    queryFn: () => adminApiFetch(`/api/v1/admin/engine/health/alerts?resolved=${includeResolved}`),
    refetchInterval: 30_000,
    select: (res) => res?.data as HealthAlert[],
  });
}

// Service details
export function useServiceDetails(serviceName: string) {
  return useQuery({
    queryKey: ["engine-service-details", serviceName],
    queryFn: () => adminApiFetch(`/api/v1/admin/engine/health/services/${encodeURIComponent(serviceName)}`),
    enabled: !!serviceName,
    select: (res) => res?.data,
  });
}

// Test endpoint mutation
export function useTestService() {
  return useMutation({
    mutationFn: (serviceName: string) => 
      adminApiFetchPost(`/api/v1/admin/engine/health/services/${encodeURIComponent(serviceName)}/test`, {}),
  });
}
