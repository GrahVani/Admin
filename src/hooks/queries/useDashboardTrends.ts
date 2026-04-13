"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useMemo } from "react";
import { subDays, startOfDay } from "date-fns";

interface TrendData {
  current: number;
  previous: number;
  trend: number; // percentage change
  trendDirection: "up" | "down" | "neutral";
}

interface DashboardTrends {
  users: TrendData;
  clients: TrendData;
  subscriptions: TrendData;
  revenue: TrendData;
  isLoading: boolean;
}

/**
 * Calculate trend percentage between current and previous periods
 */
function calculateTrend(current: number, previous: number): TrendData {
  if (previous === 0) {
    return {
      current,
      previous,
      trend: current > 0 ? 100 : 0,
      trendDirection: current > 0 ? "up" : "neutral",
    };
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10; // Round to 1 decimal

  return {
    current,
    previous,
    trend: Math.abs(rounded),
    trendDirection: rounded > 0 ? "up" : rounded < 0 ? "down" : "neutral",
  };
}

/**
 * Hook to fetch dynamic trends for dashboard stats
 * Compares current period (default 7 days) with previous period
 */
export function useDashboardTrends(days: number = 7): DashboardTrends {
  const { isAuthenticated } = useAdminAuth();

  // Fetch stats for current and previous periods
  const { data: currentStats, isLoading: currentLoading } = useQuery({
    queryKey: ["dashboard-stats-current", days],
    queryFn: async () => {
      const endDate = new Date().toISOString();
      const startDate = subDays(new Date(), days).toISOString();
      const res = await adminApiFetch(
        `/api/v1/admin/dashboard/stats?startDate=${startDate}&endDate=${endDate}`
      );
      return res?.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: previousStats, isLoading: previousLoading } = useQuery({
    queryKey: ["dashboard-stats-previous", days],
    queryFn: async () => {
      const endDate = subDays(new Date(), days).toISOString();
      const startDate = subDays(new Date(), days * 2).toISOString();
      const res = await adminApiFetch(
        `/api/v1/admin/dashboard/stats?startDate=${startDate}&endDate=${endDate}`
      );
      return res?.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate trends
  const trends = useMemo(() => {
    const currentKpis = currentStats?.kpis || {};
    const previousKpis = previousStats?.kpis || {};

    return {
      users: calculateTrend(
        currentKpis.totalAstrologers || 0,
        previousKpis.totalAstrologers || 0
      ),
      clients: calculateTrend(
        currentKpis.totalClients || 0,
        previousKpis.totalClients || 0
      ),
      subscriptions: calculateTrend(
        currentKpis.activeSubscriptions || 0,
        previousKpis.activeSubscriptions || 0
      ),
      revenue: calculateTrend(
        currentKpis.totalRevenue || 0,
        previousKpis.totalRevenue || 0
      ),
      isLoading: currentLoading || previousLoading,
    };
  }, [currentStats, previousStats, currentLoading, previousLoading]);

  return trends;
}

/**
 * Hook to fetch user-specific trends
 */
export function useUserTrends(days: number = 7) {
  const { isAuthenticated } = useAdminAuth();

  const { data: userStats, isLoading } = useQuery({
    queryKey: ["user-trends", days],
    queryFn: async () => {
      const now = new Date();
      const currentStart = subDays(now, days);
      const previousStart = subDays(now, days * 2);

      const [currentRes, previousRes] = await Promise.all([
        adminApiFetch(
          `/api/v1/admin/users/stats?startDate=${currentStart.toISOString()}&endDate=${now.toISOString()}`
        ),
        adminApiFetch(
          `/api/v1/admin/users/stats?startDate=${previousStart.toISOString()}&endDate=${currentStart.toISOString()}`
        ),
      ]);

      return {
        current: currentRes?.data || {},
        previous: previousRes?.data || {},
      };
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    const current = userStats?.current || {};
    const previous = userStats?.previous || {};

    return {
      total: calculateTrend(current.totalUsers || 0, previous.totalUsers || 0),
      active: calculateTrend(current.activeUsers || 0, previous.activeUsers || 0),
      verified: calculateTrend(current.verifiedUsers || 0, previous.verifiedUsers || 0),
      pending: calculateTrend(current.pendingVerifications || 0, previous.pendingVerifications || 0),
      isLoading,
    };
  }, [userStats, isLoading]);
}

/**
 * Hook to fetch client-specific trends
 */
export function useClientTrends(days: number = 7) {
  const { isAuthenticated } = useAdminAuth();

  const { data: clientStats, isLoading } = useQuery({
    queryKey: ["client-trends", days],
    queryFn: async () => {
      const now = new Date();
      const currentStart = subDays(now, days);
      const previousStart = subDays(now, days * 2);

      const [currentRes, previousRes] = await Promise.all([
        adminApiFetch(
          `/api/v1/admin/clients/stats?startDate=${currentStart.toISOString()}&endDate=${now.toISOString()}`
        ),
        adminApiFetch(
          `/api/v1/admin/clients/stats?startDate=${previousStart.toISOString()}&endDate=${currentStart.toISOString()}`
        ),
      ]);

      return {
        current: currentRes?.data || {},
        previous: previousRes?.data || {},
      };
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    const current = clientStats?.current || {};
    const previous = clientStats?.previous || {};

    return {
      total: calculateTrend(
        current.totalClients || 0,
        previous.totalClients || 0
      ),
      newThisMonth: calculateTrend(
        current.newClientsThisMonth || 0,
        previous.newClientsThisMonth || 0
      ),
      isLoading,
    };
  }, [clientStats, isLoading]);
}

export default useDashboardTrends;
