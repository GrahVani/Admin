"use client";

import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // percentage
  description?: string;
  loading?: boolean;
  color?: "accent" | "purple" | "success" | "danger" | "info" | "warning";
}

export function KPICard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  loading,
  color = "accent" 
}: KPICardProps) {
  const colorMap = {
    accent: "text-admin-accent bg-admin-accent/10 border-admin-accent/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    success: "text-admin-success bg-admin-success/10 border-admin-success/20",
    danger: "text-admin-danger bg-admin-danger/10 border-admin-danger/20",
    info: "text-admin-info bg-admin-info/10 border-admin-info/20",
    warning: "text-admin-warning bg-admin-warning/10 border-admin-warning/20",
  };

  const trendColor = trend && trend >= 0 ? "text-admin-success" : "text-admin-danger";

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-admin-elevated" />
          <div className="w-16 h-4 bg-admin-elevated rounded" />
        </div>
        <div className="w-24 h-8 bg-admin-elevated rounded mb-2" />
        <div className="w-full h-3 bg-admin-elevated rounded opacity-50" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 group hover:border-admin-accent/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trendColor}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="text-xs font-bold text-admin-text-muted uppercase tracking-widest mb-1 group-hover:text-admin-text-secondary transition-colors">
        {label}
      </p>
      
      <div className="flex items-end gap-2">
        <h3 className="text-3xl font-bold text-admin-text tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {value}
        </h3>
        {description && (
          <span className="text-[10px] text-admin-text-muted mb-1.5 font-medium italic">
            {description}
          </span>
        )}
      </div>

      {/* Subtle Progress Bar logic could go here if needed */}
      <div className="mt-4 w-full h-1 rounded-full bg-admin-elevated/40 overflow-hidden">
        <div className={`h-full opacity-60 transition-all duration-1000 ${color === 'accent' ? 'bg-admin-accent' : 'bg-purple-500'}`} style={{ width: trend ? `${Math.min(100, 50 + trend)}%` : '40%' }} />
      </div>
    </div>
  );
}
