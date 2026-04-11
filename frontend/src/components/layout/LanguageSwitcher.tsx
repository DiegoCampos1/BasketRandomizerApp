"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";

const FLAGS: Record<string, { flag: string; tooltip: string }> = {
  "pt-BR": { flag: "🇧🇷", tooltip: "Mudar para Português" },
  en: { flag: "🇺🇸", tooltip: "Switch to English" },
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const nextLocale = locale === "pt-BR" ? "en" : "pt-BR";
  const next = FLAGS[nextLocale];

  const switchLocale = () => {
    Cookies.set("NEXT_LOCALE", nextLocale, { path: "/" });
    router.refresh();
  };

  return (
    <Tooltip title={next.tooltip}>
      <IconButton
        onClick={switchLocale}
        size="small"
        sx={{
          borderRadius: 1.5,
          px: 1,
          transition: "background-color 200ms ease-out",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 20,
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {next.flag}
        </Box>
      </IconButton>
    </Tooltip>
  );
}
