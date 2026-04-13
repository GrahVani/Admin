"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown, Info } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { Skeleton } from "./Skeleton";
import { Tooltip } from "./Tooltip";

interface KPICardProps {
  label: string;
  value: string | number;
  rawValue?: number;
  icon: LucideIcon;
  trend?: number;
  trendData?: number[];
  description?: string;
  tooltip?: string;
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
  tooltip,
  loading,
  color = "accent",
  onClick,
  compact = false,
}: KPICardProps) {
  const colors = colorMap[color];
  const trendPositive = trend !== undefined && trend >= 0;
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown;
  const trendColor = trendPositive ? "text-emerald-400" : "text-red-400";

  const cardContent = (
    <motion.div
      className={`relative p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 overflow-hidden h-full flex flex-col ${
        onClick ? "cursor-pointer hover:border-slate-500" : "hover:border-slate-600/50"
      } ${tooltip ? "cursor-help" : ""}`}
      whileHover={onClick ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg} ${colors.border} border`}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>

          <div className="flex flex-col items-end gap-2">
            {trend !== undefined && (
              <Tooltip content={`${trendPositive ? "+" : ""}${trend}% change from previous period`} position="top">
                <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor} cursor-help px-2 py-1 rounded-lg bg-slate-900/50`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span>{Math.abs(trend)}%</span>
                </div>
              </Tooltip>
            )}
            {trendData && trendData.length > 0 && (
              <Tooltip content="7-day trend" position="top">
                <div className="cursor-help">
                  <Sparkline
                    data={trendData}
                    width={70}
                    height={24}
                    color={colors.chart}
                  />
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Value */}
        <div className="flex-1 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
            {value}
          </h3>

          {/* Label & Description */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {label}
            </p>
            {tooltip && (
              <Tooltip content={tooltip} position="right">
                <Info className="w-3.5 h-3.5 text-slate-600 cursor-help hover:text-slate-400 transition-colors" />
              </Tooltip>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="top">
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}

// Compact KPI for smaller spaces
interface KPICardCompactProps {
  label: string;
  value: string | number;
  trend?: number;
  tooltip?: string;
  loading?: boolean;
}

export function KPICardCompact({ label, value, trend, tooltip, loading }: KPICardCompactProps) {
  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
        <Skeleton variant="text" width={60} height={12} className="mb-2" />
        <Skeleton variant="text" width={80} height={24} />
      </div>
    );
  }

  const trendPositive = trend !== undefined && trend >= 0;
  const trendColor = trendPositive ? "text-emerald-400" : "text-red-400";

  const content = (
    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
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

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="top">
        <div className="cursor-help">{content}</div>
      </Tooltip>
    );
  }

  return content;
}

export default KPICard;
