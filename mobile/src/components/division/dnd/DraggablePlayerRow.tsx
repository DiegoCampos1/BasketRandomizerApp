import { Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  measure,
  withTiming,
} from "react-native-reanimated";

import PlayerRow from "@/components/division/PlayerRow";
import { useDrag, type DragZone } from "@/components/division/dnd/DragContext";
import type { TeamPlayer } from "@/types/division";

interface DraggablePlayerRowProps {
  teamPlayer: TeamPlayer;
  teamId: string;
  hideStars?: boolean;
  accessibilityHint: string;
  onTap: () => void;
}

export default function DraggablePlayerRow({
  teamPlayer,
  teamId,
  hideStars,
  accessibilityHint,
  onTap,
}: DraggablePlayerRowProps) {
  const {
    dragging,
    overlayX,
    overlayY,
    overlayWidth,
    overlayHeight,
    pointerY,
    hoveredTeamId,
    zones,
    scrollY,
    scrollYAtDragStart,
    startDrag,
    endDrag,
    notifyHoverChange,
  } = useDrag();

  const rowRef = useAnimatedRef<Animated.View>();
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const isBeingDragged = dragging?.teamPlayer.id === teamPlayer.id;

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart((event) => {
      const frame = measure(rowRef);
      if (frame) {
        startX.value = frame.pageX;
        startY.value = frame.pageY;
        overlayX.value = frame.pageX;
        overlayY.value = frame.pageY;
        overlayWidth.value = frame.width;
        overlayHeight.value = frame.height;
      }
      pointerY.value = event.absoluteY;
      runOnJS(startDrag)(
        { teamPlayer, sourceTeamId: teamId },
        event.absoluteX,
        event.absoluteY
      );
    })
    .onUpdate((event) => {
      overlayX.value = startX.value + event.translationX;
      overlayY.value = startY.value + event.translationY;
      pointerY.value = event.absoluteY;

      // Hit-test against zones measured at drag start, corrected by the
      // amount scrolled since then.
      const scrollDelta = scrollY.value - scrollYAtDragStart.value;
      const zoneMap = zones.value;
      let hovered = "";
      for (const id in zoneMap) {
        const zone = zoneMap[id] as DragZone;
        const top = zone.y - scrollDelta;
        if (
          event.absoluteY >= top &&
          event.absoluteY <= top + zone.height &&
          event.absoluteX >= zone.x &&
          event.absoluteX <= zone.x + zone.width
        ) {
          hovered = id;
          break;
        }
      }
      if (hovered !== hoveredTeamId.value) {
        hoveredTeamId.value = hovered;
        if (hovered !== "") {
          runOnJS(notifyHoverChange)();
        }
      }
    })
    .onEnd(() => {
      runOnJS(endDrag)(hoveredTeamId.value || null);
    })
    .onFinalize((_event, success) => {
      if (!success) {
        runOnJS(endDrag)(null);
      }
    });

  const dimStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isBeingDragged ? 0.3 : 1, { duration: 150 }),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View ref={rowRef} style={dimStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={teamPlayer.player.name}
          accessibilityHint={accessibilityHint}
          onPress={onTap}
        >
          <PlayerRow teamPlayer={teamPlayer} hideStars={hideStars} showDragHandle />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
