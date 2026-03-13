"use client";

import React from "react";

export type StatusType = 
  | "active" | "suspended" | "pending_verification" | "deleted" | "expired" | "trialing" | "cancelled"
  | "open" | "in_progress" | "resolved" | "closed"
  | "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  status: string | StatusType;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
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

    // Generic
    success: "bg-admin-success/10 text-admin-success border-admin-success/20",
    warning: "bg-admin-warning/10 text-admin-warning border-admin-warning/20",
    danger: "bg-admin-danger/10 text-admin-danger border-admin-danger/20",
    info: "bg-admin-info/10 text-admin-info border-admin-info/20",
    neutral: "bg-admin-elevated text-admin-text-secondary border-admin-border",
  };

  const label = s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[s] || styles.neutral} ${className}`}>
      {label}
    </span>
  );
}
