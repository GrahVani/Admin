"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/users": "User Management",
  "/dashboard/clients": "Client Registry",
  "/dashboard/subscriptions": "Subscriptions",
  "/dashboard/subscriptions/plans": "Subscription Plans",
  "/dashboard/subscriptions/list": "Subscribers",
  "/dashboard/analytics": "Analytics",
  "/dashboard/engine": "System Monitor",
  "/dashboard/content": "Content Management",
  "/dashboard/settings": "Platform Settings",
  "/dashboard/announcements": "Announcements",
  "/dashboard/support": "Support Tickets",
  "/dashboard/audit-log": "Audit Log",
  "/dashboard/profile": "Admin Profile",
};

export default function AdminTopBar() {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const pageTitle = PAGE_TITLES[pathname ?? ""] || "Admin";

  return (
    <header className="h-16 bg-admin-primary border-b border-admin-border flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Page Title */}
      <h1 className="text-base font-bold text-admin-text" style={{ fontFamily: "var(--font-display)" }}>
        {pageTitle}
      </h1>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link
          href="/dashboard/announcements"
          className="relative w-9 h-9 rounded-xl border border-admin-border flex items-center justify-center text-admin-text-muted hover:text-admin-text hover:bg-admin-elevated transition-colors"
        >
          <Bell className="w-4 h-4" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-3 border-l border-admin-border hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-admin-accent to-admin-accent-hover flex items-center justify-center text-sm font-bold text-admin-deep">
              {(user?.name?.[0] || user?.email?.[0] || "A").toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-admin-text leading-none">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-admin-text-muted mt-0.5">{user?.role || "admin"}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-admin-text-muted transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-12 w-52 bg-admin-primary border border-admin-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                <div className="px-4 py-3 border-b border-admin-border">
                  <p className="text-xs font-bold text-admin-text truncate">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-admin-text-muted truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    My Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-admin-text-secondary hover:text-admin-text hover:bg-admin-elevated transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <div className="border-t border-admin-border my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-admin-danger hover:bg-admin-danger/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
