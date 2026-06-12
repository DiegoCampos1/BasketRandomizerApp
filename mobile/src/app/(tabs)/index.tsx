import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import NotificationBell from "@/components/layout/NotificationBell";
import AppText from "@/components/ui/AppText";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import { useDivisions } from "@/hooks/divisions/useDivisions";
import { usePlayers } from "@/hooks/players/usePlayers";
import { setLocale, currentLocale } from "@/i18n";
import { useAuthStore } from "@/stores/authStore";
import { colors, gradients, radius, spacing } from "@/theme/tokens";

export default function DashboardScreen() {
  const { t } = useTranslation("dashboard");
  const { t: tl } = useTranslation("layout");
  const { t: tp } = useTranslation("players");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const players = usePlayers();
  const divisions = useDivisions();

  const orgName = user?.organization?.name ?? "";
  const firstName = user?.first_name || user?.email || "";
  const pendingCount = (players.data ?? []).filter((p) => !p.is_approved).length;
  const refreshing = players.isRefetching || divisions.isRefetching;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              players.refetch();
              divisions.refetch();
            }}
            tintColor={colors.brand[500]}
            colors={[colors.brand[500]]}
          />
        }
        contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing["4xl"] }}
      >
        <Animated.View entering={FadeInDown.duration(320)}>
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <NotificationBell />
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
          </View>
        </Animated.View>

        {pendingCount > 0 && (
          <Animated.View entering={FadeInDown.duration(320).delay(40)}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/players")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
                backgroundColor: colors.warningTint,
                borderRadius: radius.input,
                padding: spacing.md,
              }}
            >
              <Ionicons name="person-add-outline" size={18} color={colors.warning} />
              <AppText variant="caption" color={colors.warning} style={{ flex: 1 }}>
                {`${tp("pending.title")}: ${pendingCount}`}
              </AppText>
              <Ionicons name="chevron-forward" size={16} color={colors.warning} />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInDown.duration(320).delay(80)}
          style={{ flexDirection: "row", gap: spacing.md }}
        >
          <Card
            style={{ flex: 1 }}
            onPress={() => router.push("/(tabs)/players")}
            accessibilityLabel={t("registeredPlayers")}
          >
            <View style={{ gap: spacing.xs }}>
              <Ionicons name="people" size={20} color={colors.brand[400]} />
              <AppText variant="stat" tabular>
                {String(players.data?.length ?? "—")}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {t("registeredPlayers")}
              </AppText>
            </View>
          </Card>
          <Card
            style={{ flex: 1 }}
            onPress={() => router.push("/(tabs)/history")}
            accessibilityLabel={t("divisionsPerformed")}
          >
            <View style={{ gap: spacing.xs }}>
              <Ionicons name="time" size={20} color={colors.accent[400]} />
              <AppText variant="stat" tabular>
                {String(divisions.data?.length ?? "—")}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {t("divisionsPerformed")}
              </AppText>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(120)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("divideTeams")}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/division");
            }}
          >
            <LinearGradient
              colors={[gradients.brand[0], gradients.brand[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: radius.card,
                padding: spacing.xl,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ gap: 2 }}>
                <AppText variant="title1" color={colors.text.onBrand} uppercase>
                  {t("divideTeams")}
                </AppText>
                <AppText variant="caption" color="rgba(26,11,2,0.75)">
                  {t("buildTeamsToday")}
                </AppText>
              </View>
              <Ionicons name="basketball" size={40} color={colors.text.onBrand} />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(160)}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setLocale(currentLocale() === "pt-BR" ? "en" : "pt-BR")}
            hitSlop={8}
            style={{ alignSelf: "center", padding: spacing.sm }}
          >
            <AppText variant="caption" tone="tertiary">
              {currentLocale() === "pt-BR" ? "🇺🇸 Switch to English" : "🇧🇷 Mudar para Português"}
            </AppText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}
