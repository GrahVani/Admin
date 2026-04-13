"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminApiFetch } from "@/lib/api";
import {
  Users, CreditCard, Globe, Wallet,
  ChevronRight, AlertTriangle, RefreshCw, BarChart3, PieChart,
  Clock, Zap, Cpu, Sparkles, ArrowUpRight,
  Activity, TrendingUp, TrendingDown, Info,
  Wifi, WifiOff, LayoutDashboard
} from "lucide-react";
import { useEngineHealth } from "@/hooks/queries/useEngineHealth";
import { useDashboardTrends } from "@/hooks/queries/useDashboardTrends";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

import { KPICard } from "@/components/ui/KPICard";
import { Tooltip, TooltipIndicator } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

// Colors for charts
const CHART_COLORS = {
  gold: "#d4a843",
  purple: "#8b5cf6",
  success: "#10b981",
  info: "#3b82f6",
  danger: "#ef4444",
  warning: "#f59e0b",
  slate: "#64748b",
};

const PIE_COLORS = ["#d4a843", "#8b5cf6", "#10b981", "#3b82f6", "#64748b", "#f59e0b"];

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    online: "bg-emerald-500",
    degraded: "bg-amber-500",
    offline: "bg-red-500",
  };
  return (
    <motion.span
      className={`w-2 h-2 rounded-full ${colors[status] || colors.offline}`}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

function TrendIndicator({ value }: { value: number }) {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(value)}%
    </span>
  );
}

// Real-time indicator component
function RealtimeIndicator({ lastUpdated, isFetching }: { lastUpdated: Date; isFetching: boolean }) {
  const [now, setNow] = React.useState(new Date());
  
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = formatDistanceToNow(lastUpdated, { addSuffix: true });
  const isStale = now.getTime() - lastUpdated.getTime() > 5 * 60 * 1000;

  return (
    <Tooltip content={`Last updated: ${lastUpdated.toLocaleTimeString()}`} position="bottom">
      <div className={`flex items-center gap-2 text-xs ${isStale ? "text-amber-400" : "text-slate-500"} cursor-help`}>
        {isFetching ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${isStale ? "bg-amber-400" : "bg-emerald-400"}`} />
        )}
        <span>{isFetching ? "Updating..." : timeAgo}</span>
      </div>
    </Tooltip>
  );
}

// Secondary Stat Card Component
function StatCard({ label, value, icon: Icon, color, trend, tooltip }: any) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
    <Tooltip content={tooltip} position="top">
      <motion.div
        className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-help h-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorClasses[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-slate-100">{value}</p>
              {trend !== undefined && <TrendIndicator value={trend} />}
            </div>
            <p className="text-xs text-slate-500 truncate">{label}</p>
          </div>
        </div>
      </motion.div>
    </Tooltip>
  );
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dynamic trends
  const { 
    users: userTrend, 
    clients: clientTrend, 
    subscriptions: subscriptionTrend, 
    revenue: revenueTrend,
    isLoading: trendsLoading 
  } = useDashboardTrends(selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90);

  const { data: stats, isLoading, isError, refetch, dataUpdatedAt, isFetching } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => adminApiFetch("/api/v1/admin/dashboard/stats"),
    refetchInterval: 60_000,
    select: (r) => r?.data,
  });

  const { data: growthData = [], isLoading: growthLoading } = useQuery({
    queryKey: ["dashboard-growth", selectedPeriod],
    queryFn: () => adminApiFetch(`/api/v1/admin/dashboard/growth?days=${selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : 90}`),
    select: (r) => r?.data ?? [],
  });

  const { data: health, isLoading: healthLoading } = useEngineHealth();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Extract data with fallbacks
  const kpis = stats?.kpis || {};
  const planDistribution = stats?.planDistribution || [];
  const recentActivity = stats?.recentActivity || [];
  const recentSubscriptions = stats?.recentSubscriptions || [];
  const dailyStats = stats?.dailyStats || [];

  // Calculate sparkline data from daily stats (real data from backend)
  const userSparkline = dailyStats.map((d: any) => d.users);
  const subscriptionSparkline = dailyStats.map((d: any) => d.subscriptions);
  const revenueSparkline = dailyStats.map((d: any) => d.revenue);

  const mainKPIs = [
    { 
      label: "Total Revenue", 
      value: `₹${(kpis.totalRevenue || 0).toLocaleString()}`, 
      rawValue: kpis.totalRevenue || 0,
      icon: Wallet, 
      trend: revenueTrend?.trendDirection === "up" ? revenueTrend.trend : revenueTrend?.trendDirection === "down" ? -revenueTrend.trend : 0,
      trendData: revenueSparkline.length > 0 ? revenueSparkline : [0, 0, 0, 0, 0, 0, 0],
      color: "accent" as const, 
      description: "Lifetime revenue",
      tooltip: "Total revenue generated since platform launch"
    },
    { 
      label: "Users", 
      value: (kpis.totalAstrologers || 0).toLocaleString(), 
      rawValue: kpis.totalAstrologers || 0,
      icon: Users, 
      trend: userTrend?.trendDirection === "up" ? userTrend.trend : userTrend?.trendDirection === "down" ? -userTrend.trend : 0,
      trendData: userSparkline.length > 0 ? userSparkline : [0, 0, 0, 0, 0, 0, 0],
      color: "purple" as const, 
      description: "Astrologers",
      tooltip: "Total registered astrologers on the platform"
    },
    { 
      label: "Clients", 
      value: (kpis.totalClients || 0).toLocaleString(), 
      rawValue: kpis.totalClients || 0,
      icon: Globe, 
      trend: clientTrend?.trendDirection === "up" ? clientTrend.trend : clientTrend?.trendDirection === "down" ? -clientTrend.trend : 0,
      trendData: userSparkline.length > 0 ? userSparkline : [0, 0, 0, 0, 0, 0, 0],
      color: "cyan" as const, 
      description: "Total clients",
      tooltip: "Total clients across all astrologers"
    },
    { 
      label: "Active Subscriptions", 
      value: (kpis.activeSubscriptions || 0).toLocaleString(), 
      rawValue: kpis.activeSubscriptions || 0,
      icon: CreditCard, 
      trend: subscriptionTrend?.trendDirection === "up" ? subscriptionTrend.trend : subscriptionTrend?.trendDirection === "down" ? -subscriptionTrend.trend : 0,
      trendData: subscriptionSparkline.length > 0 ? subscriptionSparkline : [0, 0, 0, 0, 0, 0, 0],
      color: "success" as const, 
      description: "Paying customers",
      tooltip: "Currently active paying subscriptions"
    },
  ];

  const secondaryStats = [
    { 
      label: "New This Week", 
      value: kpis.newSubscriptionsThisWeek || 0, 
      icon: Activity, 
      color: "info",
      trend: 12,
      tooltip: "New subscriptions in the last 7 days"
    },
    { 
      label: "Pending Verification", 
      value: kpis.pendingVerifications || 0, 
      icon: Clock, 
      color: "warning",
      tooltip: "Astrologers awaiting email verification"
    },
    { 
      label: "Open Tickets", 
      value: kpis.openTickets || 0, 
      icon: Zap, 
      color: "danger",
      tooltip: "Open support tickets requiring attention"
    },
    { 
      label: "Total Plans", 
      value: kpis.totalPlans || 0, 
      icon: Sparkles, 
      color: "purple",
      tooltip: "Available subscription plans"
    },
  ];

  const planData = planDistribution.map((plan: any, i: number) => ({
    name: plan.planName,
    value: plan.subscribers,
    color: PIE_COLORS[i % PIE_COLORS.length],
    tier: plan.tier,
    price: plan.price,
  }));

  return (
    <PageTransition className="space-y-6">
      {/* Error Alert */}
      {isError && (
        <motion.div
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Connection Error</p>
            <p className="opacity-80">Failed to fetch platform metrics. Data may be stale.</p>
          </div>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
              <p className="text-sm text-slate-400">
                Platform overview & insights
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Tooltip content="Select time period for analytics" position="bottom">
            <div className="flex p-1 bg-slate-800/50 border border-slate-700 rounded-lg">
              {(["7d", "30d", "90d"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedPeriod === period
                      ? "bg-amber-500 text-slate-900"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {period === "7d" ? "7D" : period === "30d" ? "30D" : "90D"}
                </button>
              ))}
            </div>
          </Tooltip>
          
          <Tooltip content="Refresh dashboard data" position="bottom">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              isLoading={refreshing}
              leftIcon={RefreshCw}
            >
              Refresh
            </Button>
          </Tooltip>

          {dataUpdatedAt && (
            <RealtimeIndicator 
              lastUpdated={new Date(dataUpdatedAt)} 
              isFetching={isFetching} 
            />
          )}
        </div>
      </div>

      {/* Main KPI Cards - Tighter grid with more width */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {mainKPIs.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="min-w-0"
            >
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Secondary Stats Row - Tighter gaps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {secondaryStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid - Tighter gaps */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
        {/* Growth Chart - Takes 2 columns */}
        <motion.div
          className="xl:col-span-2 glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Growth Analytics</h2>
                <p className="text-xs text-slate-500">
                  Subscriptions and user growth over time
                </p>
              </div>
            </div>
            <Tooltip content="Open detailed analytics with full reports" position="left">
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 font-medium"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Tooltip>
          </div>

          <div className="h-[280px]">
            {growthLoading ? (
              <Skeleton className="h-full rounded-xl" />
            ) : growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => format(new Date(value), "MMM dd")}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                    labelStyle={{ color: "#e2e8f0", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={CHART_COLORS.purple}
                    fill="url(#cumulativeGradient)"
                    strokeWidth={2}
                    name="Total Subscriptions"
                  />
                  <Area
                    type="monotone"
                    dataKey="newSubscriptions"
                    stroke={CHART_COLORS.gold}
                    fill="url(#growthGradient)"
                    strokeWidth={2}
                    name="New Subscriptions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No growth data available" description="Data will appear as users subscribe" />
            )}
          </div>
        </motion.div>

        {/* Right Column - Plan Distribution & Health */}
        <div className="space-y-5">
          {/* Plan Distribution */}
          <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-base font-semibold text-slate-100">Plan Distribution</h2>
              </div>
              <Tooltip content="Active subscribers by plan" position="left">
                <Info className="w-4 h-4 text-slate-500 cursor-help" />
              </Tooltip>
            </div>
            
            {planData.length > 0 ? (
              <div className="space-y-3">
                {planData.map((plan: any, i: number) => {
                  const total = planData.reduce((acc: number, p: any) => acc + p.value, 0) || 1;
                  const pct = Math.round((plan.value / total) * 100);
                  
                  return (
                    <Tooltip 
                      key={i} 
                      content={`${plan.name} - ${plan.tier} tier at ₹${plan.price}`}
                      position="left"
                    >
                      <div className="group cursor-help">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: plan.color }}
                            />
                            <span className="text-slate-300 font-medium capitalize">{plan.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-200 font-semibold">{plan.value}</span>
                            <span className="text-slate-500 text-xs ml-1">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: plan.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                title="No plans" 
                description="Create subscription plans to see distribution"
                className="py-8"
              />
            )}
          </motion.div>

          {/* System Health Compact */}
          <motion.div
            className="glass-card p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-base font-semibold text-slate-100">System Health</h2>
              </div>
              <Tooltip content={`Overall system status based on ${health?.services?.length || 0} services`} position="left">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full cursor-help ${
                  health?.overallStatus === "healthy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : health?.overallStatus === "degraded"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {health?.overallStatus?.toUpperCase() || "CHECKING"}
                </span>
              </Tooltip>
            </div>

            <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin">
              {health?.services?.map((svc: any, i: number) => (
                <Tooltip 
                  key={svc.name}
                  content={`${svc.name} - ${svc.status} (${svc.latencyMs}ms)`}
                  position="left"
                >
                  <div
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-help"
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot status={svc.status} />
                      <span className="text-sm text-slate-300">{svc.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{svc.latencyMs}ms</span>
                  </div>
                </Tooltip>
              )) || [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-lg" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - Tighter gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Recent Subscriptions */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-100">Recent Subscriptions</h2>
            </div>
            <Tooltip content="View all subscriptions with full details" position="left">
              <Link
                href="/dashboard/subscriptions"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </Tooltip>
          </div>

          {recentSubscriptions.length > 0 ? (
            <div className="space-y-2">
              {recentSubscriptions.slice(0, 5).map((sub: any, i: number) => (
                <Tooltip 
                  key={sub.id}
                  content={`Subscription: ${sub.planName} - ₹${sub.amount}`}
                  position="right"
                >
                  <motion.div
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-help"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-amber-400">
                          {(sub.userName || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{sub.userName || "Unknown"}</p>
                        <p className="text-xs text-slate-500">{sub.planName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-400">₹{sub.amount}</p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No recent subscriptions" 
              description="New subscriptions will appear here"
              className="py-8"
            />
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="glass-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-100">Recent Activity</h2>
            </div>
            <Tooltip content="View complete audit log history" position="left">
              <Link
                href="/dashboard/audit-log"
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </Tooltip>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-thin">
              {recentActivity.slice(0, 6).map((log: any, i: number) => (
                <Tooltip 
                  key={log.id || i}
                  content={`Action: ${log.action} - ${new Date(log.createdAt).toLocaleString()}`}
                  position="right"
                >
                  <motion.div
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-help"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-400">
                        {(log.adminName || log.adminEmail || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">
                        <span className="font-medium">{log.adminName || log.adminEmail}</span>
                        <span className="text-slate-500"> {log.action?.replace(/_/g, " ").toLowerCase()}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                </Tooltip>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No recent activity" 
              description="Admin actions will appear here"
              className="py-8"
            />
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}
