import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const locale: Locale =
    cookieLocale && locales.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : defaultLocale;

  const messages = {
    common: (await import(`../messages/${locale}/common.json`)).default,
    auth: (await import(`../messages/${locale}/auth.json`)).default,
    dashboard: (await import(`../messages/${locale}/dashboard.json`)).default,
    players: (await import(`../messages/${locale}/players.json`)).default,
    division: (await import(`../messages/${locale}/division.json`)).default,
    history: (await import(`../messages/${locale}/history.json`)).default,
    addPlayer: (await import(`../messages/${locale}/addPlayer.json`)).default,
    layout: (await import(`../messages/${locale}/layout.json`)).default,
    playerTypes: (await import(`../messages/${locale}/playerTypes.json`))
      .default,
  };

  return { locale, messages };
});
