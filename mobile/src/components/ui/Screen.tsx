import { type ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/theme/tokens";

interface ScreenProps {
  children: ReactNode;
  /** Disable the horizontal gutter (e.g. for edge-to-edge lists). */
  noGutter?: boolean;
  /** Extra style for the container. */
  style?: ViewStyle;
}

export default function Screen({ children, noGutter, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.bg.base,
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: noGutter ? 0 : spacing.gutter,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
