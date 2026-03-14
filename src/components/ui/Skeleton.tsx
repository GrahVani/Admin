"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseClasses = "bg-admin-elevated/50";
  
  const variantClasses = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  if (!animate) {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={style}
      />
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className} overflow-hidden relative`}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 0.8, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
}

// Pre-built skeleton patterns
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card p-6 space-y-4 ${className}`}>
      <div className="flex items-start justify-between">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={60} height={20} />
      </div>
      <Skeleton variant="text" width={120} height={16} />
      <Skeleton variant="text" width="100%" height={32} />
      <Skeleton variant="rounded" width="100%" height={8} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-admin-border/50">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" width={`${80 + Math.random() * 40}px`} height={16} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-admin-border/30">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={`${60 + Math.random() * 60}px`}
                height={16}
                className="flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKPI({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={36} />
          <Skeleton variant="text" width={300} height={16} />
        </div>
        <Skeleton variant="rounded" width={120} height={40} />
      </div>
      
      {/* KPI Cards */}
      <SkeletonKPI count={3} />
      
      {/* Table */}
      <SkeletonTable rows={5} columns={4} />
    </div>
  );
}
