import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { springs } from "@/theme/motion";

/**
 * Press feedback: scales the target down while pressed, springs back on
 * release. Centralizes the Reanimated shared-value writes that the React
 * Compiler lint cannot model (shared values are mutable boxes by design).
 */
export function usePressScale(pressedScale: number) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /* eslint-disable react-hooks/immutability */
  const onPressIn = () => {
    scale.value = withSpring(pressedScale, springs.snappy);
  };
  const onPressOut = () => {
    scale.value = withSpring(1, springs.snappy);
  };
  /* eslint-enable react-hooks/immutability */

  return { animatedStyle, onPressIn, onPressOut };
}
