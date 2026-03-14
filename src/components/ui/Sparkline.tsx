"use client";

import React from "react";
import { motion } from "framer-motion";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  showArea?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 40,
  color = "#d4a843",
  strokeWidth = 2,
  showArea = true,
  className = "",
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Create area path
  const areaD = showArea
    ? `${pathD} L ${width},${height} L 0,${height} Z`
    : "";

  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {showArea && (
        <motion.path
          d={areaD}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* End point dot */}
      <motion.circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={3}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, duration: 0.2 }}
      />
    </svg>
  );
}

// Mini bar chart for quick stats
interface MiniBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function MiniBarChart({
  data,
  width = 60,
  height = 30,
  color = "#d4a843",
  className = "",
}: MiniBarChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const barWidth = width / data.length - 2;

  return (
    <svg width={width} height={height} className={className}>
      {data.map((value, index) => {
        const barHeight = (value / max) * height;
        const x = index * (width / data.length);
        const y = height - barHeight;

        return (
          <motion.rect
            key={index}
            x={x + 1}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={2}
            fill={color}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            style={{ transformOrigin: "bottom" }}
          />
        );
      })}
    </svg>
  );
}
