"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const nextLocale = locale === "pt-BR" ? "en" : "pt-BR";
  const label = locale === "pt-BR" ? "EN" : "PT";

  const switchLocale = () => {
    Cookies.set("NEXT_LOCALE", nextLocale, { path: "/" });
    router.refresh();
  };

  return (
    <Tooltip
      title={
        nextLocale === "en" ? "Switch to English" : "Mudar para Português"
      }
    >
      <IconButton onClick={switchLocale} size="small">
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13 }}>
          {label}
        </Typography>
      </IconButton>
    </Tooltip>
  );
}
