import apiClient, { getAllPages } from "@/api/client";
import type { Notification, UnreadCount } from "@/types/notification";

export async function getNotifications(): Promise<Notification[]> {
  return getAllPages<Notification>("/notifications/");
}

export async function getUnreadCount(): Promise<UnreadCount> {
  const response = await apiClient.get("/notifications/unread-count/");
  return response.data;
}

export async function markAsRead(id: string): Promise<Notification> {
  const response = await apiClient.patch(`/notifications/${id}/`, { is_read: true });
  return response.data;
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.post("/notifications/mark-all-read/");
}
