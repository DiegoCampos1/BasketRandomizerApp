export interface Notification {
  id: string;
  type: "player_pending" | "player_approved";
  title: string;
  message: string;
  related_player_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCount {
  count: number;
}
