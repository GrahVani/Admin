// Admin API Layer — Mirrors frontend-grahvani-software apiFetch pattern
import { useAdminAuthStore } from "@/store/useAdminAuthStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function adminApiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  responseType: "json" | "text" | "blob" = "json"
): Promise<T> {
  const { accessToken, refreshToken, setTokens, clearTokens } =
    useAdminAuthStore.getState();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if not FormData and not explicitly overridden
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Token refresh on 401
  if (response.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const refreshResult = data.data || data;
        const newTokens = refreshResult.tokens || refreshResult;

        setTokens(newTokens.accessToken, newTokens.refreshToken);

        headers["Authorization"] = `Bearer ${newTokens.accessToken}`;
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new Error("Session expired");
      }
    } catch {
      clearTokens();
      throw new Error("Session expired");
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message || `API Error: ${response.status}`
    );
  }

  // Handle different response types
  switch (responseType) {
    case "text":
      return response.text() as Promise<T>;
    case "blob":
      return response.blob() as Promise<T>;
    case "json":
    default:
      return response.json();
  }
}

// Helper for CSV exports
export async function adminApiFetchCSV(endpoint: string): Promise<Blob> {
  return adminApiFetch<Blob>(endpoint, {}, "blob");
}

// Helper for text responses
export async function adminApiFetchText(endpoint: string): Promise<string> {
  return adminApiFetch<string>(endpoint, {}, "text");
}

// Helper for POST requests
export async function adminApiFetchPost<T = any>(endpoint: string, body: any): Promise<T> {
  return adminApiFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
