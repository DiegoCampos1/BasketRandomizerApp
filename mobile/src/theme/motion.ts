/**
 * Motion language — one physics system for the whole app.
 * gentle: sheets, layout reflow, drag return
 * snappy: press feedback, selection, tab indicator, hover
 * bouncy: reveals, check pops, success moments
 */
import { Easing } from "react-native-reanimated";

export const springs = {
  gentle: { damping: 20, stiffness: 180, mass: 1 },
  snappy: { damping: 18, stiffness: 280, mass: 0.8 },
  bouncy: { damping: 12, stiffness: 220, mass: 0.9 },
} as const;

export const timing = {
  micro: 120,
  standard: 200,
  entrance: 320,
} as const;

export const easing = {
  enter: Easing.bezier(0.2, 0, 0, 1),
  exit: Easing.bezier(0.3, 0, 1, 1),
} as const;

/** List entrance stagger: FadeInDown.duration(320).delay(index * STAGGER_MS), capped. */
export const STAGGER_MS = 40;
export const STAGGER_CAP = 8;

export const PRESS_SCALE = {
  button: 0.96,
  card: 0.97,
} as const;
