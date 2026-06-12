import { forwardRef, useState } from "react";
import { TextInput, View, type TextInputProps, type ViewStyle } from "react-native";

import AppText from "@/components/ui/AppText";
import { colors, fonts, radius, spacing } from "@/theme/tokens";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, containerStyle, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.border.focus
      : colors.border.hairline;

  return (
    <View style={[{ gap: spacing.xs + 2 }, containerStyle]}>
      <AppText variant="micro" tone="secondary">
        {label}
      </AppText>
      <View
        style={{
          backgroundColor: colors.bg.raised,
          borderRadius: radius.input,
          // Border color is the only focus affordance: toggling shadows here
          // can reparent the native TextInput (view flattening) and blur it.
          borderWidth: 1.5,
          borderColor,
        }}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.text.tertiary}
          keyboardAppearance="dark"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            height: 52,
            paddingHorizontal: spacing.lg,
            color: colors.text.primary,
            fontFamily: fonts.regular,
            fontSize: 15,
          }}
          {...rest}
        />
      </View>
      {error ? (
        <AppText variant="caption" color={colors.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

export default TextField;
