"use client";

import { useDraggable } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { TeamPlayer } from "@/types/division";

interface DraggablePlayerRowProps {
  teamPlayer: TeamPlayer;
  sourceTeamId: string;
  positionLabels: Record<string, string>;
  heightCategoryLabels: Record<string, string>;
}

export default function DraggablePlayerRow({
  teamPlayer,
  sourceTeamId,
  positionLabels,
  heightCategoryLabels,
}: DraggablePlayerRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: teamPlayer.id,
      data: {
        teamPlayerId: teamPlayer.id,
        sourceTeamId,
      },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-lg p-2"
      sx={{
        backgroundColor: "rgba(248, 250, 252, 1)",
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        touchAction: "none",
        "&:active": { cursor: "grabbing" },
      }}
      {...listeners}
      {...attributes}
    >
      <Box className="flex items-center gap-2">
        <DragIndicatorIcon
          sx={{ fontSize: 18, color: "text.disabled", flexShrink: 0 }}
        />
        <Typography variant="body2" className="font-medium">
          {teamPlayer.player.name}
        </Typography>
        <Chip
          label={positionLabels[teamPlayer.player.position]}
          size="small"
          variant="outlined"
        />
      </Box>
      <Box className="flex items-center gap-1">
        <Chip
          label={heightCategoryLabels[teamPlayer.player.height_category]}
          size="small"
        />
        <Rating
          value={teamPlayer.player.quality}
          readOnly
          size="small"
          max={5}
        />
      </Box>
    </Box>
  );
}
