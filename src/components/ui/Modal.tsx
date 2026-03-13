"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ title, isOpen, onClose, children, maxWidth = "max-w-md" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-admin-deep/90 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full ${maxWidth} bg-admin-primary border border-admin-border rounded-3xl shadow-2xl overflow-hidden animate-zoom-in`}>
        {title && (
          <div className="px-8 pt-8 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-admin-text tracking-tight">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-admin-text-muted hover:bg-admin-elevated hover:text-admin-text transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div className="p-8">
          {!title && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-admin-text-muted hover:bg-admin-elevated hover:text-admin-text transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
