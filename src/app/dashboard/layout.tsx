"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopBar from "@/components/layout/AdminTopBar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { MobileNav, MobileMenuButton } from "@/components/layout/MobileNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/useMediaQuery";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-deep">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-admin-accent to-amber-600 flex items-center justify-center shadow-lg shadow-admin-accent/30">
            <span className="text-2xl font-bold text-admin-deep">G</span>
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-admin-accent" />
        </motion.div>
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
    <div className="min-h-screen flex bg-admin-deep">
      {/* Desktop Sidebar */}
      {!isMobile && <AdminSidebar />}

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : 256,
        }}
      >
        <AdminTopBar onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="flex-1 p-3 sm:p-4 lg:p-5 xl:p-6 overflow-y-auto">
          <div className="max-w-[1920px] mx-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </motion.div>

      {/* Mobile Menu Button */}
      {isMobile && <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />}

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Command Palette (Global) */}
      <CommandPalette />
    </div>
  );
}
