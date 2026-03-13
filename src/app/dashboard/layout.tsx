"use client";

import React from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopBar from "@/components/layout/AdminTopBar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <div className="flex-1 ml-[256px] flex flex-col min-h-screen transition-all duration-300">
        <AdminTopBar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
