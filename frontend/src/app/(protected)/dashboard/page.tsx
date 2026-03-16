"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import PeopleIcon from "@mui/icons-material/People";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import HistoryIcon from "@mui/icons-material/History";
import { useAuthStore } from "@/stores/authStore";
import { usePlayers } from "@/hooks/players/usePlayers";
import { useDivisions } from "@/hooks/divisions/useDivisions";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: players } = usePlayers();
  const { data: divisions } = useDivisions();

  return (
    <Box gap={2} className="flex flex-col">
      <Typography variant="h4" className="mb-6">
        Olá, {user?.first_name || user?.username}!
      </Typography>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-2">
        <Card>
          <CardActionArea onClick={() => router.push("/players")}>
            <CardContent className="flex items-center gap-4 p-6">
              <PeopleIcon sx={{ fontSize: 48, color: "secondary.main" }} />
              <Box>
                <Typography variant="h3" className="font-bold">
                  {players?.length ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Jogadores cadastrados
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card>
          <CardActionArea onClick={() => router.push("/history")}>
            <CardContent className="flex items-center gap-4 p-6">
              <HistoryIcon sx={{ fontSize: 48, color: "secondary.main" }} />
              <Box>
                <Typography variant="h3" className="font-bold">
                  {divisions?.length ?? 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Divisões realizadas
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card sx={{ height: "100%" }}>
          <CardActionArea
            onClick={() => router.push("/division")}
            sx={{ height: "100%" }}
          >
            <CardContent className="flex items-center gap-4 p-6 h-full">
              <SportsBasketballIcon
                sx={{ fontSize: 48, color: "primary.main" }}
              />
              <Box>
                <Typography variant="h6" className="font-bold">
                  Dividir Times
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Montar as equipes do dia
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
}
