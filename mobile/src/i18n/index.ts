import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";

import enAuth from "./messages/en/auth.json";
import enCommon from "./messages/en/common.json";
import enDashboard from "./messages/en/dashboard.json";
import enDivision from "./messages/en/division.json";
import enHistory from "./messages/en/history.json";
import enLayout from "./messages/en/layout.json";
import enPlayers from "./messages/en/players.json";
import enPlayerTypes from "./messages/en/playerTypes.json";
import ptAuth from "./messages/pt-BR/auth.json";
import ptCommon from "./messages/pt-BR/common.json";
import ptDashboard from "./messages/pt-BR/dashboard.json";
import ptDivision from "./messages/pt-BR/division.json";
import ptHistory from "./messages/pt-BR/history.json";
import ptLayout from "./messages/pt-BR/layout.json";
import ptPlayers from "./messages/pt-BR/players.json";
import ptPlayerTypes from "./messages/pt-BR/playerTypes.json";

export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

const LOCALE_STORAGE_KEY = "locale";

const resources = {
  "pt-BR": {
    common: ptCommon,
    auth: ptAuth,
    dashboard: ptDashboard,
    players: ptPlayers,
    division: ptDivision,
    history: ptHistory,
    layout: ptLayout,
    playerTypes: ptPlayerTypes,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    players: enPlayers,
    division: enDivision,
    history: enHistory,
    layout: enLayout,
    playerTypes: enPlayerTypes,
  },
} as const;

function deviceLocale(): Locale {
  const tag = getLocales()[0]?.languageTag ?? "";
  if (tag.toLowerCase().startsWith("en")) return "en";
  return "pt-BR";
}

export async function initI18n(): Promise<void> {
  const stored = (await AsyncStorage.getItem(LOCALE_STORAGE_KEY)) as Locale | null;
  const lng = stored && LOCALES.includes(stored) ? stored : deviceLocale();

  // eslint-disable-next-line import/no-named-as-default-member -- i18next's fluent instance API
  await i18n
    .use(ICU)
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: "pt-BR",
      defaultNS: "common",
      interpolation: { escapeValue: false },
      returnNull: false,
    });
}

export async function setLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
  // eslint-disable-next-line import/no-named-as-default-member -- instance method
  await i18n.changeLanguage(locale);
}

export function currentLocale(): Locale {
  return i18n.language === "en" ? "en" : "pt-BR";
}

export default i18n;
