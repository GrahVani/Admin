"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tooltip } from "@/lib/animations";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 0.3,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay * 1000);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-admin-card",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-admin-card",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-admin-card",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-admin-card",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute ${positionClasses[position]} z-50`}
            variants={tooltip}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-3 py-1.5 bg-admin-card border border-admin-border rounded-lg shadow-lg whitespace-nowrap">
              <span className="text-xs text-admin-text font-medium">{content}</span>
            </div>
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
