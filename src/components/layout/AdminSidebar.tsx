"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, CreditCard, BarChart3, Settings,
  Megaphone, FileText, LifeBuoy, ScrollText, ChevronLeft, ChevronRight,
  LogOut, Layers, List, Cpu, ChevronDown, ChevronUp, LucideIcon, UserCircle,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useNavigation, NavItem } from "@/hooks/queries/useNavigation";

// Icon registry — maps API icon name strings to Lucide components
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
};

// Section labels
const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  platform: "Platform",
  monetization: "Monetization",
  insights: "Insights",
  management: "Management",
  operations: "Operations",
};

function NavBadge({ count, variant }: { count: number; variant?: string }) {
  const color =
    variant === "danger"
      ? "bg-admin-danger text-white"
      : variant === "warning"
      ? "bg-admin-warning text-admin-deep"
      : "bg-admin-accent/20 text-admin-accent";

  return (
    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NavLink({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
  const hasChildren = item.children && item.children.length > 0;
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname?.startsWith(item.href));
  const isChildActive = item.children?.some(
    (c) => pathname === c.href || pathname?.startsWith(c.href)
  );
  const [expanded, setExpanded] = useState(isActive || isChildActive);

  if (hasChildren && !collapsed) {
    return (
      <li>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
            isActive || isChildActive
              ? "sidebar-active text-admin-accent font-semibold"
              : "text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated"
          }`}
        >
          <Icon className={`w-5 h-5 shrink-0 ${isActive || isChildActive ? "text-admin-accent" : "text-admin-text-muted"}`} />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <NavBadge count={item.badge} variant={item.badgeVariant} />
          )}
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-admin-text-muted" />
          ) : (
            <ChevronDown className="w-3 h-3 text-admin-text-muted" />
          )}
        </button>
        {expanded && (
          <ul className="mt-1 ml-4 pl-3 border-l border-admin-border space-y-1">
            {item.children!.map((child) => (
              <NavLink key={child.id} item={child} collapsed={collapsed} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
          isActive
            ? "sidebar-active text-admin-accent font-semibold"
            : "text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated"
        }`}
        title={collapsed ? item.label : undefined}
      >
        <Icon
          className={`w-5 h-5 shrink-0 ${
            isActive ? "text-admin-accent" : "text-admin-text-muted group-hover:text-admin-text-secondary"
          }`}
        />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {!collapsed && item.badge && item.badge > 0 && (
          <NavBadge count={item.badge} variant={item.badgeVariant} />
        )}
      </Link>
    </li>
  );
}

export default function AdminSidebar() {
  const { user, logout } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { data: navItems = [], isLoading } = useNavigation();

  // Group nav items by section
  const sections = navItems.reduce((acc, item) => {
    const section = item.section ?? "other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const sectionOrder = ["overview", "platform", "monetization", "insights", "management", "operations"];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-admin-primary border-r border-admin-border flex flex-col transition-all duration-300 z-40 ${
        collapsed ? "w-[72px]" : "w-[256px]"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-admin-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent-hover flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-admin-deep" style={{ fontFamily: "var(--font-display)" }}>
            G
          </span>
        </div>
        {!collapsed && (
          <div className="ml-3">
            <p className="text-sm font-bold text-admin-text" style={{ fontFamily: "var(--font-display)" }}>
              Grahvani
            </p>
            <p className="text-[10px] text-admin-text-muted">Super Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="px-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-admin-elevated animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 px-3">
            {sectionOrder
              .filter((s) => sections[s]?.length > 0)
              .map((section) => (
                <div key={section}>
                  {!collapsed && (
                    <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-admin-text-muted">
                      {SECTION_LABELS[section] ?? section}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {sections[section].map((item) => (
                      <NavLink key={item.id} item={item} collapsed={collapsed} />
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-admin-border p-3 shrink-0">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2 rounded-xl bg-admin-elevated">
            <p className="text-xs font-semibold text-admin-text truncate">{user.name}</p>
            <p className="text-[10px] text-admin-text-muted truncate">{user.email}</p>
            <p className="text-[10px] text-admin-accent font-semibold mt-0.5 uppercase tracking-wider">
              {user.role}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-admin-danger hover:bg-admin-danger/10 text-sm transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-9 h-9 rounded-xl border border-admin-border flex items-center justify-center text-admin-text-muted hover:text-admin-text hover:bg-admin-elevated transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
