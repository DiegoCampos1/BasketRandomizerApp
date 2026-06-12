import { useTranslation } from "react-i18next";

import AppText from "@/components/ui/AppText";
import Screen from "@/components/ui/Screen";

export default function HistoryScreen() {
  const { t } = useTranslation("history");
  return (
    <Screen>
      <AppText variant="display">{t("title")}</AppText>
      <AppText variant="body" tone="secondary">
        Em construção (M5)
      </AppText>
    </Screen>
  );
}
