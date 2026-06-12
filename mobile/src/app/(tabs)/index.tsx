import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import { setLocale, currentLocale } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing } from "@/theme/tokens";

export default function DashboardScreen() {
  const { t } = useTranslation("dashboard");
  const { t: tl } = useTranslation("layout");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const orgName = user?.organization?.name ?? "";
  const firstName = user?.first_name || user?.email || "";

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(320)} style={{ gap: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <AppText variant="micro" tone="brand">
              {`Game Day · ${orgName}`}
            </AppText>
            <AppText variant="display">{t("greeting", { name: firstName })}</AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tl("logout")}
            onPress={() => logout()}
            hitSlop={8}
            style={{ padding: spacing.sm }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.text.secondary} />
          </Pressable>
        </View>
        <Card>
          <AppText variant="stat" tabular>
            —
          </AppText>
          <AppText variant="caption" tone="secondary">
            {t("registeredPlayers")}
          </AppText>
        </Card>
        <Button
          label={currentLocale() === "pt-BR" ? "Switch to English" : "Mudar para Português"}
          variant="secondary"
          onPress={() => setLocale(currentLocale() === "pt-BR" ? "en" : "pt-BR")}
        />
      </Animated.View>
    </Screen>
  );
}
