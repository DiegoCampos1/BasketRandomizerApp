"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../queryKeys";
import { getAccessToken } from "@/lib/api/client";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const token = getAccessToken();
    if (!token) return;

    const ws = new WebSocket(
      `${WS_BASE}/notifications/?token=${token}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (
          data.type === "new_notification" ||
          data.type === "unread_count_update"
        ) {
          queryClient.invalidateQueries({
            queryKey: notificationKeys.all,
          });
        }
      } catch {
        // Malformed message; ignore
      }
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      if (!mountedRef.current) return;

      // 4401 = auth failed; do not retry
      if (event.code === 4401) return;

      const delay =
        RECONNECT_DELAYS[
          Math.min(retriesRef.current, RECONNECT_DELAYS.length - 1)
        ];
      retriesRef.current += 1;
      setTimeout(connect, delay);
    };

    ws.onerror = () => {
      // onerror is always followed by onclose; reconnection handled there
    };
  }, [queryClient]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
    };
  }, [connect]);
}
