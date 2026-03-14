"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PeopleIcon from "@mui/icons-material/People";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import HistoryIcon from "@mui/icons-material/History";
import { useAuthStore } from "@/stores/authStore";
import { getPlayers } from "@/lib/api/players";
import { getDivisions } from "@/lib/api/divisions";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [playerCount, setPlayerCount] = useState(0);
  const [divisionCount, setDivisionCount] = useState(0);

  useEffect(() => {
    getPlayers().then((p) => setPlayerCount(p.length)).catch(() => {});
    getDivisions().then((d) => setDivisionCount(d.length)).catch(() => {});
  }, []);

  return (
    <Box>
      <Typography variant="h4" className="mb-6">
        Olá, {user?.first_name || user?.username}!
      </Typography>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <PeopleIcon sx={{ fontSize: 48, color: "secondary.main" }} />
            <Box>
              <Typography variant="h3" className="font-bold">
                {playerCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Jogadores cadastrados
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <HistoryIcon sx={{ fontSize: 48, color: "secondary.main" }} />
            <Box>
              <Typography variant="h3" className="font-bold">
                {divisionCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Divisões realizadas
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <SportsBasketballIcon
              sx={{ fontSize: 48, color: "primary.main" }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/division")}
            >
              Dividir Times
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
