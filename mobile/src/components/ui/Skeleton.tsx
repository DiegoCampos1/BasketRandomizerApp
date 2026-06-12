import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors, radius, spacing } from "@/theme/tokens";

function Pulse({ style }: { style?: ViewStyle }) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { backgroundColor: colors.bg.elevated, borderRadius: radius.thumb },
        style,
        animatedStyle,
      ]}
    />
  );
}

/** Player-card shaped loading placeholder. Render 6-8, never spinners. */
export function PlayerCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: colors.bg.raised,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        padding: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
      }}
    >
      <Pulse style={{ width: 40, height: 40, borderRadius: 20 }} />
      <View style={{ flex: 1, gap: spacing.sm }}>
        <Pulse style={{ width: "55%", height: 16 }} />
        <Pulse style={{ width: "75%", height: 12 }} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 7 }: { count?: number }) {
  return (
    <View style={{ gap: 10, paddingHorizontal: spacing.gutter, paddingTop: spacing.md }}>
      {Array.from({ length: count }, (_, index) => (
        <PlayerCardSkeleton key={index} />
      ))}
    </View>
  );
}
