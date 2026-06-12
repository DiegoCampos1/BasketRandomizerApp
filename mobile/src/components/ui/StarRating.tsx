import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { colors, spacing } from "@/theme/tokens";

interface StarRatingProps {
  value: number;
  size?: number;
}

/** Read-only star display. The interactive input lives in the player form sheet. */
export default function StarRating({ value, size = 14 }: StarRatingProps) {
  return (
    <View
      accessibilityLabel={`${value} de 5 estrelas`}
      style={{ flexDirection: "row", gap: spacing.xs / 2 }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= value ? "star" : "star-outline"}
          size={size}
          color={star <= value ? colors.star.gold : colors.star.empty}
        />
      ))}
    </View>
  );
}
