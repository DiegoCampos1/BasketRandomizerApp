import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import PlayerRow from "@/components/division/PlayerRow";
import { useDrag } from "@/components/division/dnd/DragContext";
import { colors } from "@/theme/tokens";

/** Floating clone of the dragged row, rendered above everything. */
export default function DragOverlay() {
  const { dragging, overlayX, overlayY, overlayWidth } = useDrag();

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: overlayX.value },
      { translateY: overlayY.value },
      { scale: 1.04 },
      { rotateZ: "1deg" },
    ],
    width: overlayWidth.value,
  }));

  if (!dragging) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { zIndex: 100 },
      ]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            borderRadius: 10,
            backgroundColor: colors.bg.elevated,
            borderWidth: 1,
            borderColor: colors.border.strong,
            shadowColor: colors.brand.glow,
            shadowOpacity: 1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 0 },
            elevation: 16,
          },
          style,
        ]}
      >
        <PlayerRow teamPlayer={dragging.teamPlayer} showDragHandle />
      </Animated.View>
    </Animated.View>
  );
}
