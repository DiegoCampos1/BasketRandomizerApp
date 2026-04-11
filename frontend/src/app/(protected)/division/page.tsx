"use client";

import { useRef, useState } from "react";
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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import html2canvas from "html2canvas";
import { useTranslations, useLocale } from "next-intl";
import { usePlayers } from "@/hooks/players/usePlayers";
import { useDivisionMutations } from "@/hooks/divisions/useDivisionMutations";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { Division, DivisionMode, TeamPlayer } from "@/types/division";
import DroppableTeamCard from "@/components/division/DroppableTeamCard";
import PlayerRowOverlay from "@/components/division/PlayerRowOverlay";

const MAX_PLAYERS = 20;

function applyOptimisticMove(
  division: Division,
  teamPlayerId: string,
  targetTeamId: string
): Division {
  const teams = division.teams.map((team) => ({
    ...team,
    team_players: [...team.team_players],
  }));

  let movedPlayer: TeamPlayer | undefined;

  for (const team of teams) {
    const idx = team.team_players.findIndex((tp) => tp.id === teamPlayerId);
    if (idx !== -1) {
      movedPlayer = team.team_players.splice(idx, 1)[0];
      team.total_quality -= movedPlayer.player.quality;
      team.player_count -= 1;
      break;
    }
  }

  if (movedPlayer) {
    const target = teams.find((t) => t.id === targetTeamId);
    if (target) {
      target.team_players.push(movedPlayer);
      target.total_quality += movedPlayer.player.quality;
      target.player_count += 1;
    }
  }

  return { ...division, teams };
}

export default function DivisionPage() {
  const t = useTranslations("division");
  const locale = useLocale();
  const { positionLabels, heightCategoryLabels } = usePlayerLabels();
  const teamsGridRef = useRef<HTMLDivElement>(null);
  const { data: allPlayers = [] } = usePlayers();
  const players = allPlayers.filter((p) => p.active && p.is_approved);
  const { createDivision, movePlayer } = useDivisionMutations();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<DivisionMode>("2_teams");
  const [division, setDivision] = useState<Division | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [activeDragPlayer, setActiveDragPlayer] = useState<TeamPlayer | null>(
    null
  );
  const [copiedType, setCopiedType] = useState<"image" | "text" | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

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
        })
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

  const handleDragStart = (event: DragStartEvent) => {
    if (!division) return;
    const teamPlayerId = event.active.id as string;
    for (const team of division.teams) {
      const tp = team.team_players.find((p) => p.id === teamPlayerId);
      if (tp) {
        setActiveDragPlayer(tp);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragPlayer(null);
    const { active, over } = event;
    if (!over || !division) return;

    const teamPlayerId = active.id as string;
    const sourceTeamId = active.data.current?.sourceTeamId as string;
    const targetTeamId = over.id as string;

    if (sourceTeamId === targetTeamId) return;

    const previousDivision = division;
    setDivision(applyOptimisticMove(division, teamPlayerId, targetTeamId));
    setError("");

    movePlayer
      .mutateAsync({
        divisionId: division.id,
        data: {
          team_player_id: teamPlayerId,
          target_team_id: targetTeamId,
        },
      })
      .then((serverDivision) => setDivision(serverDivision))
      .catch(() => {
        setDivision(previousDivision);
        setError(t("errors.moveError"));
      });
  };

  const handleScreenshot = async () => {
    if (!teamsGridRef.current) return;
    try {
      const canvas = await html2canvas(teamsGridRef.current, {
        backgroundColor: "#F8FAFC",
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopiedType("image");
        setTimeout(() => setCopiedType(null), 2000);
      });
    } catch {
      // Clipboard API may not be available
    }
  };

  const handleCopyText = () => {
    if (!division) return;
    const dateStr = new Date(division.date).toLocaleDateString(locale);
    const header = `🏀 ${t("share.textHeader", { date: dateStr })}`;

    const teamsText = division.teams
      .map((team) => {
        const playerLines = team.team_players
          .map(
            (tp) =>
              `- ${tp.player.name} | ${positionLabels[tp.player.position]}`
          )
          .join("\n");
        const count = t("share.playerCount", {
          count: team.team_players.length,
        });
        return `\n⬛ ${team.name} (${count})\n${playerLines}`;
      })
      .join("\n");

    navigator.clipboard.writeText(`${header}\n${teamsText}`);
    setCopiedType("text");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const resetDivision = () => {
    setDivision(null);
    setSaved(false);
    setError("");
  };

  if (division) {
    return (
      <Box>
        <Box className="mb-2 flex items-center justify-between">
          <Typography variant="h4">{t("resultTitle")}</Typography>
          <Box className="flex items-center gap-1">
            <Tooltip
              title={
                copiedType === "image"
                  ? t("share.imageCopied")
                  : t("share.screenshot")
              }
            >
              <IconButton
                onClick={handleScreenshot}
                size="small"
                color={copiedType === "image" ? "success" : "default"}
              >
                <CameraAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                copiedType === "text"
                  ? t("share.textCopied")
                  : t("share.copyText")
              }
            >
              <IconButton
                onClick={handleCopyText}
                size="small"
                color={copiedType === "text" ? "success" : "default"}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" onClick={resetDivision}>
              {t("newDivision")}
            </Button>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          className="mb-4"
        >
          {t("dnd.hint")}
        </Typography>

        {saved && (
          <Alert
            severity="success"
            className="mb-4"
            onClose={() => setSaved(false)}
          >
            {t("savedSuccess")}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            className="mb-4"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Box
            ref={teamsGridRef}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {division.teams.map((team, index) => (
              <DroppableTeamCard
                key={team.id}
                team={team}
                index={index}
                positionLabels={positionLabels}
                heightCategoryLabels={heightCategoryLabels}
                qualityLabel={t("team.quality", {
                  value: team.total_quality,
                })}
                playerCountLabel={t("team.playerCount", {
                  count: team.player_count,
                })}
              />
            ))}
          </Box>

          <DragOverlay>
            {activeDragPlayer ? (
              <PlayerRowOverlay
                teamPlayer={activeDragPlayer}
                positionLabels={positionLabels}
                heightCategoryLabels={heightCategoryLabels}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
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
