import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import PlayerRow from "@/components/division/PlayerRow";
import AppText from "@/components/ui/AppText";
import Chip from "@/components/ui/Chip";
import Screen from "@/components/ui/Screen";
import { useDivision } from "@/hooks/divisions/useDivisions";
import { currentLocale } from "@/i18n";
import { getTeamIdentity } from "@/theme/teamColors";
import { colors, radius, spacing } from "@/theme/tokens";

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation("history");
  const router = useRouter();
  const { data: division, isLoading } = useDivision(id);

  if (isLoading || !division) {
    return (
      <Screen style={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.brand[500]} />
      </Screen>
    );
  }

  const dateStr = new Date(division.date).toLocaleDateString(currentLocale());
  const teamsLabel =
    division.mode === "2_teams" ? t("twoTeams") : t("fourTeams");

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("detail.back")}
        onPress={() => router.back()}
        hitSlop={8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xs,
          marginBottom: spacing.md,
        }}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text.secondary} />
        <AppText variant="caption" tone="secondary">
          {t("detail.back")}
        </AppText>
      </Pressable>

      <AppText variant="display">{t("detail.title", { date: dateStr })}</AppText>
      <AppText variant="caption" tone="secondary" style={{ marginBottom: spacing.lg }}>
        {t("detail.subtitle", { teams: teamsLabel, name: division.created_by_name })}
      </AppText>

      <ScrollView
        contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing["4xl"] }}
        showsVerticalScrollIndicator={false}
      >
        {division.teams.map((team) => {
          const identity = getTeamIdentity(team);
          return (
            <View
              key={team.id}
              style={{
                backgroundColor: colors.bg.raised,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.border.hairline,
                overflow: "hidden",
              }}
            >
              <View style={{ height: 4, backgroundColor: identity.accent }} />
              <LinearGradient
                colors={[identity.headerGradient[0], identity.headerGradient[1]]}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                }}
              >
                <AppText variant="title2" color={identity.accent}>
                  {team.name}
                </AppText>
                <Chip label={t("detail.quality", { value: team.total_quality })} variant="team" color={identity.accent} />
              </LinearGradient>
              <View style={{ padding: spacing.md, gap: spacing.sm }}>
                {[...team.team_players]
                  .sort((a, b) => a.order - b.order)
                  .map((teamPlayer) => (
                    <PlayerRow key={teamPlayer.id} teamPlayer={teamPlayer} />
                  ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
