import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { Pressable, View } from "react-native";

import { colors, spacing } from "@/theme/tokens";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

/** Interactive star input — 44pt touch targets, selection haptic per change. */
export default function StarRatingInput({ value, onChange, size = 32 }: StarRatingInputProps) {
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={`Qualidade: ${value} de 5 estrelas`}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(event) => {
        const next =
          event.nativeEvent.actionName === "increment"
            ? Math.min(5, value + 1)
            : Math.max(1, value - 1);
        onChange(next);
      }}
      style={{ flexDirection: "row", gap: spacing.sm }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          hitSlop={6}
          onPress={() => {
            if (star !== value) {
              Haptics.selectionAsync();
              onChange(star);
            }
          }}
        >
          <Ionicons
            name={star <= value ? "star" : "star-outline"}
            size={size}
            color={star <= value ? colors.star.gold : colors.star.empty}
          />
        </Pressable>
      ))}
    </View>
  );
}
