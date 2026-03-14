"use client";

import React, { createContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { toastSlideIn } from "@/lib/animations";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  remove: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const typeStyles = {
  success: "bg-admin-success/10 border-admin-success/20 text-admin-success",
  error: "bg-admin-danger/10 border-admin-danger/20 text-admin-danger",
  warning: "bg-admin-warning/10 border-admin-warning/20 text-admin-warning",
  info: "bg-admin-info/10 border-admin-info/20 text-admin-info",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType, duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const success = useCallback(
    (message: string, duration?: number) => add(message, "success", duration),
    [add]
  );
  const error = useCallback(
    (message: string, duration?: number) => add(message, "error", duration),
    [add]
  );
  const warning = useCallback(
    (message: string, duration?: number) => add(message, "warning", duration),
    [add]
  );
  const info = useCallback(
    (message: string, duration?: number) => add(message, "info", duration),
    [add]
  );

  return (
    <ToastContext.Provider value={{ success, error, warning, info, remove }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = iconMap[toast.type];
            return (
              <motion.div
                key={toast.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[320px] max-w-[420px] ${typeStyles[toast.type]}`}
                variants={toastSlideIn}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <Icon className="w-5 h-5 shrink-0" />
                <p className="flex-1 text-sm font-medium text-admin-text">
                  {toast.message}
                </p>
                <button
                  onClick={() => remove(toast.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
