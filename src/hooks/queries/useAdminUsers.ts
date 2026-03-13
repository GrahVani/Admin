import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  const { isAuthenticated } = useAdminAuth();
  const { page = 1, limit = 20, search = "", role = "", status = "" } = params;

  return useQuery({
    queryKey: ["admin-users", page, limit, search, role, status],
    queryFn: () =>
      adminApiFetch(
        `/api/v1/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}&status=${status}`
      ),
    enabled: isAuthenticated,
    select: (res) => res?.data,
  });
}

export function useAdminUserDetail(id: string | null) {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminApiFetch(`/api/v1/admin/users/${id}`),
    enabled: isAuthenticated && !!id,
    select: (res) => res?.data,
  });
}
