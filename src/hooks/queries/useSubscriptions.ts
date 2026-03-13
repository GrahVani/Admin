import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function usePlans() {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminApiFetch("/api/v1/admin/plans"),
    enabled: isAuthenticated,
    select: (res) => res?.data ?? [],
  });
}

export function usePlatformFeatures() {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["admin-platform-features"],
    queryFn: () => adminApiFetch("/api/v1/admin/plans/features"), // I'll need to check the exact route
    enabled: isAuthenticated,
    select: (res) => res?.data ?? [],
  });
}

export function useSubscriptions(params: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const { isAuthenticated } = useAdminAuth();
  const { page = 1, limit = 20, status = "" } = params;

  return useQuery({
    queryKey: ["admin-subscriptions", page, limit, status],
    queryFn: () =>
      adminApiFetch(`/api/v1/admin/subscriptions?page=${page}&limit=${limit}&status=${status}`),
    enabled: isAuthenticated,
    select: (res) => res?.data,
  });
}
