import { Text, type TextProps } from "react-native";

import { colors, type } from "@/theme/tokens";

type Variant = keyof typeof type;
type Tone = "primary" | "secondary" | "tertiary" | "disabled" | "onBrand" | "brand";

const toneColor: Record<Tone, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  tertiary: colors.text.tertiary,
  disabled: colors.text.disabled,
  onBrand: colors.text.onBrand,
  brand: colors.brand[500],
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  color?: string;
  uppercase?: boolean;
  tabular?: boolean;
}

const MAX_SCALE: Partial<Record<Variant, number>> = {
  displayXl: 1.4,
  display: 1.4,
  stat: 1.4,
  title1: 1.6,
  title2: 1.6,
};

export default function AppText({
  variant = "body",
  tone = "primary",
  color,
  uppercase,
  tabular,
  style,
  children,
  ...rest
}: AppTextProps) {
  const upper =
    uppercase ?? (variant === "displayXl" || variant === "display" || variant === "micro");
  return (
    <Text
      maxFontSizeMultiplier={MAX_SCALE[variant] ?? 2}
      {...rest}
      style={[
        type[variant],
        { color: color ?? toneColor[tone] },
        tabular && { fontVariant: ["tabular-nums"] },
        style,
      ]}
    >
      {upper && typeof children === "string" ? children.toUpperCase() : children}
    </Text>
  );
}
