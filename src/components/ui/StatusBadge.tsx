"use client";

import React from "react";
import { motion } from "framer-motion";

export type StatusType = 
  | "active" | "suspended" | "pending_verification" | "deleted" | "expired" | "trialing" | "cancelled"
  | "open" | "in_progress" | "resolved" | "closed"
  | "success" | "warning" | "danger" | "info" | "neutral"
  | "online" | "offline" | "degraded";

interface StatusBadgeProps {
  status: string | StatusType;
  className?: string;
  pulse?: boolean;
  showDot?: boolean;
}

export function StatusBadge({ status, className = "", pulse = false, showDot = true }: StatusBadgeProps) {
  const s = status?.toLowerCase() || "neutral";

  const styles: Record<string, string> = {
    // User / Sub Status
    active: "bg-admin-success/10 text-admin-success border-admin-success/20",
    trialing: "bg-admin-info/10 text-admin-info border-admin-info/20",
    suspended: "bg-admin-danger/10 text-admin-danger border-admin-danger/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    expired: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",
    pending_verification: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",
    deleted: "bg-admin-danger/20 text-admin-danger border-admin-danger/30",

    // Ticket Status
    open: "bg-admin-danger/10 text-admin-danger border-admin-danger/20",
    in_progress: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",
    resolved: "bg-admin-success/10 text-admin-success border-admin-success/20",
    closed: "bg-admin-elevated text-admin-text-secondary border-admin-border",

    // System Status
    online: "bg-admin-success/10 text-admin-success border-admin-success/20",
    offline: "bg-admin-danger/10 text-admin-danger border-admin-danger/20",
    degraded: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",

    // Generic
    success: "bg-admin-success/10 text-admin-success border-admin-success/20",
    warning: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",
    danger: "bg-admin-danger/10 text-admin-danger border-admin-danger/20",
    info: "bg-admin-info/10 text-admin-info border-admin-info/20",
    neutral: "bg-admin-elevated text-admin-text-secondary border-admin-border",
  };

  const dotColors: Record<string, string> = {
    active: "bg-admin-success",
    trialing: "bg-admin-info",
    suspended: "bg-admin-danger",
    cancelled: "bg-slate-400",
    expired: "bg-admin-warning",
    pending_verification: "bg-admin-warning",
    deleted: "bg-admin-danger",
    open: "bg-admin-danger",
    in_progress: "bg-admin-warning",
    resolved: "bg-admin-success",
    closed: "bg-admin-text-muted",
    online: "bg-admin-success",
    offline: "bg-admin-danger",
    degraded: "bg-admin-warning",
    success: "bg-admin-success",
    warning: "bg-admin-warning",
    danger: "bg-admin-danger",
    info: "bg-admin-info",
    neutral: "bg-admin-text-muted",
  };

  const label = s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[s] || styles.neutral} ${className}`}
    >
      {showDot && (
        <motion.span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[s] || dotColors.neutral}`}
          animate={pulse ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {label}
    </span>
  );
}
