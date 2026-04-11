"use client";

import { useDroppable } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { Team } from "@/types/division";
import DraggablePlayerRow from "./DraggablePlayerRow";

const TEAM_COLORS = ["#4F46E5", "#F97316", "#10B981", "#EF4444"];

interface DroppableTeamCardProps {
  team: Team;
  index: number;
  positionLabels: Record<string, string>;
  heightCategoryLabels: Record<string, string>;
  qualityLabel: string;
  playerCountLabel: string;
}

export default function DroppableTeamCard({
  team,
  index,
  positionLabels,
  heightCategoryLabels,
  qualityLabel,
  playerCountLabel,
}: DroppableTeamCardProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
  });

  const borderColor = TEAM_COLORS[index % TEAM_COLORS.length];

  return (
    <Card
      ref={setNodeRef}
      sx={{
        borderTop: 4,
        borderColor,
        outline: isOver ? `2px dashed ${borderColor}` : "none",
        outlineOffset: -2,
        backgroundColor: isOver ? `${borderColor}08` : undefined,
        transition: "outline 150ms ease, background-color 150ms ease",
      }}
    >
      <CardContent>
        <Box className="mb-3 flex items-center justify-between">
          <Typography variant="h6" className="font-bold">
            {team.name}
          </Typography>
          <Chip
            label={qualityLabel}
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
            <DraggablePlayerRow
              key={tp.id}
              teamPlayer={tp}
              sourceTeamId={team.id}
              positionLabels={positionLabels}
              heightCategoryLabels={heightCategoryLabels}
            />
          ))}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          className="mt-2 block"
        >
          {playerCountLabel}
        </Typography>
      </CardContent>
    </Card>
  );
}
