import { useQuery } from "@tanstack/react-query";
import { adminApiFetch, adminApiFetchCSV } from "@/lib/api";

export interface AnalyticsSummary {
  totalUsers: number;
  newUsersThisPeriod: number;
  activeUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: number;
  revenueThisPeriod: number;
  averageRevenuePerUser: number;
  churnRate: number;
  retentionRate: number;
}

export interface AnalyticsTrends {
  userGrowth: number;
  revenueGrowth: number;
  subscriptionGrowth: number;
}

export interface DailyBreakdown {
  date: string;
  newUsers: number;
  newSubscriptions: number;
  revenue: number;
}

export interface PlanBreakdown {
  name: string;
  tier: string;
  count: number;
}

export interface StatusBreakdown {
  status: string;
  count: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  joinedAt: string;
}

export interface TopPlan {
  name: string;
  tier: string;
  revenue: number;
  subscribers: number;
}

export interface ChurnAnalysis {
  cancelled: number;
  total: number;
  rate: number;
}

export interface EngagementMetrics {
  averageSessionTime: number;
  pagesPerSession: number;
  bounceRate: number;
  returnRate: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  trends: AnalyticsTrends;
  breakdown: {
    daily: DailyBreakdown[];
    byPlan: PlanBreakdown[];
    byStatus: StatusBreakdown[];
  };
  topPerformers: {
    astrologers: TopPerformer[];
    plans: TopPlan[];
  };
  churnAnalysis: ChurnAnalysis;
  engagement: EngagementMetrics;
}

export function useAnalytics(period: number = 30) {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const res = await adminApiFetch(`/api/v1/admin/analytics?period=${period}`);
      return res?.data;
    },
    refetchInterval: 60000, // 1 minute
  });
}

export function useAnalyticsSummary() {
  return useQuery<{ summary: AnalyticsSummary; trends: AnalyticsTrends }>({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const res = await adminApiFetch("/api/v1/admin/analytics/summary");
      return res?.data;
    },
    refetchInterval: 30000, // 30 seconds
  });
}

export function useAnalyticsRealtime() {
  return useQuery({
    queryKey: ["analytics-realtime"],
    queryFn: async () => {
      const res = await adminApiFetch("/api/v1/admin/analytics/realtime");
      return res?.data;
    },
    refetchInterval: 30000, // 30 seconds
  });
}

export async function exportAnalyticsReport(type: string, period: number): Promise<Blob> {
  return adminApiFetchCSV(`/api/v1/admin/analytics/export?type=${type}&period=${period}`);
}
