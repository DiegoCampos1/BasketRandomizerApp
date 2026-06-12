import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Screen from "@/components/ui/Screen";
import { useDivisions } from "@/hooks/divisions/useDivisions";
import { currentLocale } from "@/i18n";
import { colors, spacing } from "@/theme/tokens";

export default function HistoryScreen() {
  const { t } = useTranslation("history");
  const router = useRouter();
  const { data: divisions = [], isRefetching, refetch } = useDivisions();

  return (
    <Screen noGutter>
      <View style={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.md }}>
        <AppText variant="display">{t("title")}</AppText>
      </View>

      {divisions.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <AppText variant="body" tone="secondary">
            {t("empty")}
          </AppText>
        </View>
      ) : (
        <FlashList
          data={divisions}
          keyExtractor={(division) => division.id}
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
            const dateStr = new Date(item.date).toLocaleDateString(currentLocale());
            return (
              <View style={{ flexDirection: "row", paddingBottom: 10 }}>
                {/* Timeline rail */}
                <View style={{ width: 20, alignItems: "center" }}>
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      backgroundColor: colors.border.hairline,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 26,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.team.red,
                    }}
                  />
                </View>
                <Card
                  style={{ flex: 1, marginLeft: spacing.sm }}
                  onPress={() => router.push(`/history/${item.id}`)}
                  accessibilityLabel={`${dateStr}, ${t("createdBy", { name: item.created_by_name })}`}
                >
                  <View style={{ gap: spacing.sm }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <AppText variant="title2">{dateStr}</AppText>
                      <Chip
                        label={item.mode === "2_teams" ? t("twoTeams") : t("fourTeams")}
                        variant="accent"
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <AppText variant="caption" tone="secondary">
                        {t("createdBy", { name: item.created_by_name })}
                      </AppText>
                      <AppText variant="caption" tone="tertiary">
                        {t("playerCount", { count: item.player_count })}
                      </AppText>
                    </View>
                  </View>
                </Card>
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
}
