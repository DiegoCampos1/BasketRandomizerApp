import * as Haptics from "expo-haptics";
import { ActivityIndicator, Pressable, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import { usePressScale } from "@/hooks/usePressScale";
import { PRESS_SCALE } from "@/theme/motion";
import { colors, radius, spacing } from "@/theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "lg" | "md" | "sm";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const HEIGHT: Record<Size, number> = { lg: 52, md: 44, sm: 36 };

const FILL: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.brand[500] },
  secondary: {
    backgroundColor: colors.bg.raised,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  ghost: { backgroundColor: "transparent" },
  destructive: { backgroundColor: colors.errorTint },
};

const LABEL_COLOR: Record<Variant, string> = {
  primary: colors.text.onBrand,
  secondary: colors.text.primary,
  ghost: colors.brand[300],
  destructive: colors.error,
};

export default function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(PRESS_SCALE.button);
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      hitSlop={size === "sm" ? 8 : 0}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => {
        if (variant === "primary") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
    >
      <Animated.View
        style={[
          {
            height: HEIGHT[size],
            borderRadius: radius.pill,
            paddingHorizontal: size === "sm" ? spacing.lg : spacing["2xl"],
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            opacity: disabled ? 0.4 : 1,
          },
          FILL[variant],
          animatedStyle,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={LABEL_COLOR[variant]} />
        ) : (
          <>
            {icon ? <View>{icon}</View> : null}
            <AppText
              variant={size === "sm" ? "caption" : "headline"}
              color={LABEL_COLOR[variant]}
              style={{ fontFamily: "Barlow_600SemiBold" }}
            >
              {label}
            </AppText>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}
