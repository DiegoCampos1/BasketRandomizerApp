import { useQuery } from "@tanstack/react-query";

import { getNotifications, getUnreadCount } from "@/api/notifications";
import { notificationKeys } from "@/hooks/queryKeys";

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
}
