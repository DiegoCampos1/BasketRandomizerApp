"use client";

import { useTranslations } from "next-intl";
import type { Position, HeightCategory } from "@/types/player";

export function usePlayerLabels() {
  const t = useTranslations("playerTypes");

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
