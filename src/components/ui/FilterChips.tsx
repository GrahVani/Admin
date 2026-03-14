"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Filter } from "lucide-react";

interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className = "",
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <motion.div
      className={`flex items-center gap-2 flex-wrap ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-1.5 text-admin-text-muted">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Filters:</span>
      </div>

      <AnimatePresence mode="popLayout">
        {filters.map((filter) => (
          <motion.span
            key={filter.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-admin-accent/10 border border-admin-accent/20 text-xs font-medium text-admin-accent"
          >
            <span className="text-admin-text-muted">{filter.label}:</span>
            <span className="text-admin-text">{filter.value}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="ml-0.5 p-0.5 rounded hover:bg-admin-accent/20 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      {onClearAll && (
        <motion.button
          layout
          onClick={onClearAll}
          className="text-xs font-medium text-admin-text-muted hover:text-admin-text transition-colors underline underline-offset-2"
        >
          Clear all
        </motion.button>
      )}
    </motion.div>
  );
}

// Filter dropdown component
interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className = "",
}: FilterDropdownProps) {
  return (
    <div className={`relative ${className}`}>
      <label className="block text-[10px] font-bold text-admin-text-muted uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2 rounded-xl bg-admin-input border border-admin-border text-sm text-admin-text focus:outline-none focus:border-admin-accent cursor-pointer hover:border-admin-border-light transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-[34px] pointer-events-none">
        <svg
          className="w-4 h-4 text-admin-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
