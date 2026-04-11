"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { TeamPlayer } from "@/types/division";

interface PlayerRowOverlayProps {
  teamPlayer: TeamPlayer;
  positionLabels: Record<string, string>;
  heightCategoryLabels: Record<string, string>;
}

export default function PlayerRowOverlay({
  teamPlayer,
  positionLabels,
  heightCategoryLabels,
}: PlayerRowOverlayProps) {
  return (
    <Box
      className="flex items-center justify-between rounded-lg p-2"
      sx={{
        backgroundColor: "white",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        border: "1px solid",
        borderColor: "divider",
        width: "100%",
        maxWidth: 500,
        cursor: "grabbing",
      }}
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
