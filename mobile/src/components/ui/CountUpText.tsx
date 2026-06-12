import { useEffect } from "react";
import { TextInput, type TextStyle } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { colors, fonts } from "@/theme/tokens";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface CountUpTextProps {
  value: number;
  delay?: number;
  duration?: number;
  style?: TextStyle;
}

/** Animated 0→N counter rendered through a read-only TextInput. */
export default function CountUpText({
  value,
  delay = 0,
  duration = 600,
  style,
}: CountUpTextProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
     
    progress.value = withDelay(delay, withTiming(value, { duration }));
  }, [value, delay, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    text: String(Math.round(progress.value)),
    defaultValue: String(Math.round(progress.value)),
  }));

  return (
    <AnimatedTextInput
      editable={false}
      animatedProps={animatedProps}
      style={[
        {
          fontFamily: fonts.condensedBold,
          fontSize: 36,
          color: colors.text.primary,
          fontVariant: ["tabular-nums"],
          padding: 0,
        },
        style,
      ]}
    />
  );
}
