import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";

export function useSettings(category?: string) {
  return useQuery({
    queryKey: ["admin-settings", category],
    queryFn: async () => {
      const url = category ? `/api/v1/admin/settings?category=${category}` : "/api/v1/admin/settings";
      const response = await adminApiFetch(url);
      return response.data;
    },
  });
}

export function useAnnouncements(includeInactive = true) {
  return useQuery({
    queryKey: ["admin-announcements", includeInactive],
    queryFn: async () => {
      const response = await adminApiFetch(`/api/v1/admin/announcements?includeInactive=${includeInactive}`);
      return response.data;
    },
  });
}

export function useSupport(filters: {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["admin-support", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "all") params.append(key, String(value));
      });
      const response = await adminApiFetch(`/api/v1/admin/support?${params.toString()}`);
      return response.data;
    },
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ["admin-support-ticket", id],
    queryFn: async () => {
      const response = await adminApiFetch(`/api/v1/admin/support/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useAuditLogs(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin-audit-logs", page, limit],
    queryFn: async () => {
      const response = await adminApiFetch(`/api/v1/admin/audit-logs?page=${page}&limit=${limit}`);
      return response.data;
    },
  });
}
