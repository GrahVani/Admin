"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

interface AdminUser {
  id?: string;        // Alias for userId, populated from JWT sub
  userId: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  displayName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  isVerified?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const { accessToken, refreshToken, setTokens, clearTokens } = useAdminAuthStore();

  // Handle store hydration
  useEffect(() => {
    const checkHydration = () => {
      // Check if the store has hydrated from localStorage
      if (useAdminAuthStore.persist?.hasHydrated()) {
        setHasHydrated(true);
      } else {
        // Fallback or wait for next tick
        setTimeout(checkHydration, 10);
      }
    };
    checkHydration();
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const fetchProfile = useCallback(async () => {
    if (!hasHydrated) return;
    
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const profileData = data.data || data;
        const profile = profileData.user || profileData;

        const adminRoles = ["admin", "moderator"];
        if (!adminRoles.includes(profile.role)) {
          clearTokens();
          setUser(null);
        } else {
          setUser({
            userId: profile.id || profile.userId,
            email: profile.email,
            name: profile.name || profile.displayName || profile.email,
            role: profile.role,
            avatarUrl: profile.avatarUrl,
          });
        }
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, hasHydrated, API_BASE, clearTokens]);

  useEffect(() => {
    if (hasHydrated) {
      fetchProfile();
    }
  }, [fetchProfile, hasHydrated]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || "Login failed");
    }

    const data = await res.json();
    const authResult = data.data || data;

    const adminRoles = ["admin", "moderator"];
    if (!adminRoles.includes(authResult.user?.role)) {
      throw new Error("Administrative access required");
    }

    // Auth service returns tokens inside a 'tokens' property
    const { accessToken, refreshToken } = authResult.tokens || {};
    
    if (!accessToken || !refreshToken) {
      throw new Error("Invalid response from auth server");
    }

    setTokens(accessToken, refreshToken);
    setUser({
      userId: authResult.user.id || authResult.user.userId,
      email: authResult.user.email,
      name: authResult.user.name || authResult.user.email,
      role: authResult.user.role,
      avatarUrl: authResult.user.avatarUrl,
    });
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
