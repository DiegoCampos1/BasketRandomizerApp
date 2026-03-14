"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import { getDivisions } from "@/lib/api/divisions";
import { DivisionListItem } from "@/types/division";

export default function HistoryPage() {
  const router = useRouter();
  const [divisions, setDivisions] = useState<DivisionListItem[]>([]);

  const loadDivisions = useCallback(async () => {
    try {
      const data = await getDivisions();
      setDivisions(data);
    } catch {
      /* empty */
    }
  }, []);

  useEffect(() => {
    loadDivisions();
  }, [loadDivisions]);

  return (
    <Box>
      <Typography variant="h4" className="mb-6">
        Histórico de Divisões
      </Typography>

      {divisions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Typography variant="h6" color="text.secondary">
              Nenhuma divisão realizada ainda
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
                      {new Date(div.date).toLocaleDateString("pt-BR")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Criado por {div.created_by_username}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Chip
                      label={div.mode === "2_teams" ? "2 Times" : "4 Times"}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`${div.player_count} jogadores`}
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
