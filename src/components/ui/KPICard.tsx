"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { Skeleton } from "./Skeleton";

interface KPICardProps {
  label: string;
  value: string | number;
  rawValue?: number;
  icon: LucideIcon;
  trend?: number;
  trendData?: number[];
  description?: string;
  loading?: boolean;
  color?: "accent" | "purple" | "success" | "danger" | "info" | "warning" | "cyan" | "pink";
  onClick?: () => void;
  compact?: boolean;
}

const colorMap = {
  accent: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500/20 to-amber-500/5",
    chart: "#d4a843",
  },
  purple: {
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    gradient: "from-violet-500/20 to-violet-500/5",
    chart: "#8b5cf6",
  },
  success: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    chart: "#10b981",
  },
  danger: {
    text: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    gradient: "from-red-500/20 to-red-500/5",
    chart: "#ef4444",
  },
  info: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    gradient: "from-blue-500/20 to-blue-500/5",
    chart: "#3b82f6",
  },
  warning: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500/20 to-amber-500/5",
    chart: "#f59e0b",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    chart: "#06b6d4",
  },
  pink: {
    text: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    gradient: "from-pink-500/20 to-pink-500/5",
    chart: "#ec4899",
  },
};

export function KPICard({
  label,
  value,
  rawValue,
  icon: Icon,
  trend,
  trendData,
  description,
  loading,
  color = "accent",
  onClick,
  compact = false,
}: KPICardProps) {
  const colors = colorMap[color];
  const trendPositive = trend !== undefined && trend >= 0;
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown;
  const trendColor = trendPositive ? "text-emerald-400" : "text-red-400";

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-start justify-between mb-3">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={50} height={16} />
        </div>
        <Skeleton variant="text" width={80} height={24} className="mb-1" />
        <Skeleton variant="text" width={120} height={14} />
      </div>
    );
  }

  return (
    <motion.div
      className={`relative p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 overflow-hidden group cursor-default ${
        onClick ? "cursor-pointer hover:border-slate-600" : "hover:border-slate-600/50"
      }`}
      whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.border} border`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>

          <div className="flex flex-col items-end gap-1">
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
            {trendData && trendData.length > 0 && (
              <Sparkline
                data={trendData}
                width={70}
                height={24}
                color={colors.chart}
              />
            )}
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
            {value}
          </h3>
        </div>

        {/* Label & Description */}
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">
          {label}
        </p>
        {description && (
          <p className="text-xs text-slate-600 mt-0.5">{description}</p>
        )}

        {/* Progress bar */}
        {trend !== undefined && (
          <div className="mt-3 h-1 rounded-full bg-slate-700 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${colors.text.replace("text-", "bg-")}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, 50 + Math.abs(trend || 0))}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Compact KPI for smaller spaces
interface KPICardCompactProps {
  label: string;
  value: string | number;
  trend?: number;
  loading?: boolean;
}

export function KPICardCompact({ label, value, trend, loading }: KPICardCompactProps) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <Skeleton variant="text" width={60} height={12} className="mb-2" />
        <Skeleton variant="text" width={80} height={24} />
      </div>
    );
  }

  const trendPositive = trend !== undefined && trend >= 0;
  const trendColor = trendPositive ? "text-emerald-400" : "text-red-400";

  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-slate-100">{value}</span>
        {trend !== undefined && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trendPositive ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  );
}
