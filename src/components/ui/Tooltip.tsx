"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, HelpCircle, AlertCircle, Lightbulb } from "lucide-react";

export type TooltipVariant = "default" | "info" | "help" | "warning" | "insight";
export type TooltipSize = "sm" | "md" | "lg";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  variant?: TooltipVariant;
  size?: TooltipSize;
  maxWidth?: number;
  disabled?: boolean;
  showIndicator?: boolean;
  indicatorPosition?: "inline" | "corner";
  className?: string;
}

interface TooltipContentProps {
  title?: string;
  description: string;
  shortcut?: string;
  learnMore?: { text: string; href: string };
  variant?: TooltipVariant;
}

// Rich tooltip content component (like Linear/Vercel)
export function TooltipContent({
  title,
  description,
  shortcut,
  learnMore,
  variant = "default",
}: TooltipContentProps) {
  const variantStyles = {
    default: "border-slate-700 bg-slate-800",
    info: "border-blue-500/30 bg-blue-950/90",
    help: "border-amber-500/30 bg-amber-950/90",
    warning: "border-red-500/30 bg-red-950/90",
    insight: "border-emerald-500/30 bg-emerald-950/90",
  };

  const iconMap = {
    default: null,
    info: <Info className="w-4 h-4 text-blue-400" />,
    help: <HelpCircle className="w-4 h-4 text-amber-400" />,
    warning: <AlertCircle className="w-4 h-4 text-red-400" />,
    insight: <Lightbulb className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <div className={`rounded-lg border shadow-xl ${variantStyles[variant]} overflow-hidden`}>
      <div className="p-3">
        {title && (
          <div className="flex items-center gap-2 mb-1.5">
            {iconMap[variant]}
            <span className="text-xs font-semibold text-slate-200">{title}</span>
          </div>
        )}
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        {shortcut && (
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <span className="text-[10px] text-slate-500">
              Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">{shortcut}</kbd>
            </span>
          </div>
        )}
        {learnMore && (
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <a
              href={learnMore.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
            >
              {learnMore.text} →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Smart tooltip indicator icon
export function TooltipIndicator({
  variant = "default",
  size = "sm",
  className = "",
}: {
  variant?: TooltipVariant;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  const colorClasses = {
    default: "text-slate-600 hover:text-slate-400",
    info: "text-blue-500/60 hover:text-blue-400",
    help: "text-amber-500/60 hover:text-amber-400",
    warning: "text-red-500/60 hover:text-red-400",
    insight: "text-emerald-500/60 hover:text-emerald-400",
  };

  return (
    <Info
      className={`${sizeClasses[size]} ${colorClasses[variant]} transition-colors cursor-help ${className}`}
    />
  );
}

// Main Tooltip Component
export function Tooltip({
  content,
  children,
  position = "top",
  delay = 0.2,
  variant = "default",
  size = "md",
  maxWidth = 280,
  disabled = false,
  showIndicator = false,
  indicatorPosition = "inline",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    const id = setTimeout(() => setIsVisible(true), delay * 1000);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800",
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-1",
    md: "text-xs px-3 py-1.5",
    lg: "text-sm px-4 py-2",
  };

  const variantStyles = {
    default: "bg-slate-800 border-slate-700 text-slate-200",
    info: "bg-blue-950/95 border-blue-500/30 text-blue-100",
    help: "bg-amber-950/95 border-amber-500/30 text-amber-100",
    warning: "bg-red-950/95 border-red-500/30 text-red-100",
    insight: "bg-emerald-950/95 border-emerald-500/30 text-emerald-100",
  };

  // If content is a string, wrap it nicely
  const tooltipContent = typeof content === "string" ? (
    <div className={`rounded-lg border shadow-lg whitespace-nowrap ${sizeClasses[size]} ${variantStyles[variant]}`}>
      {content}
    </div>
  ) : (
    <div style={{ maxWidth }}>{content}</div>
  );

  return (
    <div
      ref={tooltipRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showIndicator && indicatorPosition === "inline" && (
        <span className="ml-1">
          <TooltipIndicator variant={variant} size="xs" />
        </span>
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute ${positionClasses[position]} z-[9999]`}
            initial={{ opacity: 0, y: position === "top" ? 4 : position === "bottom" ? -4 : 0, x: position === "left" ? 4 : position === "right" ? -4 : 0, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: position === "top" ? 4 : position === "bottom" ? -4 : 0, x: position === "left" ? 4 : position === "right" ? -4 : 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          >
            {tooltipContent}
            {typeof content === "string" && (
              <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Smart Field Label with Tooltip
export function FieldLabel({
  label,
  tooltip,
  required,
  variant = "default",
}: {
  label: string;
  tooltip?: string;
  required?: boolean;
  variant?: TooltipVariant;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </span>
      {tooltip && (
        <Tooltip content={tooltip} variant={variant} position="right">
          <TooltipIndicator variant={variant} size="xs" />
        </Tooltip>
      )}
    </div>
  );
}

// Data Point with Contextual Tooltip (for tables/lists)
export function DataPoint({
  value,
  label,
  tooltip,
  trend,
  trendDirection,
}: {
  value: React.ReactNode;
  label?: string;
  tooltip?: string;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
}) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  };

  const content = (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-slate-200">{value}</span>
      {label && <span className="text-xs text-slate-500">{label}</span>}
      {trend !== undefined && (
        <span className={`text-xs ${trendColors[trendDirection || "neutral"]}`}>
          {trendDirection === "up" ? "+" : trendDirection === "down" ? "-" : ""}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="top" variant="insight">
        <div className="cursor-help">{content}</div>
      </Tooltip>
    );
  }

  return content;
}

// Action Button with Tooltip
export function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  disabled,
  shortcut,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
  disabled?: boolean;
  shortcut?: string;
}) {
  const baseClasses = "p-2 rounded-lg transition-colors";
  const variantClasses = {
    default: "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
    danger: "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10",
    primary: "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10",
  };

  return (
    <Tooltip
      content={
        shortcut ? (
          <TooltipContent
            description={label}
            shortcut={shortcut}
            variant={variant === "danger" ? "warning" : "default"}
          />
        ) : (
          label
        )
      }
      position="top"
      delay={0.1}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Icon className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

export default Tooltip;
