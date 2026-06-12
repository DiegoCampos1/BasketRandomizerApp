import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import Chip from "@/components/ui/Chip";
import StarRating from "@/components/ui/StarRating";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { colors, radius, spacing } from "@/theme/tokens";
import type { Player } from "@/types/player";

interface SelectablePlayerCardProps {
  player: Player;
  selected: boolean;
  onToggle: () => void;
}

export default function SelectablePlayerCard({
  player,
  selected,
  onToggle,
}: SelectablePlayerCardProps) {
  const { positionLabels, heightCategoryLabels } = usePlayerLabels();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${player.name}, ${positionLabels[player.position]}, ${heightCategoryLabels[player.height_category]}, ${player.quality} estrelas`}
      onPress={() => {
        Haptics.selectionAsync();
        onToggle();
      }}
      style={{
        backgroundColor: selected ? colors.brand.tint : colors.bg.raised,
        borderRadius: radius.card,
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? colors.brand[500] : colors.border.hairline,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
      }}
    >
      <View style={{ flex: 1, gap: spacing.xs }}>
        <AppText variant="headline" numberOfLines={1}>
          {player.name}
        </AppText>
        <View style={{ flexDirection: "row", gap: spacing.xs + 2 }}>
          <Chip label={positionLabels[player.position]} variant="outlined" />
          <Chip label={heightCategoryLabels[player.height_category]} variant="filled" />
        </View>
      </View>
      <StarRating value={player.quality} />
      {selected && (
        <Animated.View entering={ZoomIn.springify().damping(12).stiffness(220)}>
          <Ionicons name="checkmark-circle" size={22} color={colors.brand[500]} />
        </Animated.View>
      )}
    </Pressable>
  );
}
