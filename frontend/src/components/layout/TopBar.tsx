"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuthStore } from "@/stores/authStore";

interface TopBarProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function TopBar({ onMenuClick, showMenuButton }: TopBarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Toolbar>
        {showMenuButton && (
          <IconButton edge="start" onClick={onMenuClick} className="mr-2">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" className="flex-1" />
        <Typography variant="body2" color="text.secondary">
          {user?.username}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
