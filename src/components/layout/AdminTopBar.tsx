"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell, Search, LogOut, User, Settings, ChevronDown,
  Menu, Command, Sparkles, Check, X
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { Tooltip } from "@/components/ui/Tooltip";
import { Popover, MenuItem, MenuDivider } from "@/components/ui/Popover";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { fadeIn, fadeInDown, staggerContainer, staggerItem } from "@/lib/animations";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Platform overview & insights" },
  "/dashboard/users": { title: "User Management", subtitle: "Manage astrologers & practitioners" },
  "/dashboard/clients": { title: "Client Registry", subtitle: "View all platform clients" },
  "/dashboard/subscriptions": { title: "Subscriptions", subtitle: "Plans & billing overview" },
  "/dashboard/subscriptions/plans": { title: "Subscription Plans", subtitle: "Manage pricing tiers" },
  "/dashboard/subscriptions/list": { title: "Subscribers", subtitle: "Active subscription list" },
  "/dashboard/analytics": { title: "Analytics", subtitle: "Detailed platform metrics" },
  "/dashboard/engine": { title: "System Monitor", subtitle: "Health & performance status" },
  "/dashboard/content": { title: "Content Management", subtitle: "Pages & content control" },
  "/dashboard/settings": { title: "Platform Settings", subtitle: "Global configuration" },
  "/dashboard/announcements": { title: "Announcements", subtitle: "News & updates management" },
  "/dashboard/support": { title: "Support Tickets", subtitle: "Customer support center" },
  "/dashboard/audit-log": { title: "Audit Log", subtitle: "Activity tracking & history" },
  "/dashboard/profile": { title: "Admin Profile", subtitle: "Your account settings" },
  "/dashboard/admins": { title: "Admin Management", subtitle: "Manage admin users" },
};

// Mock notifications - in real app, these would come from API
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "New user registration",
    message: "A new astrologer has joined the platform",
    time: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    type: "user",
  },
  {
    id: "2",
    title: "Subscription renewed",
    message: "Premium plan renewed by 3 users",
    time: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
    type: "billing",
  },
  {
    id: "3",
    title: "System maintenance",
    message: "Scheduled maintenance completed successfully",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    type: "system",
  },
];

interface AdminTopBarProps {
  onMenuClick?: () => void;
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { open: openCommandPalette } = useCommandPalette();
  const isMobile = useIsMobile();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const pageInfo = PAGE_TITLES[pathname ?? ""] || { title: "Admin", subtitle: "" };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <motion.header
      className="h-16 bg-admin-primary/80 backdrop-blur-xl border-b border-admin-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left: Mobile Menu + Page Title */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <motion.h1
            key={pageInfo.title}
            className="text-lg font-bold text-admin-text"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {pageInfo.title}
          </motion.h1>
          {pageInfo.subtitle && (
            <motion.p
              key={pageInfo.subtitle}
              className="hidden sm:block text-xs text-admin-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {pageInfo.subtitle}
            </motion.p>
          )}
        </div>
      </div>

      {/* Center: Search Bar (Desktop) */}
      {!isMobile && (
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={openCommandPalette}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-elevated/50 border border-admin-border text-left text-sm text-admin-text-muted hover:text-admin-text hover:border-admin-border-light hover:bg-admin-elevated transition-all group"
          >
            <Search className="w-4 h-4 group-hover:text-admin-accent transition-colors" />
            <span className="flex-1">Search or jump to...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-admin-elevated border border-admin-border text-[10px] font-mono">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Time (Desktop) */}
        {!isMobile && (
          <div className="hidden xl:block text-right mr-2">
            <p className="text-sm font-semibold text-admin-text">
              {format(currentTime, "h:mm a")}
            </p>
            <p className="text-[10px] text-admin-text-muted">
              {format(currentTime, "EEEE, MMM d")}
            </p>
          </div>
        )}

        {/* Notifications */}
        <div className="relative">
          <Tooltip content="Notifications" position="bottom">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-admin-danger text-white text-[10px] font-bold flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>
          </Tooltip>

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div
                  className="fixed inset-0 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  className="absolute right-0 top-12 w-80 sm:w-96 bg-admin-primary border border-admin-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                  variants={fadeInDown}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
                    <h3 className="font-bold text-admin-text">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-admin-accent hover:text-admin-accent-hover font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center">
                        <Bell className="w-10 h-10 text-admin-text-muted mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-admin-text-muted">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-admin-border/50">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            className={`p-4 hover:bg-admin-elevated/50 transition-colors cursor-pointer ${
                              !notification.read ? "bg-admin-accent/5" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                            whileHover={{ x: 2 }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  notification.read ? "bg-admin-text-muted" : "bg-admin-accent"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-admin-text">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-admin-text-secondary mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-[10px] text-admin-text-muted mt-1.5">
                                  {format(notification.time, "h:mm a")}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-admin-border bg-admin-elevated/30">
                    <Link
                      href="/dashboard/announcements"
                      onClick={() => setShowNotifications(false)}
                      className="block text-center text-sm text-admin-accent hover:text-admin-accent-hover font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-admin-elevated/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-admin-accent to-amber-600 flex items-center justify-center text-sm font-bold text-admin-deep shadow-lg shadow-admin-accent/20">
              {(user?.name?.[0] || user?.email?.[0] || "A").toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-admin-text leading-none group-hover:text-admin-accent transition-colors">
                {user?.name || "Admin"}
              </p>
              <p className="text-[10px] text-admin-text-muted mt-0.5">
                {user?.role || "admin"}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-admin-text-muted transition-transform ${
                showProfile ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <motion.div
                  className="fixed inset-0 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowProfile(false)}
                />
                <motion.div
                  className="absolute right-0 top-12 w-64 bg-admin-primary border border-admin-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                  variants={fadeInDown}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="px-4 py-4 border-b border-admin-border">
                    <p className="text-sm font-bold text-admin-text truncate">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-admin-text-muted truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-admin-accent/10 text-[10px] font-bold text-admin-accent uppercase tracking-wider">
                      {user?.role}
                    </span>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-admin-border my-1" />
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-admin-danger hover:bg-admin-danger/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
