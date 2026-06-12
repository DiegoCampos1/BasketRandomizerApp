import { useTranslation } from "react-i18next";

import type { HeightCategory, Position } from "@/types/player";

export function usePlayerLabels() {
  const { t } = useTranslation("playerTypes");

  return {
    positionLabels: {
      guard: t("positions.guard"),
      forward: t("positions.forward"),
      center: t("positions.center"),
    } as Record<Position, string>,
    heightCategoryLabels: {
      small: t("heightCategories.small"),
      medium: t("heightCategories.medium"),
      tall: t("heightCategories.tall"),
    } as Record<HeightCategory, string>,
  };
}
