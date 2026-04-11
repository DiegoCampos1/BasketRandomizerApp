"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Rating from "@mui/material/Rating";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import { useTranslations } from "next-intl";
import { usePlayers } from "@/hooks/players/usePlayers";
import { useDivisionMutations } from "@/hooks/divisions/useDivisionMutations";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { Division, DivisionMode, Team } from "@/types/division";

const MAX_PLAYERS = 20;

export default function DivisionPage() {
  const t = useTranslations("division");
  const { positionLabels, heightCategoryLabels } = usePlayerLabels();
  const { data: allPlayers = [] } = usePlayers();
  const players = allPlayers.filter((p) => p.active && p.is_approved);
  const { createDivision, swapPlayers } = useDivisionMutations();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<DivisionMode>("2_teams");
  const [division, setDivision] = useState<Division | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const togglePlayer = (id: string) => {
    if (!selectedIds.has(id) && selectedIds.size >= MAX_PLAYERS) {
      setError(t("errors.maxPlayers", { max: MAX_PLAYERS }));
      return;
    }
    setError("");
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const ids = players.map((p) => p.id).slice(0, MAX_PLAYERS);
    setSelectedIds(new Set(ids));
    if (players.length > MAX_PLAYERS) {
      setError(t("errors.maxSelected", { max: MAX_PLAYERS }));
    } else {
      setError("");
    }
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDivide = async () => {
    setError("");
    setSaved(false);

    const minPlayers = mode === "2_teams" ? 4 : 8;
    if (selectedIds.size < minPlayers) {
      setError(
        t("errors.minPlayers", {
          min: minPlayers,
          teams: mode === "2_teams" ? "2" : "4",
        }),
      );
      return;
    }

    if (selectedIds.size > MAX_PLAYERS) {
      setError(t("errors.maxPlayers", { max: MAX_PLAYERS }));
      return;
    }

    setLoading(true);

    try {
      const result = await createDivision.mutateAsync({
        player_ids: Array.from(selectedIds),
        mode,
        date: new Date().toISOString().split("T")[0],
      });
      setDivision(result);
      setSaved(true);
    } catch {
      setError(t("errors.divisionError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async (playerAId: string, playerBId: string) => {
    if (!division) return;
    try {
      const result = await swapPlayers.mutateAsync({
        divisionId: division.id,
        data: {
          player_a_id: playerAId,
          player_b_id: playerBId,
        },
      });
      setDivision(result);
    } catch {
      setError(t("errors.swapError"));
    }
  };

  const resetDivision = () => {
    setDivision(null);
    setSaved(false);
    setError("");
  };

  if (division) {
    return (
      <Box>
        <Box className="mb-6 flex items-center justify-between">
          <Typography variant="h4">{t("resultTitle")}</Typography>
          <Box className="flex gap-2">
            <Button variant="outlined" onClick={resetDivision}>
              {t("newDivision")}
            </Button>
          </Box>
        </Box>

        {saved && (
          <Alert severity="success" className="mb-4">
            {t("savedSuccess")}
          </Alert>
        )}

        <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {division.teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              index={index}
              positionLabels={positionLabels}
              heightCategoryLabels={heightCategoryLabels}
              t={t}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" className="mb-6">
        {t("title")}
      </Typography>

      {showTips && (
        <Alert
          severity="info"
          onClose={() => setShowTips(false)}
          className="mb-4"
        >
          <AlertTitle className="font-bold">{t("tips.title")}</AlertTitle>
          <ul className="m-0 flex flex-col gap-1 pl-4">
            <li>{t("tips.algorithm")}</li>
            <li>{t("tips.tallCenters")}</li>
            <li>{t("tips.modes")}</li>
            <li>{t("tips.adjust")}</li>
          </ul>
        </Alert>
      )}

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Mode selector */}
      <Box className="mb-6">
        <Typography variant="subtitle1" className="mb-2 font-semibold">
          {t("modeLabel")}
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && setMode(v)}
          color="primary"
        >
          <ToggleButton value="2_teams">{t("twoTeams")}</ToggleButton>
          <ToggleButton value="4_teams">{t("fourTeams")}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Player selection */}
      <Box className="mb-6">
        <Box className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Typography variant="subtitle1" className="font-semibold">
            {t("presentPlayers", {
              selected: selectedIds.size,
              max: MAX_PLAYERS,
            })}
          </Typography>
          <Box className="flex gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={selectAll}
              sx={{
                "@media (min-width: 640px)": {
                  border: "none",
                  "&:hover": { border: "none" },
                },
              }}
            >
              {t("selectAll")}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={deselectAll}
              sx={{
                "@media (min-width: 640px)": {
                  border: "none",
                  "&:hover": { border: "none" },
                },
              }}
            >
              {t("clear")}
            </Button>
          </Box>
        </Box>

        <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card
              key={player.id}
              sx={{
                cursor: "pointer",
                border: selectedIds.has(player.id) ? 2 : 1,
                borderColor: selectedIds.has(player.id)
                  ? "primary.main"
                  : "divider",
                transition: "border-color 200ms ease-out",
              }}
              onClick={() => togglePlayer(player.id)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Checkbox
                  checked={selectedIds.has(player.id)}
                  tabIndex={-1}
                  color="primary"
                />
                <Box className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    {player.name}
                  </Typography>
                  <Box className="flex gap-1">
                    <Chip
                      label={positionLabels[player.position]}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={heightCategoryLabels[player.height_category]}
                      size="small"
                    />
                  </Box>
                </Box>
                <Rating value={player.quality} readOnly size="small" max={5} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Divide button */}
      <Button
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<ShuffleIcon />}
        onClick={handleDivide}
        disabled={loading || selectedIds.size === 0}
        fullWidth
        sx={{ maxWidth: 400 }}
      >
        {loading ? t("dividing") : t("divideButton")}
      </Button>
    </Box>
  );
}

const TEAM_COLORS = ["#4F46E5", "#F97316", "#10B981", "#EF4444"];

function TeamCard({
  team,
  index,
  positionLabels,
  heightCategoryLabels,
  t,
}: {
  team: Team;
  index: number;
  positionLabels: Record<string, string>;
  heightCategoryLabels: Record<string, string>;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const borderColor = TEAM_COLORS[index % TEAM_COLORS.length];

  return (
    <Card
      sx={{
        borderTop: 4,
        borderColor,
      }}
    >
      <CardContent>
        <Box className="mb-3 flex items-center justify-between">
          <Typography variant="h6" className="font-bold">
            {team.name}
          </Typography>
          <Chip
            label={t("team.quality", { value: team.total_quality })}
            size="small"
            sx={{
              backgroundColor: `${borderColor}14`,
              color: borderColor,
              fontWeight: 600,
            }}
          />
        </Box>

        <Box className="flex flex-col gap-2">
          {team.team_players.map((tp) => (
            <Box
              key={tp.id}
              className="flex items-center justify-between rounded-lg p-2"
              sx={{ backgroundColor: "rgba(248, 250, 252, 1)" }}
            >
              <Box className="flex items-center gap-2">
                <Typography variant="body2" className="font-medium">
                  {tp.player.name}
                </Typography>
                <Chip
                  label={positionLabels[tp.player.position]}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box className="flex items-center gap-1">
                <Chip
                  label={heightCategoryLabels[tp.player.height_category]}
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
          {t("team.playerCount", { count: team.player_count })}
        </Typography>
      </CardContent>
    </Card>
  );
}
