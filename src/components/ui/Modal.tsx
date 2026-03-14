"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { modalBackdrop, modalContent } from "@/lib/animations";
import { Button } from "./Button";

interface ModalProps {
  title?: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
      loading?: boolean;
      variant?: "primary" | "danger";
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
}

export function Modal({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-md",
  showCloseButton = true,
  actions,
}: ModalProps) {
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

  // Lock body scroll
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-admin-deep/90 backdrop-blur-md"
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className={`relative w-full ${maxWidth} bg-admin-primary border border-admin-border rounded-2xl shadow-2xl overflow-hidden`}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 pt-6 pb-4">
                <div className="flex-1">
                  {title && (
                    <h3
                      className="text-xl font-bold text-admin-text tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-admin-text-muted mt-1">{subtitle}</p>
                  )}
                </div>
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-xl text-admin-text-muted hover:bg-admin-elevated hover:text-admin-text transition-colors -mr-2 -mt-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div className={`px-6 ${!title && !showCloseButton ? "pt-6" : ""} ${!actions ? "pb-6" : ""}`}>
              {children}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-admin-border/50 bg-admin-elevated/5">
                {actions.secondary && (
                  <Button variant="ghost" onClick={actions.secondary.onClick}>
                    {actions.secondary.label}
                  </Button>
                )}
                {actions.primary && (
                  <Button
                    variant={actions.primary.variant === "danger" ? "danger" : "primary"}
                    onClick={actions.primary.onClick}
                    isLoading={actions.primary.loading}
                  >
                    {actions.primary.label}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
