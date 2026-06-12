import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { useUnreadCount } from "@/hooks/notifications/useNotifications";
import { colors, fonts } from "@/theme/tokens";

export default function NotificationBell() {
  const { t } = useTranslation("layout");
  const router = useRouter();
  const { data } = useUnreadCount();
  const count = data?.count ?? 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("notifications.title")}${count > 0 ? ` (${count})` : ""}`}
      onPress={() => router.push("/notifications")}
      hitSlop={8}
      style={{ padding: 8 }}
    >
      <Ionicons name="notifications-outline" size={24} color={colors.text.secondary} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            top: 2,
            right: 0,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.brand[500],
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 3,
          }}
        >
          <AppText
            variant="micro"
            color={colors.text.onBrand}
            style={{ fontSize: 10, lineHeight: 12, fontFamily: fonts.bold, letterSpacing: 0 }}
          >
            {count > 99 ? "99+" : String(count)}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
