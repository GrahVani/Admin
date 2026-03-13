import { useQuery } from "@tanstack/react-query";
import { adminApiFetch } from "@/lib/api";
import { useAdminAuth } from "@/context/AdminAuthContext";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
  badgeVariant?: "danger" | "warning" | "info";
  children?: NavItem[];
  section?: string;
}

export function useNavigation() {
  const { isAuthenticated } = useAdminAuth();
  return useQuery<NavItem[]>({
    queryKey: ["admin-navigation"],
    queryFn: async () => {
      const res = await adminApiFetch("/api/v1/admin/navigation");
      return res?.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
