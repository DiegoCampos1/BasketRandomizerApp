import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { forwardRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { translateTeamName } from "@/lib/teamNames";
import { getTeamIdentity } from "@/theme/teamColors";
import { colors, radius, spacing } from "@/theme/tokens";
import type { Team, TeamPlayer } from "@/types/division";

interface MovePlayerSheetProps {
  teamPlayer: TeamPlayer | null;
  sourceTeamId: string | null;
  teams: Team[];
  onMove: (teamPlayerId: string, sourceTeamId: string, targetTeamId: string) => void;
  onDismiss: () => void;
}

const MovePlayerSheet = forwardRef<BottomSheetModal, MovePlayerSheetProps>(
  function MovePlayerSheet({ teamPlayer, sourceTeamId, teams, onMove, onDismiss }, ref) {
    const { t } = useTranslation("division");

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.7}
        />
      ),
      []
    );

    const targets = teams.filter((team) => team.id !== sourceTeamId);

    return (
      <BottomSheetModal
        ref={ref}
        onDismiss={onDismiss}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.bg.elevated,
          borderRadius: radius.sheet,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.border.strong, width: 36 }}
      >
        <BottomSheetView
          style={{ padding: spacing.xl, paddingBottom: spacing["4xl"], gap: spacing.md }}
        >
          <AppText variant="title2">
            {t("move.title", { name: teamPlayer?.player.name ?? "" })}
          </AppText>
          {targets.map((team) => {
            const identity = getTeamIdentity(team);
            const displayName = translateTeamName(team.name, t);
            return (
              <Pressable
                key={team.id}
                accessibilityRole="button"
                accessibilityLabel={t("move.toTeam", { team: displayName })}
                onPress={() => {
                  if (teamPlayer && sourceTeamId) {
                    Haptics.selectionAsync();
                    onMove(teamPlayer.id, sourceTeamId, team.id);
                  }
                  (ref as React.RefObject<BottomSheetModal | null>).current?.dismiss();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  backgroundColor: identity.tint,
                  borderRadius: radius.input,
                  borderWidth: 1,
                  borderColor: colors.border.hairline,
                  padding: spacing.lg,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: identity.accent,
                  }}
                />
                <AppText variant="headline" color={identity.accent} style={{ flex: 1 }}>
                  {displayName}
                </AppText>
                <AppText variant="caption" tone="secondary">
                  {t("team.playerCount", { count: team.player_count })}
                </AppText>
              </Pressable>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default MovePlayerSheet;
