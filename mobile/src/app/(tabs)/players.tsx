import { useTranslation } from "react-i18next";

import AppText from "@/components/ui/AppText";
import Screen from "@/components/ui/Screen";

export default function PlayersScreen() {
  const { t } = useTranslation("players");
  return (
    <Screen>
      <AppText variant="display">{t("title")}</AppText>
      <AppText variant="body" tone="secondary">
        Em construção (M2)
      </AppText>
    </Screen>
  );
}
