import { create } from "zustand";

import { getMe } from "@/api/auth";
import {
  refreshAccessToken,
  setAccessToken,
  setOnSessionExpired,
  setStoredRefreshToken,
} from "@/api/client";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (accessToken, refreshToken) => {
    setAccessToken(accessToken);
    await setStoredRefreshToken(refreshToken);

    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    setAccessToken(null);
    await setStoredRefreshToken(null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hydrate: async () => {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Terminal refresh failure anywhere in the app → drop the session; the route
// guard in app/_layout.tsx redirects to login declaratively.
setOnSessionExpired(() => {
  void useAuthStore.getState().logout();
});
