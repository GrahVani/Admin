"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";
import { fadeInUp } from "@/lib/animations";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {Icon && (
        <motion.div
          className="w-20 h-20 rounded-2xl bg-admin-elevated/50 border border-admin-border flex items-center justify-center mb-6"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className="w-10 h-10 text-admin-text-muted" />
        </motion.div>
      )}

      <h3 className="text-lg font-bold text-admin-text mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-admin-text-secondary max-w-sm mb-6">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel || action) && (
        <div className="flex items-center gap-3">
          {secondaryActionLabel && (
            <Button variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
          {action}
        </div>
      )}
    </motion.div>
  );
}

// Specialized empty states
export function EmptySearch({
  searchTerm,
  onClear,
}: {
  searchTerm: string;
  onClear: () => void;
}) {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`}
      actionLabel="Clear Search"
      onAction={onClear}
    />
  );
}

export function EmptyTable({
  itemName = "items",
  actionLabel,
  onAction,
}: {
  itemName?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      title={`No ${itemName} yet`}
      description={`Get started by adding your first ${itemName.slice(0, -1)}.`}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}
