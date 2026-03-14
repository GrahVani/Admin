"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Megaphone,
  FileText,
  LifeBuoy,
  Cpu,
  UserCircle,
  LogOut,
  ArrowRight,
  Command,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { commandPaletteBackdrop, commandPaletteContent } from "@/lib/animations";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  href: string;
  keywords: string[];
  shortcut?: string;
}

const commands: CommandItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "View platform overview",
    icon: LayoutDashboard,
    href: "/dashboard",
    keywords: ["home", "overview", "stats"],
    shortcut: "G D",
  },
  {
    id: "users",
    title: "User Management",
    subtitle: "Manage astrologers and users",
    icon: Users,
    href: "/dashboard/users",
    keywords: ["astrologers", "clients", "members"],
    shortcut: "G U",
  },
  {
    id: "clients",
    title: "Client Registry",
    subtitle: "View all clients",
    icon: UserCircle,
    href: "/dashboard/clients",
    keywords: ["customers", "users"],
  },
  {
    id: "subscriptions",
    title: "Subscriptions",
    subtitle: "Manage subscription plans",
    icon: CreditCard,
    href: "/dashboard/subscriptions",
    keywords: ["plans", "billing", "pricing"],
    shortcut: "G S",
  },
  {
    id: "analytics",
    title: "Analytics",
    subtitle: "View detailed analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    keywords: ["charts", "reports", "statistics"],
    shortcut: "G A",
  },
  {
    id: "engine",
    title: "System Monitor",
    subtitle: "Check system health",
    icon: Cpu,
    href: "/dashboard/engine",
    keywords: ["health", "status", "monitoring"],
  },
  {
    id: "content",
    title: "Content Management",
    subtitle: "Manage platform content",
    icon: FileText,
    href: "/dashboard/content",
    keywords: ["pages", "cms", "posts"],
  },
  {
    id: "announcements",
    title: "Announcements",
    subtitle: "Manage announcements",
    icon: Megaphone,
    href: "/dashboard/announcements",
    keywords: ["news", "updates", "notifications"],
  },
  {
    id: "support",
    title: "Support Tickets",
    subtitle: "Handle support requests",
    icon: LifeBuoy,
    href: "/dashboard/support",
    keywords: ["tickets", "help", "issues"],
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "Platform configuration",
    icon: Settings,
    href: "/dashboard/settings",
    keywords: ["config", "preferences", "options"],
    shortcut: "G ,",
  },
];

export function CommandPalette() {
  const { isOpen, close } = useCommandPalette();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { logout } = useAdminAuth();

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const query = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query) ||
        cmd.subtitle?.toLowerCase().includes(query) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(query))
    );
  }, [search]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          const cmd = filteredCommands[selectedIndex];
          if (cmd) {
            router.push(cmd.href);
            close();
            setSearch("");
          }
          break;
        case "Escape":
          close();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, router, close]);

  const handleSelect = (cmd: CommandItem) => {
    router.push(cmd.href);
    close();
    setSearch("");
  };

  const handleLogout = () => {
    logout();
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-admin-deep/80 backdrop-blur-sm"
            variants={commandPaletteBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
          />

          {/* Content */}
          <motion.div
            className="relative w-full max-w-2xl mx-4 bg-admin-primary border border-admin-border rounded-2xl shadow-2xl overflow-hidden"
            variants={commandPaletteContent}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-admin-border">
              <Search className="w-5 h-5 text-admin-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search commands, pages, or actions..."
                className="flex-1 bg-transparent text-admin-text placeholder:text-admin-text-muted focus:outline-none text-base"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 rounded-md bg-admin-elevated text-[10px] font-bold text-admin-text-muted border border-admin-border">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-admin-text-secondary">
                    No results found for &quot;{search}&quot;
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <div className="px-4 py-2 text-[10px] font-bold text-admin-text-muted uppercase tracking-wider">
                    Pages
                  </div>
                  {filteredCommands.map((cmd, index) => {
                    const Icon = cmd.icon;
                    const isSelected = index === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleSelect(cmd)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? "bg-admin-accent/10 text-admin-accent"
                            : "text-admin-text hover:bg-admin-elevated"
                        }`}
                        style={{ width: "calc(100% - 16px)" }}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-admin-accent/20"
                              : "bg-admin-elevated"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cmd.title}</p>
                          {cmd.subtitle && (
                            <p
                              className={`text-xs truncate ${
                                isSelected
                                  ? "text-admin-accent/70"
                                  : "text-admin-text-muted"
                              }`}
                            >
                              {cmd.subtitle}
                            </p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div className="flex items-center gap-1">
                            {cmd.shortcut.split(" ").map((key, i) => (
                              <kbd
                                key={i}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  isSelected
                                    ? "bg-admin-accent/20 border-admin-accent/30"
                                    : "bg-admin-elevated border-admin-border"
                                }`}
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                        {isSelected && (
                          <ArrowRight className="w-4 h-4 animate-pulse" />
                        )}
                      </button>
                    );
                  })}

                  {/* Actions Section */}
                  <div className="px-4 py-2 mt-2 text-[10px] font-bold text-admin-text-muted uppercase tracking-wider border-t border-admin-border">
                    Actions
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-left text-admin-danger hover:bg-admin-danger/10 transition-colors"
                    style={{ width: "calc(100% - 16px)" }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-admin-danger/10">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Sign Out</p>
                      <p className="text-xs text-admin-danger/70">
                        Log out of admin panel
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border bg-admin-elevated/30">
              <div className="flex items-center gap-4 text-[10px] text-admin-text-muted">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-admin-elevated border border-admin-border font-sans">
                    ↑↓
                  </kbd>{" "}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-admin-elevated border border-admin-border font-sans">
                    ↵
                  </kbd>{" "}
                  Select
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Command className="w-3 h-3" />
                <span className="text-[10px] font-medium">Grahvani</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
