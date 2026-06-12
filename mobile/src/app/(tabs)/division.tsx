import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SelectablePlayerCard from "@/components/division/SelectablePlayerCard";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import Screen from "@/components/ui/Screen";
import { useDivisionMutations } from "@/hooks/divisions/useDivisionMutations";
import { usePlayers } from "@/hooks/players/usePlayers";
import { matchesQuery } from "@/lib/text";
import { colors, radius, spacing } from "@/theme/tokens";
import type { DivisionMode } from "@/types/division";

const MAX_PLAYERS = 20;

export default function DivisionScreen() {
  const { t } = useTranslation("division");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: allPlayers = [] } = usePlayers();
  const { createDivision } = useDivisionMutations();

  const players = useMemo(
    () => allPlayers.filter((p) => p.active && p.is_approved),
    [allPlayers]
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<DivisionMode>("2_teams");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const visiblePlayers = useMemo(
    () => players.filter((p) => matchesQuery(p.name, search)),
    [players, search]
  );

  const togglePlayer = (id: string) => {
    if (!selectedIds.has(id) && selectedIds.size >= MAX_PLAYERS) {
      setError(t("errors.maxPlayers", { max: MAX_PLAYERS }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError("");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const next = new Set(selectedIds);
    for (const player of visiblePlayers) {
      if (next.size >= MAX_PLAYERS) break;
      next.add(player.id);
    }
    setSelectedIds(next);
    const allVisibleSelected = visiblePlayers.every((p) => next.has(p.id));
    setError(allVisibleSelected ? "" : t("errors.maxSelected", { max: MAX_PLAYERS }));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    setError("");
  };

  const minPlayers = mode === "2_teams" ? 4 : 8;

  const handleDivide = async () => {
    setError("");
    if (selectedIds.size < minPlayers) {
      setError(
        t("errors.minPlayers", {
          min: minPlayers,
          teams: mode === "2_teams" ? "2" : "4",
        })
      );
      return;
    }

    try {
      const division = await createDivision.mutateAsync({
        player_ids: Array.from(selectedIds),
        mode,
        date: new Date().toISOString().split("T")[0]!,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedIds(new Set());
      router.push(`/division/${division.id}`);
    } catch {
      setError(t("errors.divisionError"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const bottomBarHeight = 76 + insets.bottom;

  return (
    <Screen noGutter>
      <View style={{ paddingHorizontal: spacing.gutter, gap: spacing.md }}>
        <AppText variant="display">{t("title")}</AppText>

        {/* Mode selector */}
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          {(["2_teams", "4_teams"] as const).map((m) => {
            const selected = mode === m;
            return (
              <Pressable
                key={m}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setMode(m);
                }}
                style={{
                  flex: 1,
                  borderRadius: radius.card,
                  borderWidth: selected ? 1.5 : 1,
                  borderColor: selected ? colors.brand[500] : colors.border.hairline,
                  backgroundColor: selected ? colors.brand.tint : colors.bg.raised,
                  padding: spacing.md,
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <AppText
                  variant="title2"
                  color={selected ? colors.brand[300] : colors.text.secondary}
                >
                  {m === "2_teams" ? t("twoTeams") : t("fourTeams")}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("search.placeholder")}
          clearLabel={t("search.clear")}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable onPress={selectAll} hitSlop={8} accessibilityRole="button">
            <AppText variant="caption" tone="brand">
              {t("selectAll")}
            </AppText>
          </Pressable>
          <Pressable onPress={deselectAll} hitSlop={8} accessibilityRole="button">
            <AppText variant="caption" tone="secondary">
              {t("clear")}
            </AppText>
          </Pressable>
        </View>

        {error ? (
          <View
            style={{
              backgroundColor: colors.errorTint,
              borderRadius: radius.input,
              padding: spacing.md,
            }}
          >
            <AppText variant="caption" color={colors.error}>
              {error}
            </AppText>
          </View>
        ) : null}
      </View>

      {visiblePlayers.length === 0 && search.trim() !== "" ? (
        <View style={{ flex: 1, alignItems: "center", paddingTop: spacing["4xl"] }}>
          <AppText variant="body" tone="secondary">
            {t("search.noResults", { query: search.trim() })}
          </AppText>
        </View>
      ) : (
        <FlashList
          data={visiblePlayers}
          extraData={selectedIds}
          keyExtractor={(player) => player.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.gutter,
            paddingTop: spacing.md,
            paddingBottom: bottomBarHeight + spacing.xl,
          }}
          renderItem={({ item }) => (
            <View style={{ paddingBottom: 10 }}>
              <SelectablePlayerCard
                player={item}
                selected={selectedIds.has(item.id)}
                onToggle={() => togglePlayer(item.id)}
              />
            </View>
          )}
        />
      )}

      {/* Floating bottom bar */}
      <View
        style={{
          position: "absolute",
          left: spacing.gutter,
          right: spacing.gutter,
          bottom: insets.bottom + spacing.md,
          backgroundColor: colors.bg.elevated,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: colors.border.strong,
          padding: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.lg,
          shadowColor: "#000",
          shadowOpacity: 0.45,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 16,
        }}
      >
        <View style={{ gap: 2 }}>
          <AppText variant="stat" tabular style={{ fontSize: 24, lineHeight: 28 }}>
            {`${selectedIds.size}/${MAX_PLAYERS}`}
          </AppText>
          <View
            style={{
              width: 72,
              height: 3,
              borderRadius: 2,
              backgroundColor: colors.border.strong,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${Math.min(100, (selectedIds.size / minPlayers) * 100)}%`,
                height: 3,
                backgroundColor:
                  selectedIds.size >= minPlayers ? colors.success : colors.brand[500],
              }}
            />
          </View>
        </View>
        <Button
          label={createDivision.isPending ? t("dividing") : t("divideButton")}
          size="lg"
          style={{ flex: 1 }}
          loading={createDivision.isPending}
          disabled={selectedIds.size < minPlayers}
          onPress={handleDivide}
        />
      </View>
    </Screen>
  );
}
