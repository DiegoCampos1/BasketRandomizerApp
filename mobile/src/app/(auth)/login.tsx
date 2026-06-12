import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { API_URL } from "@/api/urls";
import AppText from "@/components/ui/AppText";
import Screen from "@/components/ui/Screen";
import { spacing } from "@/theme/tokens";

export default function LoginScreen() {
  return (
    <Screen>
      <LinearGradient
        colors={["rgba(255,107,44,0.12)", "transparent"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
        }}
      />
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.lg }}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <AppText variant="displayXl">
            {"Sorteador\nde Times"}
          </AppText>
          <View
            style={{
              width: 64,
              height: 3,
              backgroundColor: "#FF6B2C",
              marginTop: spacing.sm,
              borderRadius: 2,
            }}
          />
        </Animated.View>
        <AppText variant="body" tone="secondary">
          🏀 Login em construção (M1)
        </AppText>
        {__DEV__ && (
          <AppText variant="caption" tone="tertiary">
            API: {API_URL}
          </AppText>
        )}
      </View>
    </Screen>
  );
}
