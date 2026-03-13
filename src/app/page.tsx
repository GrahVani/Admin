"use client";

import React, { useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-admin-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background cosmic effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-admin-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-admin-info/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-admin-accent to-admin-accent-hover mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-admin-deep" style={{ fontFamily: "var(--font-display)" }}>G</span>
          </div>
          <h1 className="text-3xl font-bold text-admin-text" style={{ fontFamily: "var(--font-display)" }}>
            Grahvani Admin
          </h1>
          <p className="text-admin-text-secondary text-sm mt-2">
            Platform Administration Console
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 gold-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-admin-danger/10 border border-admin-danger/20 text-admin-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent/30 transition-all"
                placeholder="admin@grahvani.in"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-admin-text-secondary uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-admin-input border border-admin-border text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none focus:ring-1 focus:ring-admin-accent/30 transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-muted hover:text-admin-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold py-3.5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In to Admin"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-admin-text-muted text-xs mt-8">
          © {new Date().getFullYear()} Grahvani Vedic Astrology Platform
        </p>
      </div>
    </div>
  );
}
