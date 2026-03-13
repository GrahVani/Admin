import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminAuthTokenStore {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
}

export const useAdminAuthStore = create<AdminAuthTokenStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: "grahvani_admin_auth_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
