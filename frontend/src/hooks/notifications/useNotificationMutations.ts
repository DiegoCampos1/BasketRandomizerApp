import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsRead, markAllAsRead } from "@/lib/api/notifications";
import { notificationKeys } from "../queryKeys";

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };

  const read = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: invalidate,
  });

  const readAll = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: invalidate,
  });

  return { markAsRead: read, markAllAsRead: readAll };
}
