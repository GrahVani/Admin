"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, UserCheck, CreditCard, BarChart3, Settings,
  Megaphone, FileText, LifeBuoy, ScrollText, ChevronLeft,
  Layers, List, Cpu, ChevronDown, LucideIcon, UserCircle,
  Sparkles, Shield, Wallet, LineChart, Cog, Workflow,
  Target, Gauge, FolderOpen, Bell, HelpCircle
} from "lucide-react";
import { useNavigation, NavItem } from "@/hooks/queries/useNavigation";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

// Icon registry
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCircle,
  CreditCard,
  BarChart3,
  Settings,
  Megaphone,
  FileText,
  LifeBuoy,
  ScrollText,
  Layers,
  List,
  Cpu,
  Shield,
  Wallet,
  LineChart,
  Cog,
  Workflow,
  Target,
  Gauge,
  FolderOpen,
  Bell,
  HelpCircle,
  Sparkles,
};

// Section labels
const SECTION_LABELS: Record<string, string> = {
  monetization: "MONETIZATION",
  insights: "INSIGHTS",
  management: "MANAGEMENT",
  operations: "OPERATIONS",
};

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

function SectionHeader({ section }: { section: string }) {
  const label = SECTION_LABELS[section];
  if (!label) return null;

  return (
    <div className="px-3 py-2 mt-4">
      <span className="text-[10px] font-bold text-slate-500 tracking-wider">
        {label}
      </span>
      <div className="mt-2 h-px bg-slate-800" />
    </div>
  );
}

function NavItemComponent({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const Icon = ICON_MAP[item.icon] || LayoutDashboard;
  const hasChildren = item.children && item.children.length > 0;

  // Check active states
  const isExactActive = pathname === item.href;
  const isChildActive = item.children?.some(
    (c) => pathname === c.href || pathname?.startsWith(c.href + "/")
  );
  const isActive = isExactActive || isChildActive;

  // Auto-expand when child is active
  const [isOpen, setIsOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive && !isOpen) {
      setIsOpen(true);
    }
  }, [pathname, isChildActive]);

  // Collapsed state
  if (collapsed) {
    return (
      <Tooltip content={item.label} position="right">
        <Link
          href={item.href}
          className={`flex items-center justify-center w-10 h-10 rounded-lg mx-auto transition-colors ${
            isActive
              ? "bg-amber-500/10 text-amber-400"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Icon className="w-5 h-5" />
          {item.badge && item.badge > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          )}
        </Link>
      </Tooltip>
    );
  }

  // With children - expandable
  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-slate-800 text-slate-100"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Icon className="w-5 h-5 shrink-0" />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 pl-4 border-l border-slate-800 space-y-1">
                {item.children!.map((child) => {
                  const ChildIcon = ICON_MAP[child.icon] || Layers;
                  const isChildPathActive = pathname === child.href || pathname?.startsWith(child.href + "/");

                  return (
                    <Link
                      key={child.id}
                      href={child.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isChildPathActive
                          ? "text-amber-400 font-medium"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <ChildIcon className="w-4 h-4 shrink-0" />
                      <span>{child.label}</span>
                      {isChildPathActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Simple link (no children)
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-slate-800 text-slate-100"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="font-medium">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar({ 
  collapsed: controlledCollapsed, 
  onCollapseChange 
}: AdminSidebarProps = {}) {
  // Internal state for uncontrolled mode
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: navItems = [], isLoading } = useNavigation();

  // Use controlled or internal state
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved && !isControlled) setInternalCollapsed(saved === "true");
  }, [isControlled]);

  useEffect(() => {
    if (mounted && !isControlled) {
      localStorage.setItem("sidebar-collapsed", String(internalCollapsed));
    }
  }, [internalCollapsed, mounted, isControlled]);

  const handleCollapseChange = (newCollapsed: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapseChange?.(newCollapsed);
  };

  // Separate items: no-section (top) and with-section (grouped)
  const { topItems, sectionedItems } = useMemo(() => {
    const top: NavItem[] = [];
    const sectioned: Record<string, NavItem[]> = {};

    navItems.forEach((item) => {
      if (!item.section) {
        top.push(item);
      } else {
        if (!sectioned[item.section]) sectioned[item.section] = [];
        sectioned[item.section].push(item);
      }
    });

    return { topItems: top, sectionedItems: sectioned };
  }, [navItems]);

  const sectionOrder = ["monetization", "insights", "management", "operations"];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 flex flex-col z-40 transition-all duration-300 ease-out ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-slate-900" />
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <h1 className="text-base font-bold text-slate-100 whitespace-nowrap">Grahvani</h1>
            <p className="text-[10px] font-semibold text-amber-400 tracking-wider whitespace-nowrap">SUPER ADMIN</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {isLoading ? (
          <div className="px-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : collapsed ? (
          <div className="px-2 space-y-1">
            {navItems.map((item) => (
              <NavItemComponent key={item.id} item={item} collapsed={true} />
            ))}
          </div>
        ) : (
          <div className="px-2">
            {/* Top items (no section) - e.g., Dashboard */}
            {topItems.length > 0 && (
              <div className="space-y-0.5">
                {topItems.map((item) => (
                  <NavItemComponent key={item.id} item={item} collapsed={false} />
                ))}
              </div>
            )}

            {/* Sectioned items */}
            {sectionOrder
              .filter((s) => sectionedItems[s]?.length > 0)
              .map((section) => (
                <div key={section}>
                  <SectionHeader section={section} />
                  <div className="space-y-0.5">
                    {sectionedItems[section].map((item) => (
                      <NavItemComponent key={item.id} item={item} collapsed={false} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-2 shrink-0">
        <Tooltip content={collapsed ? "Expand" : "Collapse"} position="top">
          <button
            onClick={() => handleCollapseChange(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            {collapsed ? (
              <ChevronLeft className="w-4 h-4 rotate-180" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </Tooltip>

        {!collapsed && (
          <div className="mt-2 px-3 py-2 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              v2.0.0
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
              ⌘K
            </kbd>
          </div>
        )}
      </div>
    </aside>
  );
}
