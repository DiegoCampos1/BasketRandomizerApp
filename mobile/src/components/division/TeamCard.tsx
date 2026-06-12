import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import DraggablePlayerRow from "@/components/division/dnd/DraggablePlayerRow";
import { useDrag } from "@/components/division/dnd/DragContext";
import AppText from "@/components/ui/AppText";
import { getTeamIdentity } from "@/theme/teamColors";
import { colors, radius, spacing } from "@/theme/tokens";
import type { Team, TeamPlayer } from "@/types/division";

interface TeamCardProps {
  team: Team;
  qualityLabel: string;
  playerCountLabel: string;
  rowHint: string;
  hideStars?: boolean;
  onTapPlayer: (teamPlayer: TeamPlayer, sourceTeamId: string) => void;
}

export default function TeamCard({
  team,
  qualityLabel,
  playerCountLabel,
  rowHint,
  hideStars,
  onTapPlayer,
}: TeamCardProps) {
  const identity = getTeamIdentity(team);
  const { registerTeam, hoveredTeamId } = useDrag();
  const containerRef = useRef<View>(null);

  useEffect(() => {
    registerTeam(team.id, containerRef);
  }, [registerTeam, team.id]);

  const hoverStyle = useAnimatedStyle(() => {
    const hovered = hoveredTeamId.value === team.id;
    return {
      borderColor: withTiming(hovered ? identity.accent : colors.border.hairline, {
        duration: 150,
      }),
      borderWidth: 1.5,
    };
  });

  const sorted = [...team.team_players].sort((a, b) => a.order - b.order);

  return (
    <View ref={containerRef} collapsable={false}>
      <Animated.View
        style={[
          {
            backgroundColor: colors.bg.raised,
            borderRadius: radius.card,
            overflow: "hidden",
          },
          hoverStyle,
        ]}
      >
        {/* Accent bar + header strip */}
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
          <View style={{ alignItems: "flex-end" }}>
            <AppText variant="caption" tone="secondary">
              {qualityLabel}
            </AppText>
            <AppText variant="caption" tone="tertiary">
              {playerCountLabel}
            </AppText>
          </View>
        </LinearGradient>

        <Animated.View
          layout={LinearTransition.springify().damping(20).stiffness(180)}
          style={{ padding: spacing.md, gap: spacing.sm }}
        >
          {sorted.map((teamPlayer) => (
            <Animated.View
              key={teamPlayer.id}
              layout={LinearTransition.springify().damping(20).stiffness(180)}
            >
              <DraggablePlayerRow
                teamPlayer={teamPlayer}
                teamId={team.id}
                hideStars={hideStars}
                accessibilityHint={rowHint}
                onTap={() => onTapPlayer(teamPlayer, team.id)}
              />
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>
    </View>
  );
}
