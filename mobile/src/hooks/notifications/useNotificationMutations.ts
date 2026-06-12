import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markAllAsRead, markAsRead } from "@/api/notifications";
import { notificationKeys } from "@/hooks/queryKeys";

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markRead = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: invalidate,
  });

  return { markAsRead: markRead, markAllAsRead: markAllRead };
}
