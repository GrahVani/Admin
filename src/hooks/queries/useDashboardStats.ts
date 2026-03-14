import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useDashboardStats() {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => adminApiFetch("/api/v1/admin/dashboard/stats"),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    select: (res) => res?.data,
  });
}

export function useDashboardGrowth(days = 30) {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["dashboard-growth", days],
    queryFn: () => adminApiFetch(`/api/v1/admin/dashboard/growth?days=${days}`),
    enabled: isAuthenticated,
    select: (res) => res?.data ?? [],
  });
}

// Re-export from useAnalytics for convenience
export { useAnalytics, useAnalyticsSummary, useAnalyticsRealtime } from "./useAnalytics";
export type { AnalyticsData, AnalyticsSummary } from "./useAnalytics";
