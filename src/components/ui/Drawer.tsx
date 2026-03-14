"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { drawerBackdrop, drawerContent } from "@/lib/animations";
import { Button } from "./Button";

interface DrawerProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  showCloseButton?: boolean;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      loading?: boolean;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function Drawer({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  footer,
  width = "w-[520px]",
  showCloseButton = true,
  actions,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-admin-deep/80 backdrop-blur-sm"
            variants={drawerBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`relative ml-auto flex h-full flex-col bg-admin-primary border-l border-admin-border shadow-2xl ${width}`}
            variants={drawerContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-admin-border/50">
              <div>
                <h3
                  className="text-lg font-bold text-admin-text uppercase tracking-wider"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-admin-text-muted mt-1">{subtitle}</p>
                )}
              </div>
              {showCloseButton && (
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-xl text-admin-text-muted hover:bg-admin-elevated hover:text-admin-text transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {children}
              </motion.div>
            </div>

            {/* Footer with Actions */}
            {(footer || actions) && (
              <div className="px-6 py-4 border-t border-admin-border/50 bg-admin-elevated/5">
                {actions ? (
                  <div className="flex items-center justify-end gap-3">
                    {actions.secondary && (
                      <Button variant="ghost" onClick={actions.secondary.onClick}>
                        {actions.secondary.label}
                      </Button>
                    )}
                    {actions.primary && (
                      <Button
                        onClick={actions.primary.onClick}
                        isLoading={actions.primary.loading}
                      >
                        {actions.primary.label}
                      </Button>
                    )}
                  </div>
                ) : (
                  footer
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
