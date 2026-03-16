"use client";

import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircularProgress from "@mui/material/CircularProgress";
import { useDivision } from "@/hooks/divisions/useDivisions";
import { Team } from "@/types/division";
import { POSITION_LABELS, HEIGHT_CATEGORY_LABELS } from "@/types/player";

export default function DivisionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: division, isLoading, isError } = useDivision(id);

  if (isLoading) {
    return (
      <Box className="flex justify-center py-12">
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !division) {
    router.push("/history");
    return null;
  }

  return (
    <Box>
      <Box className="mb-6 flex items-center gap-3">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/history")}
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4">
            Divisão {new Date(division.date).toLocaleDateString("pt-BR")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {division.mode === "2_teams" ? "2 Times" : "4 Times"} — Criado por{" "}
            {division.created_by_username}
          </Typography>
        </Box>
      </Box>

      <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {division.teams.map((team) => (
          <DetailTeamCard key={team.id} team={team} />
        ))}
      </Box>
    </Box>
  );
}

function DetailTeamCard({ team }: { team: Team }) {
  const isVermelho = team.name.toLowerCase().includes("vermelho");

  return (
    <Card
      sx={{
        borderTop: 4,
        borderColor: isVermelho ? "primary.main" : "secondary.main",
      }}
    >
      <CardContent>
        <Box className="mb-3 flex items-center justify-between">
          <Typography variant="h6" className="font-bold">
            {team.name}
          </Typography>
          <Chip
            label={`Qualidade: ${team.total_quality}`}
            color={isVermelho ? "error" : "primary"}
            size="small"
          />
        </Box>

        <Box className="flex flex-col gap-2">
          {team.team_players.map((tp) => (
            <Box
              key={tp.id}
              className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
            >
              <Box className="flex items-center gap-2">
                <Typography variant="body2" className="font-medium">
                  {tp.player.name}
                </Typography>
                <Chip
                  label={POSITION_LABELS[tp.player.position]}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box className="flex items-center gap-1">
                <Chip
                  label={HEIGHT_CATEGORY_LABELS[tp.player.height_category]}
                  size="small"
                />
                <Rating
                  value={tp.player.quality}
                  readOnly
                  size="small"
                  max={5}
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          className="mt-2 block"
        >
          {team.player_count} jogadores
        </Typography>
      </CardContent>
    </Card>
  );
}
