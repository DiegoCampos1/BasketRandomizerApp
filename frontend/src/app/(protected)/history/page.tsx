"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import { useTranslations, useLocale } from "next-intl";
import { useDivisions } from "@/hooks/divisions/useDivisions";

export default function HistoryPage() {
  const t = useTranslations("history");
  const locale = useLocale();
  const router = useRouter();
  const { data: divisions = [] } = useDivisions();

  return (
    <Box gap={2} className="flex flex-col">
      <Typography variant="h4" className="mb-6">
        {t("title")}
      </Typography>

      {divisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Typography variant="h6" color="text.secondary">
              {t("empty")}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box className="flex flex-col gap-3">
          {divisions.map((div) => (
            <Card key={div.id}>
              <CardActionArea onClick={() => router.push(`/history/${div.id}`)}>
                <CardContent className="flex items-center justify-between p-4">
                  <Box>
                    <Typography variant="h6" className="font-semibold">
                      {new Date(div.date).toLocaleDateString(locale)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("createdBy", { name: div.created_by_name })}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Chip
                      label={
                        div.mode === "2_teams"
                          ? t("twoTeams")
                          : t("fourTeams")
                      }
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={t("playerCount", { count: div.player_count })}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
