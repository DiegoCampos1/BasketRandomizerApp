import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Screen from "@/components/ui/Screen";
import { useNotificationMutations } from "@/hooks/notifications/useNotificationMutations";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { colors, radius, spacing } from "@/theme/tokens";
import type { Notification } from "@/types/notification";

function relativeTime(
  iso: string,
  t: (key: string, options?: Record<string, unknown>) => string
): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t("time.now");
  if (minutes < 60) return t("time.minutesAgo", { minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("time.hoursAgo", { hours });
  return t("time.daysAgo", { days: Math.floor(hours / 24) });
}

export default function NotificationsScreen() {
  const { t } = useTranslation("layout");
  const { t: tc } = useTranslation("common");
  const router = useRouter();
  const { data: notifications = [], isRefetching, refetch } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const handlePress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.type === "player_pending") {
      router.dismiss();
      router.push("/(tabs)/players");
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <Screen noGutter>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.gutter,
          paddingBottom: spacing.md,
        }}
      >
        <AppText variant="display">{t("notifications.title")}</AppText>
        {hasUnread && (
          <Pressable
            accessibilityRole="button"
            onPress={() => markAllAsRead.mutate()}
            hitSlop={8}
          >
            <AppText variant="caption" tone="brand">
              {t("notifications.markAllRead")}
            </AppText>
          </Pressable>
        )}
      </View>

      {notifications.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm }}
        >
          <Ionicons name="notifications-off-outline" size={40} color={colors.text.tertiary} />
          <AppText variant="body" tone="secondary">
            {t("notifications.empty")}
          </AppText>
        </View>
      ) : (
        <FlashList
          data={notifications}
          keyExtractor={(notification) => notification.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.gutter,
            paddingBottom: spacing["4xl"],
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.brand[500]}
              colors={[colors.brand[500]]}
            />
          }
          renderItem={({ item }) => {
            const pending = item.type === "player_pending";
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={() => handlePress(item)}
                style={{
                  flexDirection: "row",
                  gap: spacing.md,
                  alignItems: "center",
                  backgroundColor: item.is_read ? "transparent" : colors.bg.raised,
                  borderRadius: radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: pending ? colors.warningTint : colors.successTint,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={pending ? "person-add-outline" : "checkmark-circle-outline"}
                    size={18}
                    color={pending ? colors.warning : colors.success}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" tone="secondary" numberOfLines={2}>
                    {item.message}
                  </AppText>
                </View>
                <View style={{ alignItems: "flex-end", gap: spacing.xs }}>
                  <AppText variant="micro" tone="tertiary">
                    {relativeTime(item.created_at, tc)}
                  </AppText>
                  {!item.is_read && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.brand[500],
                      }}
                    />
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}
