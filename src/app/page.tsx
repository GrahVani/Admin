"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Eye, EyeOff, Sparkles, Shield, Lock } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function AdminLoginPage() {
  const { login, isLoading, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  if (!isLoading && isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-deep">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-admin-accent to-amber-600 flex items-center justify-center shadow-lg shadow-admin-accent/30">
            <Sparkles className="w-8 h-8 text-admin-deep" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-admin-accent" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-admin-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-admin-purple/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-admin-card/20 via-transparent to-transparent" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div className="text-center mb-10" variants={staggerItem}>
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-admin-accent to-amber-600 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-admin-accent/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Shield className="w-10 h-10 text-admin-deep" />
          </motion.div>
          <h1
            className="text-3xl font-bold text-admin-text"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Grahvani Admin
          </h1>
          <p className="text-admin-text-secondary text-sm mt-2">
            Platform Administration Console
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass-card p-8 gold-glow"
          variants={staggerItem}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                className="p-4 rounded-xl bg-admin-danger/10 border border-admin-danger/20 text-admin-danger text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-admin-text-secondary uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-admin-input border border-admin-border text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent/30 transition-all"
                  placeholder="admin@grahvani.in"
                  required
                />
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-admin-text-secondary uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-11 pr-12 rounded-xl bg-admin-input border border-admin-border text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent/30 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-text-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Admin"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-admin-text-muted text-xs mt-8"
          variants={staggerItem}
        >
          © {new Date().getFullYear()} Grahvani Vedic Astrology Platform
          <br />
          <span className="text-admin-text-muted/60">Secure Admin Access Only</span>
        </motion.p>
      </motion.div>
    </div>
  );
}
