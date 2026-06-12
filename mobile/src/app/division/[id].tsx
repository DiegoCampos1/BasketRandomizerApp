import Ionicons from "@expo/vector-icons/Ionicons";
import { type BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import MovePlayerSheet from "@/components/division/MovePlayerSheet";
import TeamCard from "@/components/division/TeamCard";
import { DragProvider } from "@/components/division/dnd/DragContext";
import DragOverlay from "@/components/division/dnd/DragOverlay";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import CountUpText from "@/components/ui/CountUpText";
import Screen from "@/components/ui/Screen";
import { useDivision } from "@/hooks/divisions/useDivisions";
import { useDivisionMutations } from "@/hooks/divisions/useDivisionMutations";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { currentLocale } from "@/i18n";
import { shareDivisionText, shareViewAsImage } from "@/lib/share";
import { translateTeamName } from "@/lib/teamNames";
import { getTeamIdentity } from "@/theme/teamColors";
import { colors, spacing } from "@/theme/tokens";
import type { Team, TeamPlayer } from "@/types/division";

const REVEAL_BASE_DELAY = 200;
const REVEAL_STAGGER = 350;

function ScoreboardPair({
  left,
  right,
  delay,
  translateName,
}: {
  left: Team;
  right: Team;
  delay: number;
  translateName: (name: string) => string;
}) {
  const leftIdentity = getTeamIdentity(left);
  const rightIdentity = getTeamIdentity(right);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.lg,
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-end", gap: 2 }}>
        <AppText variant="title2" color={leftIdentity.accent} numberOfLines={1}>
          {translateName(left.name)}
        </AppText>
        <CountUpText value={left.total_quality} delay={delay} />
      </View>
      <AppText variant="title1" tone="tertiary">
        ✕
      </AppText>
      <View style={{ flex: 1, alignItems: "flex-start", gap: 2 }}>
        <AppText variant="title2" color={rightIdentity.accent} numberOfLines={1}>
          {translateName(right.name)}
        </AppText>
        <CountUpText value={right.total_quality} delay={delay} />
      </View>
    </View>
  );
}

export default function DivisionResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation("division");
  const router = useRouter();
  const { positionLabels } = usePlayerLabels();
  const { data: division, isLoading } = useDivision(id);
  const { movePlayer } = useDivisionMutations();

  const [error, setError] = useState("");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [moveTarget, setMoveTarget] = useState<{
    teamPlayer: TeamPlayer;
    sourceTeamId: string;
  } | null>(null);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const captureViewRef = useRef<View>(null);
  const moveSheetRef = useRef<BottomSheetModal>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    "worklet";
    scrollY.value = event.contentOffset.y;
  });

  const handleMove = async (
    teamPlayerId: string,
    _sourceTeamId: string,
    targetTeamId: string
  ) => {
    if (!division) return;
    setError("");
    try {
      await movePlayer.mutateAsync({
        divisionId: division.id,
        data: { team_player_id: teamPlayerId, target_team_id: targetTeamId },
      });
      Haptics.selectionAsync();
    } catch {
      setError(t("errors.moveError"));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleShareImage = async () => {
    setCapturing(true);
    // Let the stars-hidden state paint before capturing.
    await new Promise((resolve) => setTimeout(resolve, 80));
    try {
      await shareViewAsImage(captureViewRef);
    } finally {
      setCapturing(false);
    }
  };

  const handleShareText = () => {
    if (!division) return;
    shareDivisionText(division, t, positionLabels, currentLocale());
  };

  if (isLoading || !division) {
    return (
      <Screen style={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.brand[500]} />
      </Screen>
    );
  }

  const teams = division.teams;
  const pairs: [Team, Team][] = [];
  if (teams.length === 4) {
    const byName = (suffix: string) => teams.filter((team) => team.name.endsWith(suffix));
    const ones = byName("1");
    const twos = byName("2");
    if (ones.length === 2) pairs.push([ones[0]!, ones[1]!]);
    if (twos.length === 2) pairs.push([twos[0]!, twos[1]!]);
  } else if (teams.length === 2) {
    pairs.push([teams[0]!, teams[1]!]);
  }

  const lastRevealDelay = REVEAL_BASE_DELAY + (teams.length - 1) * REVEAL_STAGGER;

  return (
    <Screen noGutter>
      <DragProvider
        onMove={handleMove}
        scrollRef={scrollRef}
        scrollY={scrollY}
        onScrollEnabledChange={setScrollEnabled}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.gutter,
            paddingBottom: spacing.sm,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("newDivision")}
            onPress={() => router.back()}
            hitSlop={8}
            style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.secondary} />
            <AppText variant="caption" tone="secondary">
              {t("newDivision")}
            </AppText>
          </Pressable>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("share.screenshot")}
              onPress={handleShareImage}
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
              <Ionicons name="image-outline" size={20} color={colors.text.secondary} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("share.copyText")}
              onPress={handleShareText}
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
              <Ionicons name="share-social-outline" size={20} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>

        {error ? (
          <View
            style={{
              marginHorizontal: spacing.gutter,
              marginBottom: spacing.sm,
              backgroundColor: colors.errorTint,
              borderRadius: 12,
              padding: spacing.md,
            }}
          >
            <AppText variant="caption" color={colors.error}>
              {error}
            </AppText>
          </View>
        ) : null}

        <Animated.ScrollView
          ref={scrollRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          scrollEnabled={scrollEnabled}
          contentContainerStyle={{
            paddingHorizontal: spacing.gutter,
            paddingBottom: spacing["5xl"],
          }}
        >
          <View
            ref={captureViewRef}
            collapsable={false}
            style={{ backgroundColor: colors.bg.base, gap: spacing.lg, paddingVertical: spacing.sm }}
          >
            <Animated.View entering={FadeInDown.duration(280)}>
              <AppText variant="display" style={{ textAlign: "center" }}>
                {t("resultTitle")}
              </AppText>
              <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                {pairs.map(([left, right], index) => (
                  <ScoreboardPair
                    key={`${left.id}-${right.id}`}
                    left={left}
                    right={right}
                    delay={REVEAL_BASE_DELAY + index * REVEAL_STAGGER}
                    translateName={(name) => translateTeamName(name, t)}
                  />
                ))}
              </View>
            </Animated.View>

            <AppText variant="caption" tone="tertiary" style={{ textAlign: "center" }}>
              {t("dnd.hint")}
            </AppText>

            {teams.map((team, index) => (
              <Animated.View
                key={team.id}
                entering={FadeInDown.duration(420)
                  .delay(REVEAL_BASE_DELAY + index * REVEAL_STAGGER)
                  .springify()
                  .damping(12)
                  .stiffness(220)}
              >
                <TeamCard
                  team={team}
                  qualityLabel={t("team.quality", { value: team.total_quality })}
                  rowHint={t("dnd.rowHint")}
                  hideStars={capturing}
                  onTapPlayer={(teamPlayer, sourceTeamId) => {
                    setMoveTarget({ teamPlayer, sourceTeamId });
                    moveSheetRef.current?.present();
                  }}
                />
              </Animated.View>
            ))}
          </View>

          <Animated.View
            entering={FadeInDown.duration(320).delay(lastRevealDelay + 400)}
            style={{ marginTop: spacing.xl }}
          >
            <Button
              label={t("newDivision")}
              variant="secondary"
              onPress={() => router.back()}
            />
          </Animated.View>
        </Animated.ScrollView>

        <DragOverlay />

        <MovePlayerSheet
          ref={moveSheetRef}
          teamPlayer={moveTarget?.teamPlayer ?? null}
          sourceTeamId={moveTarget?.sourceTeamId ?? null}
          teams={teams}
          onMove={handleMove}
          onDismiss={() => setMoveTarget(null)}
        />
      </DragProvider>
    </Screen>
  );
}
