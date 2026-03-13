"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  indeterminate?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  className = "",
  ...props
}: CheckboxProps) {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${className}`}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <motion.div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          checked || indeterminate
            ? "bg-admin-accent border-admin-accent"
            : "border-admin-border bg-admin-input hover:border-admin-border-light"
        }`}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence initial={false}>
          {checked && !indeterminate && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3.5 h-3.5 text-admin-deep" strokeWidth={3} />
            </motion.div>
          )}
          {indeterminate && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Minus className="w-3.5 h-3.5 text-admin-deep" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </label>
  );
}

import { AnimatePresence } from "framer-motion";
