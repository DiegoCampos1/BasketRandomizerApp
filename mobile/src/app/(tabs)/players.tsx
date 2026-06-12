import Ionicons from "@expo/vector-icons/Ionicons";
import { type BottomSheetModal } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import * as Clipboard from "expo-clipboard";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, RefreshControl, Share, View } from "react-native";

import { WEB_URL } from "@/api/urls";
import PlayerCard from "@/components/players/PlayerCard";
import PlayerFormSheet from "@/components/players/PlayerFormSheet";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import SearchBar from "@/components/ui/SearchBar";
import Screen from "@/components/ui/Screen";
import { SkeletonList } from "@/components/ui/Skeleton";
import { usePlayers } from "@/hooks/players/usePlayers";
import { matchesQuery } from "@/lib/text";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing } from "@/theme/tokens";
import type { Player } from "@/types/player";

type Row =
  | { kind: "header"; key: string; label: string; count: number }
  | { kind: "player"; key: string; player: Player };

export default function PlayersScreen() {
  const { t } = useTranslation("players");
  const user = useAuthStore((s) => s.user);
  const { data: players = [], isLoading, isRefetching, refetch } = usePlayers();
  const [search, setSearch] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const sheetRef = useRef<BottomSheetModal>(null);

  const openCreate = () => {
    setEditingPlayer(null);
    sheetRef.current?.present();
  };

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    sheetRef.current?.present();
  };

  const sharePublicLink = async () => {
    const slug = user?.organization?.slug;
    if (!slug) return;
    const url = `${WEB_URL}/${slug}/addPlayer`;
    await Clipboard.setStringAsync(url);
    await Share.share({ message: url });
  };

  const rows = useMemo<Row[]>(() => {
    const pending = players.filter(
      (p) => !p.is_approved && matchesQuery(p.name, search)
    );
    const approved = players.filter(
      (p) => p.is_approved && matchesQuery(p.name, search)
    );

    const result: Row[] = [];
    if (pending.length > 0) {
      result.push({
        kind: "header",
        key: "pending-header",
        label: t("pending.title"),
        count: pending.length,
      });
      result.push(...pending.map((p): Row => ({ kind: "player", key: p.id, player: p })));
    }
    if (approved.length > 0) {
      if (pending.length > 0) {
        result.push({
          kind: "header",
          key: "approved-header",
          label: t("approved.title"),
          count: approved.length,
        });
      }
      result.push(...approved.map((p): Row => ({ kind: "player", key: p.id, player: p })));
    }
    return result;
  }, [players, search, t]);

  const approvedCount = players.filter((p) => p.is_approved).length;
  const noSearchResults = search.trim() !== "" && rows.length === 0 && players.length > 0;

  return (
    <Screen noGutter>
      <View style={{ paddingHorizontal: spacing.gutter, gap: spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.sm }}>
            <AppText variant="display">{t("title")}</AppText>
            {players.length > 0 && (
              <AppText variant="micro" tone="tertiary">
                {t("registered", { count: approvedCount })}
              </AppText>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("copyTooltip")}
              onPress={sharePublicLink}
              hitSlop={6}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.bg.raised,
                borderWidth: 1,
                borderColor: colors.border.hairline,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="share-outline" size={20} color={colors.text.secondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("addPlayer")}
              onPress={openCreate}
              hitSlop={6}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.brand[500],
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="add" size={24} color={colors.text.onBrand} />
            </Pressable>
          </View>
        </View>

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t("search.placeholder")}
          clearLabel={t("search.clear")}
        />
      </View>

      {isLoading ? (
        <SkeletonList />
      ) : players.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.gutter,
          }}
        >
          <AppText variant="title2" tone="secondary">
            {t("empty.title")}
          </AppText>
          <AppText variant="body" tone="tertiary" style={{ textAlign: "center" }}>
            {t("empty.subtitle")}
          </AppText>
          <Button label={t("empty.addFirst")} variant="secondary" onPress={openCreate} />
        </View>
      ) : noSearchResults ? (
        <View style={{ flex: 1, alignItems: "center", paddingTop: spacing["4xl"] }}>
          <AppText variant="body" tone="secondary">
            {t("search.noResults", { query: search.trim() })}
          </AppText>
        </View>
      ) : (
        <FlashList
          data={rows}
          keyExtractor={(row) => row.key}
          contentContainerStyle={{
            paddingHorizontal: spacing.gutter,
            paddingTop: spacing.md,
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
          renderItem={({ item }) =>
            item.kind === "header" ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                  paddingTop: spacing.lg,
                  paddingBottom: spacing.sm,
                }}
              >
                <AppText variant="title2">{item.label}</AppText>
                <Chip label={String(item.count)} variant="warning" />
              </View>
            ) : (
              <View style={{ paddingBottom: 10 }}>
                <PlayerCard
                  player={item.player}
                  pendingLabel={t("pending.chip")}
                  onPress={() => openEdit(item.player)}
                />
              </View>
            )
          }
        />
      )}

      <PlayerFormSheet
        ref={sheetRef}
        player={editingPlayer}
        onDismiss={() => setEditingPlayer(null)}
      />
    </Screen>
  );
}
