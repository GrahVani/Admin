"use client";

import React, { useState } from "react";
import { useSubscriptions, usePlans } from "@/hooks/queries/useSubscriptions";
import Link from "next/link";
import { 
  CreditCard, Users, Clock, XCircle, Layers, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Calendar, ArrowUpRight, RefreshCw, Download,
  Info, HelpCircle, Lightbulb, Crown
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";
import { Tooltip, TooltipContent, TooltipIndicator } from "@/components/ui/Tooltip";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { format, formatDistanceToNow } from "date-fns";

// Real-time indicator
function RealtimeIndicator({ lastUpdated, isFetching }: { lastUpdated: Date; isFetching: boolean }) {
  const [now, setNow] = React.useState(new Date());
  
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = formatDistanceToNow(lastUpdated, { addSuffix: true });
  const isStale = now.getTime() - lastUpdated.getTime() > 5 * 60 * 1000;

  return (
    <Tooltip 
      content={`Last updated: ${lastUpdated.toLocaleTimeString()}. Data refreshes automatically.`}
      position="bottom"
      variant="info"
    >
      <div className={`flex items-center gap-2 text-xs cursor-help ${isStale ? "text-amber-400" : "text-slate-500"}`}>
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

// Status Badge with Tooltip - Improved Layout
function StatusBadge({ status, count }: { status: string; count: number }) {
  const config: Record<string, { color: string; bg: string; border: string; icon: any; tooltip: string }> = {
    active: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: CheckCircle,
      tooltip: "Active paying subscriptions with full platform access",
    },
    trialing: {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: Clock,
      tooltip: "Users currently in trial period",
    },
    past_due: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: AlertCircle,
      tooltip: "Subscriptions with failed payment - requires follow-up",
    },
    cancelled: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      icon: XCircle,
      tooltip: "Cancelled or expired subscriptions",
    },
  };

  const c = config[status] || config.cancelled;
  const Icon = c.icon;

  return (
    <Tooltip content={c.tooltip} position="top" variant={status === "past_due" ? "warning" : "default"}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 p-4 rounded-xl ${c.bg} ${c.border} border cursor-help h-full hover:scale-[1.02] transition-all`}
      >
        <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${c.color}`} />
        </div>
        <div className="flex-1">
          <p className={`text-2xl font-bold ${c.color}`}>{count}</p>
          <p className="text-xs text-slate-400 capitalize">{status.replace("_", " ")}</p>
        </div>
      </motion.div>
    </Tooltip>
  );
}

// Plan Card with Rich Tooltip
function PlanCard({ plan, index }: { plan: any; index: number }) {
  const tierColors: Record<string, string> = {
    basic: "from-slate-500/20 to-slate-600/10 border-slate-500/20",
    standard: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
    premium: "from-violet-500/20 to-violet-600/10 border-violet-500/20",
    enterprise: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
  };

  const tierColor = tierColors[plan.tier?.toLowerCase()] || tierColors.basic;

  return (
    <Tooltip
      content={
        <TooltipContent
          title={plan.name}
          description={`${plan.tier} tier plan with ${plan.intervalDays}-day billing cycle. Features include chart generation, client management, and reports.`}
          learnMore={{ text: "Configure plan", href: `/dashboard/subscriptions/plans/${plan.id}` }}
          variant="info"
        />
      }
      position="top"
      maxWidth={300}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-5 rounded-2xl bg-gradient-to-br ${tierColor} border cursor-help group overflow-hidden relative transition-all hover:scale-[1.02]`}
      >
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">{plan.name}</p>
            <Crown className="w-4 h-4 text-amber-400/50" />
          </div>
          
          <div className="flex items-baseline gap-1 mb-3">
            <p className="text-3xl font-bold text-amber-400">₹{plan.price}</p>
            {plan.intervalDays === 30 && (
              <span className="text-[10px] text-slate-400 font-bold uppercase">/Mo</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              {plan.tier}
            </span>
            <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-tighter">
              {plan.intervalDays} Days
            </span>
          </div>

          {plan.subscriberCount !== undefined && (
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Subscribers</span>
              <span className="text-sm font-semibold text-slate-300">{plan.subscriberCount || 0}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Tooltip>
  );
}

// Metric Card with Tooltip - Improved Layout
function MetricCard({ 
  label, 
  value, 
  trend, 
  trendDirection, 
  tooltip,
  icon: Icon,
  color = "blue"
}: { 
  label: string; 
  value: string | number; 
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  tooltip: string;
  icon: any;
  color?: "blue" | "green" | "amber" | "purple" | "rose";
}) {
  const colorClasses = {
    blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    green: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    purple: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  };

  const c = colorClasses[color];

  return (
    <Tooltip content={tooltip} position="top" variant="insight">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl ${c.bg} ${c.border} border cursor-help h-full hover:scale-[1.02] transition-all`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-slate-100">{value}</p>
              {trend !== undefined && trendDirection !== "neutral" && (
                <span className={`text-xs font-medium ${trendDirection === "up" ? "text-emerald-400" : "text-rose-400"}`}>
                  {trendDirection === "up" ? "+" : "-"}{trend}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{label}</p>
          </div>
        </div>
      </motion.div>
    </Tooltip>
  );
}

export default function SubscriptionsPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  const { 
    data: active, 
    isLoading: activeLoading,
    dataUpdatedAt: activeUpdatedAt,
    refetch: refetchActive,
    isFetching: isFetchingActive
  } = useSubscriptions({ status: "active" });
  
  const { 
    data: trialing, 
    isLoading: trialingLoading,
    refetch: refetchTrialing
  } = useSubscriptions({ status: "trialing" });
  
  const { 
    data: pastDue, 
    isLoading: pastDueLoading,
    refetch: refetchPastDue
  } = useSubscriptions({ status: "past_due" });
  
  const { 
    data: cancelled, 
    isLoading: cancelledLoading,
    refetch: refetchCancelled
  } = useSubscriptions({ status: "cancelled" });
  
  const { 
    data: plans = [], 
    isLoading: plansLoading,
    dataUpdatedAt: plansUpdatedAt,
    refetch: refetchPlans,
    isFetching: isFetchingPlans
  } = usePlans();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchActive(),
      refetchTrialing(),
      refetchPastDue(),
      refetchCancelled(),
      refetchPlans(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const isLoading = activeLoading || trialingLoading || pastDueLoading || cancelledLoading || plansLoading;
  const isFetching = isFetchingActive || isFetchingPlans;
  const lastUpdated = activeUpdatedAt || plansUpdatedAt;

  // Calculate metrics
  const totalSubscribers = (active?.pagination?.total || 0) + (trialing?.pagination?.total || 0);
  const totalRevenue = plans.reduce((sum: number, plan: any) => sum + (plan.revenue || 0), 0);
  const conversionRate = totalSubscribers > 0 
    ? ((active?.pagination?.total || 0) / totalSubscribers * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            Subscriptions
            <Tooltip 
              content="Manage subscription lifecycle, billing, and plan configuration"
              variant="info"
            >
              <TooltipIndicator variant="info" />
            </Tooltip>
          </div>
        }
        description="Platform-wide subscription lifecycle & plan management"
        actions={
          <div className="flex items-center gap-3">
            <Tooltip content="Manage all subscription plans and pricing tiers" position="bottom">
              <Link
                href="/dashboard/subscriptions/plans"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm text-slate-300 transition-colors font-medium"
              >
                <Layers className="w-4 h-4" />
                Manage Plan Matrix
              </Link>
            </Tooltip>
            
            <Tooltip content="View complete subscriber list with filters" position="bottom">
              <Link
                href="/dashboard/subscriptions/list"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-colors"
              >
                <Users className="w-4 h-4" />
                View All Subscribers
              </Link>
            </Tooltip>

            <Tooltip content="Refresh all subscription data" position="bottom">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                isLoading={isRefreshing}
                leftIcon={RefreshCw}
              >
                Refresh
              </Button>
            </Tooltip>

            {lastUpdated && (
              <RealtimeIndicator 
                lastUpdated={new Date(lastUpdated)} 
                isFetching={isFetching} 
              />
            )}
          </div>
        }
      />

      {/* Status Overview - Tighter gaps */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="h-full">
              <StatusBadge status="active" count={active?.pagination?.total ?? 0} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
              <StatusBadge status="trialing" count={trialing?.pagination?.total ?? 0} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
              <StatusBadge status="past_due" count={pastDue?.pagination?.total ?? 0} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full">
              <StatusBadge status="cancelled" count={cancelled?.pagination?.total ?? 0} />
            </motion.div>
          </>
        )}
      </div>

      {/* Key Metrics - Tighter gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="h-full">
          <MetricCard
            label="Total Subscribers"
            value={totalSubscribers}
            tooltip="Combined active subscribers and trial users"
            icon={Users}
            color="blue"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
          <MetricCard
            label="Conversion Rate"
            value={`${conversionRate}%`}
            tooltip="Percentage of trial users who converted to paid"
            icon={TrendingUp}
            color="green"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
          <MetricCard
            label="Monthly Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            tooltip="Estimated monthly recurring revenue from all plans"
            icon={CreditCard}
            color="amber"
          />
        </motion.div>
      </div>

      {/* Plans Overview */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              Configured Plan Tiers ({plans.length})
            </h2>
            <Tooltip 
              content="Available subscription plans that users can choose from"
              variant="info"
            >
              <TooltipIndicator variant="info" />
            </Tooltip>
          </div>
          <Tooltip content="Detailed plan configuration and settings" position="left">
            <Link 
              href="/dashboard/subscriptions/plans" 
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest flex items-center gap-1"
            >
              Detailed Config
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Tooltip>
        </div>

        {plans.length === 0 ? (
          <EmptyState 
            title="No subscription plans" 
            description="Create your first plan to start accepting subscriptions"
            action={
              <Link
                href="/dashboard/subscriptions/plans/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm"
              >
                <Layers className="w-4 h-4" />
                Create Plan
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {plans.map((plan: any, index: number) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions & Help - Tighter gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Quick Tips</h3>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Past due accounts should be followed up within 3 days to prevent churn</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Trial users convert best when contacted within first 7 days</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>Consider offering annual plans for 15-20% discount to improve retention</span>
            </li>
          </ul>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Need Help?</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Learn about subscription management best practices and billing configurations.
          </p>
          <div className="flex gap-2">
            <Tooltip content="View documentation for subscription management" position="bottom">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
              >
                <Info className="w-4 h-4" />
                Documentation
              </a>
            </Tooltip>
            <Tooltip content="Contact support for billing issues" position="bottom">
              <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                Support
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
