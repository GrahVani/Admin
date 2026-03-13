import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useAdminClients(params: {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
}) {
  const { isAuthenticated } = useAdminAuth();
  const { page = 1, limit = 20, search = "", userId = "" } = params;

  return useQuery({
    queryKey: ["admin-clients", page, limit, search, userId],
    queryFn: () =>
      adminApiFetch(
        `/api/v1/admin/clients?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&userId=${userId}`
      ),
    enabled: isAuthenticated,
    select: (res) => res?.data,
  });
}

export function useClientStats() {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["admin-client-stats"],
    queryFn: () => adminApiFetch("/api/v1/admin/clients/stats"),
    enabled: isAuthenticated,
    select: (res) => res?.data,
  });
}
