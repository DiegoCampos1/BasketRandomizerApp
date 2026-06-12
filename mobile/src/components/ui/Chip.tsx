import { View, type ViewStyle } from "react-native";

import AppText from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme/tokens";

type Variant = "outlined" | "filled" | "brand" | "accent" | "warning" | "team";

interface ChipProps {
  label: string;
  variant?: Variant;
  /** Accent color when variant="team". */
  color?: string;
  style?: ViewStyle;
}

export default function Chip({ label, variant = "outlined", color, style }: ChipProps) {
  const styles: Record<Variant, { container: ViewStyle; text: string }> = {
    outlined: {
      container: { borderWidth: 1, borderColor: colors.border.hairline },
      text: colors.text.secondary,
    },
    filled: {
      container: { backgroundColor: colors.bg.elevated },
      text: colors.text.secondary,
    },
    brand: {
      container: { backgroundColor: colors.brand.tint },
      text: colors.brand[300],
    },
    accent: {
      container: { backgroundColor: colors.accent.tint },
      text: colors.accent[400],
    },
    warning: {
      container: { backgroundColor: colors.warningTint },
      text: colors.warning,
    },
    team: {
      container: { backgroundColor: colors.bg.elevated },
      text: color ?? colors.text.secondary,
    },
  };
  const { container, text } = styles[variant];

  return (
    <View
      style={[
        {
          height: 24,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm + 2,
          alignItems: "center",
          justifyContent: "center",
        },
        container,
        style,
      ]}
    >
      <AppText variant="caption" color={text}>
        {label}
      </AppText>
    </View>
  );
}
