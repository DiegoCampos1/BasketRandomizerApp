import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

import { getAccessToken, refreshAccessToken } from "@/api/client";
import { WS_URL } from "@/api/urls";
import { notificationKeys } from "@/hooks/queryKeys";

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

/**
 * Real-time notifications over WebSocket. Same backoff semantics as the web
 * hook, plus mobile lifecycle handling: the socket closes in background and
 * reconnects on foreground, and a 4401 close triggers one token refresh
 * before giving up.
 */
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);
  const suspendedRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triedAuthRefreshRef = useRef(false);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const connect = useCallback(() => {
    if (!mountedRef.current || suspendedRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/notifications/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      triedAuthRefreshRef.current = false;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data));
        if (data.type === "new_notification" || data.type === "unread_count_update") {
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        }
      } catch {
        // Malformed message; ignore
      }
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      if (!mountedRef.current || suspendedRef.current) return;

      if (event.code === 4401) {
        // Access token likely expired — refresh once and retry.
        if (triedAuthRefreshRef.current) return;
        triedAuthRefreshRef.current = true;
        refreshAccessToken().then((newToken) => {
          if (newToken) connect();
        });
        return;
      }

      const delay = RECONNECT_DELAYS[Math.min(retriesRef.current, RECONNECT_DELAYS.length - 1)];
      retriesRef.current += 1;
      reconnectTimerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onerror is always followed by onclose; reconnection handled there
    };
  }, [queryClient]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        suspendedRef.current = false;
        retriesRef.current = 0;
        if (!wsRef.current) connect();
      } else {
        suspendedRef.current = true;
        clearReconnectTimer();
        wsRef.current?.close();
        wsRef.current = null;
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.remove();
      clearReconnectTimer();
      wsRef.current?.close();
    };
  }, [connect]);
}
