import { useTranslation } from "react-i18next";

import AppText from "@/components/ui/AppText";
import Screen from "@/components/ui/Screen";

export default function DivisionScreen() {
  const { t } = useTranslation("division");
  return (
    <Screen>
      <AppText variant="display">{t("title")}</AppText>
      <AppText variant="body" tone="secondary">
        Em construção (M3)
      </AppText>
    </Screen>
  );
}
