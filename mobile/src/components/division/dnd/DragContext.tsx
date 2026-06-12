import * as Haptics from "expo-haptics";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { View, useWindowDimensions } from "react-native";
import type Animated from "react-native-reanimated";
import {
  scrollTo,
  useFrameCallback,
  useSharedValue,
  type AnimatedRef,
  type SharedValue,
} from "react-native-reanimated";

import type { TeamPlayer } from "@/types/division";

export interface DragZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ActiveDrag {
  teamPlayer: TeamPlayer;
  sourceTeamId: string;
}

interface DragContextValue {
  /** Currently dragged player (React state — drives overlay content). */
  dragging: ActiveDrag | null;
  /** Absolute window coords of the overlay's top-left corner. */
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  overlayWidth: SharedValue<number>;
  overlayHeight: SharedValue<number>;
  pointerY: SharedValue<number>;
  /** Team id currently hovered ("" = none). */
  hoveredTeamId: SharedValue<string>;
  /** Window-coord zones captured at drag start. */
  zones: SharedValue<Record<string, DragZone>>;
  scrollY: SharedValue<number>;
  scrollYAtDragStart: SharedValue<number>;
  dragActive: SharedValue<boolean>;
  registerTeam: (teamId: string, ref: RefObject<View | null>) => void;
  startDrag: (drag: ActiveDrag, grabX: number, grabY: number) => void;
  endDrag: (targetTeamId: string | null) => void;
  notifyHoverChange: () => void;
  setScrollEnabled: (enabled: boolean) => void;
  scrollRef: AnimatedRef<Animated.ScrollView>;
}

const DragContext = createContext<DragContextValue | null>(null);

export function useDrag(): DragContextValue {
  const value = useContext(DragContext);
  if (!value) throw new Error("useDrag must be used inside DragProvider");
  return value;
}

interface DragProviderProps {
  children: ReactNode;
  onMove: (teamPlayerId: string, sourceTeamId: string, targetTeamId: string) => void;
  scrollRef: AnimatedRef<Animated.ScrollView>;
  scrollY: SharedValue<number>;
  onScrollEnabledChange: (enabled: boolean) => void;
}

const EDGE_TOP = 140;
const EDGE_BOTTOM = 120;
const MAX_SCROLL_SPEED = 14;

export function DragProvider({
  children,
  onMove,
  scrollRef,
  scrollY,
  onScrollEnabledChange,
}: DragProviderProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [dragging, setDragging] = useState<ActiveDrag | null>(null);
  const teamRefs = useRef(new Map<string, RefObject<View | null>>());

  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const overlayWidth = useSharedValue(0);
  const overlayHeight = useSharedValue(0);
  const pointerY = useSharedValue(0);
  const hoveredTeamId = useSharedValue("");
  const zones = useSharedValue<Record<string, DragZone>>({});
  const scrollYAtDragStart = useSharedValue(0);
  const dragActive = useSharedValue(false);

  const registerTeam = useCallback((teamId: string, ref: RefObject<View | null>) => {
    teamRefs.current.set(teamId, ref);
  }, []);

  const setScrollEnabled = useCallback(
    (enabled: boolean) => {
      onScrollEnabledChange(enabled);
    },
    [onScrollEnabledChange]
  );

  const startDrag = useCallback(
    (drag: ActiveDrag, _grabX: number, _grabY: number) => {
      // Measure all team zones in window coordinates at drag start; during
      // the drag they are corrected by the scroll delta on the UI thread.
      const measured: Record<string, DragZone> = {};
      const entries = Array.from(teamRefs.current.entries());
      let remaining = entries.length;

      entries.forEach(([teamId, ref]) => {
        const node = ref.current;
        if (!node) {
          remaining -= 1;
          return;
        }
        node.measureInWindow((x, y, width, height) => {
          measured[teamId] = { x, y, width, height };
          remaining -= 1;
          if (remaining === 0) {
            zones.value = measured;
          }
        });
      });

      scrollYAtDragStart.value = scrollY.value;
      dragActive.value = true;
      setDragging(drag);
      onScrollEnabledChange(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [zones, scrollY, scrollYAtDragStart, dragActive, onScrollEnabledChange]
  );

  const endDrag = useCallback(
    (targetTeamId: string | null) => {
      const current = dragging;
      dragActive.value = false;
      hoveredTeamId.value = "";
      setDragging(null);
      onScrollEnabledChange(true);
      if (current && targetTeamId && targetTeamId !== current.sourceTeamId) {
        onMove(current.teamPlayer.id, current.sourceTeamId, targetTeamId);
      }
    },
    [dragging, onMove, onScrollEnabledChange, dragActive, hoveredTeamId]
  );

  const notifyHoverChange = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  // Edge auto-scroll while dragging.
  useFrameCallback(() => {
    "worklet";
    if (!dragActive.value) return;
    const y = pointerY.value;
    let speed = 0;
    if (y < EDGE_TOP) {
      speed = -MAX_SCROLL_SPEED * Math.min(1, (EDGE_TOP - y) / EDGE_TOP);
    } else if (y > windowHeight - EDGE_BOTTOM) {
      speed = MAX_SCROLL_SPEED * Math.min(1, (y - (windowHeight - EDGE_BOTTOM)) / EDGE_BOTTOM);
    }
    if (speed !== 0) {
      scrollTo(scrollRef, 0, Math.max(0, scrollY.value + speed), false);
    }
  });

  const value = useMemo<DragContextValue>(
    () => ({
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
      dragActive,
      registerTeam,
      startDrag,
      endDrag,
      notifyHoverChange,
      setScrollEnabled,
      scrollRef,
    }),
    [
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
      dragActive,
      registerTeam,
      startDrag,
      endDrag,
      notifyHoverChange,
      setScrollEnabled,
      scrollRef,
    ]
  );

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}
