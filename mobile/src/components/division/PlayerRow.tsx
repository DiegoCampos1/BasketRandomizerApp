import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import AppText from "@/components/ui/AppText";
import Chip from "@/components/ui/Chip";
import StarRating from "@/components/ui/StarRating";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { colors, radius, spacing } from "@/theme/tokens";
import type { TeamPlayer } from "@/types/division";

interface PlayerRowProps {
  teamPlayer: TeamPlayer;
  hideStars?: boolean;
  showDragHandle?: boolean;
}

/** Pure visual row, shared between the team card and the drag overlay. */
export default function PlayerRow({ teamPlayer, hideStars, showDragHandle }: PlayerRowProps) {
  const { positionLabels, heightCategoryLabels } = usePlayerLabels();
  const { player } = teamPlayer;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.bg.raised,
        borderRadius: radius.thumb,
        paddingVertical: spacing.sm + 2,
        paddingHorizontal: spacing.md,
      }}
    >
      {showDragHandle && (
        <Ionicons name="reorder-two" size={18} color={colors.text.tertiary} />
      )}
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {player.name}
        </AppText>
        <View style={{ flexDirection: "row", gap: spacing.xs + 2 }}>
          <Chip label={positionLabels[player.position]} variant="outlined" />
          <Chip label={heightCategoryLabels[player.height_category]} variant="filled" />
        </View>
      </View>
      {!hideStars && <StarRating value={player.quality} size={12} />}
    </View>
  );
}
