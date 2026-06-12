import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Screen from "@/components/ui/Screen";
import { setLocale, currentLocale } from "@/i18n";
import { spacing } from "@/theme/tokens";

export default function DashboardScreen() {
  const { t } = useTranslation("dashboard");

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(320)} style={{ gap: spacing.lg }}>
        <View>
          <AppText variant="micro" tone="brand">
            Game Day · Boomerangs
          </AppText>
          <AppText variant="display">{t("greeting", { name: "Dev" })}</AppText>
        </View>
        <Card>
          <AppText variant="stat" tabular>
            M0
          </AppText>
          <AppText variant="caption" tone="secondary">
            {t("registeredPlayers")}
          </AppText>
        </Card>
        <Button
          label={currentLocale() === "pt-BR" ? "Switch to English" : "Mudar para Português"}
          variant="secondary"
          onPress={() => setLocale(currentLocale() === "pt-BR" ? "en" : "pt-BR")}
        />
      </Animated.View>
    </Screen>
  );
}
