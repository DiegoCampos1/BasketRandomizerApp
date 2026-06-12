import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, TextInput, View } from "react-native";

import { colors, fonts, radius, spacing } from "@/theme/tokens";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel: string;
}

export default function SearchBar({ value, onChange, placeholder, clearLabel }: SearchBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 44,
        backgroundColor: colors.bg.raised,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
      }}
    >
      <Ionicons name="search" size={18} color={colors.text.tertiary} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        keyboardAppearance="dark"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        style={{
          flex: 1,
          color: colors.text.primary,
          fontFamily: fonts.regular,
          fontSize: 15,
          paddingVertical: 0,
        }}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          onPress={() => onChange("")}
          hitSlop={10}
        >
          <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
        </Pressable>
      )}
    </View>
  );
}
