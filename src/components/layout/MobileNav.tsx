"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { drawerBackdrop, drawerContent } from "@/lib/animations";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Users", href: "/dashboard/users" },
  { icon: CreditCard, label: "Subs", href: "/dashboard/subscriptions" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-admin-deep/90 backdrop-blur-sm z-40"
            variants={drawerBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-admin-primary border-t border-admin-border rounded-t-3xl z-50 max-h-[80vh] overflow-y-auto"
            variants={{
              hidden: { y: "100%" },
              visible: {
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                },
              },
              exit: {
                y: "100%",
                transition: {
                  duration: 0.2,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-admin-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent-hover flex items-center justify-center">
                  <span className="text-lg font-bold text-admin-deep">G</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-admin-text">Grahvani</p>
                  <p className="text-[10px] text-admin-text-muted">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-admin-text-muted hover:bg-admin-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="px-4 py-4 border-b border-admin-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent-hover flex items-center justify-center text-lg font-bold text-admin-deep">
                    {(user.name?.[0] || user.email?.[0] || "A").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-admin-text truncate">
                      {user.name || "Admin"}
                    </p>
                    <p className="text-xs text-admin-text-muted truncate">
                      {user.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-admin-accent/10 text-[10px] font-bold text-admin-accent uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="p-2">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                      isActive
                        ? "bg-admin-accent/10 text-admin-accent"
                        : "text-admin-text hover:bg-admin-elevated"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-admin-accent/20" : "bg-admin-elevated"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="mobileNavIndicator"
                        className="ml-auto w-2 h-2 rounded-full bg-admin-accent"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-admin-border">
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-admin-danger/10 text-admin-danger font-medium hover:bg-admin-danger/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating Menu Button for Mobile
interface MobileMenuButtonProps {
  onClick: () => void;
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-admin-accent text-admin-deep shadow-lg shadow-admin-accent/30 flex items-center justify-center z-30"
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Menu className="w-6 h-6" />
    </motion.button>
  );
}
