import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function useEngineHealth() {
  const { isAuthenticated } = useAdminAuth();
  return useQuery({
    queryKey: ["engine-health"],
    queryFn: () => adminApiFetch("/api/v1/admin/engine/health"),
    enabled: isAuthenticated,
    refetchInterval: 10_000, // Poll every 10 seconds
    select: (res) => res?.data,
  });
}
