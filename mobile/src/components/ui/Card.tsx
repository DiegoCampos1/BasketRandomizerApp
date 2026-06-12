import { type ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import { usePressScale } from "@/hooks/usePressScale";
import { PRESS_SCALE } from "@/theme/motion";
import { colors, radius, spacing } from "@/theme/tokens";

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const baseStyle: ViewStyle = {
  backgroundColor: colors.bg.raised,
  borderRadius: radius.card,
  borderWidth: 1,
  borderColor: colors.border.hairline,
  padding: spacing.lg,
};

export default function Card({ children, onPress, style, accessibilityLabel }: CardProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(PRESS_SCALE.card);

  if (!onPress) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[baseStyle, animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
