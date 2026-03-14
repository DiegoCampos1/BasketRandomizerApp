import { create } from "zustand";
import Cookies from "js-cookie";
import { User } from "@/types/auth";
import { setAccessToken } from "@/lib/api/client";
import { getMe } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (accessToken: string, refreshToken: string) => {
    setAccessToken(accessToken);
    Cookies.set("refresh_token", refreshToken, { sameSite: "strict" });

    try {
      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    setAccessToken(null);
    Cookies.remove("refresh_token");
    set({ user: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  hydrate: async () => {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) {
      set({ isLoading: false });
      return;
    }

    try {
      const { default: axios } = await import("axios");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await axios.post(`${API_URL}/auth/refresh/`, {
        refresh: refreshToken,
      });

      const newAccess = response.data.access;
      const newRefresh = response.data.refresh;

      setAccessToken(newAccess);
      if (newRefresh) {
        Cookies.set("refresh_token", newRefresh, { sameSite: "strict" });
      }

      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      Cookies.remove("refresh_token");
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
