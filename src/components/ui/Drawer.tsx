"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export function Drawer({ title, isOpen, onClose, children, footer, width = "w-[520px]" }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-admin-deep/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`relative ml-auto flex h-full flex-col bg-admin-primary border-l border-admin-border shadow-2xl animate-slide-in-right ${width}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-admin-border/50">
          <h3 className="text-base font-bold text-admin-text uppercase tracking-widest" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-admin-text-muted hover:bg-admin-elevated hover:text-admin-text transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-admin-border/50 bg-admin-elevated/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
