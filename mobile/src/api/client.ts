import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

import { API_URL } from "@/api/urls";

const REFRESH_TOKEN_KEY = "refresh_token";

// eslint-disable-next-line import/no-named-as-default-member -- axios instance factory
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

/** Registered by the auth store; called when a token refresh terminally fails. */
export function setOnSessionExpired(handler: (() => void) | null) {
  onSessionExpired = handler;
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setStoredRefreshToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }
}

async function doRefresh(): Promise<string | null> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    // Raw axios: must not go through the 401 interceptor.
    const response = await axios.post(`${API_URL}/auth/refresh/`, {
      refresh: refreshToken,
    });
    const newAccess: string = response.data.access;
    const newRefresh: string | undefined = response.data.refresh;

    setAccessToken(newAccess);
    // ROTATE_REFRESH_TOKENS=true — the old refresh token is now invalid.
    if (newRefresh) {
      await setStoredRefreshToken(newRefresh);
    }
    return newAccess;
  } catch {
    await setStoredRefreshToken(null);
    setAccessToken(null);
    return null;
  }
}

/** Single-flight refresh, shared by the 401 interceptor and the WebSocket hook. */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      onSessionExpired?.();
    }

    return Promise.reject(error);
  }
);

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Follows DRF page-number pagination until `next` is null, accumulating all results. */
export async function getAllPages<T>(url: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  for (;;) {
    const response = await apiClient.get<PaginatedResponse<T> | T[]>(url, {
      params: { page, page_size: 100 },
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    items.push(...data.results);
    if (!data.next) return items;
    page += 1;
  }
}

export default apiClient;
