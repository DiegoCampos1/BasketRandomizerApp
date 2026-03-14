"use client";

import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuthStore } from "@/stores/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/players": "Jogadores",
  "/division": "Dividir Times",
  "/history": "Histórico",
};

interface TopBarProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function TopBar({ onMenuClick, showMenuButton }: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const pageTitle =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith("/history/") ? "Detalhes da Divisão" : "");

  const initials = user
    ? (user.first_name?.[0] || user.username[0]).toUpperCase()
    : "";

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        minHeight: 80,
      }}
    >
      <Toolbar
        className="px-6"
        sx={{
          minHeight: 80,
          height: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {showMenuButton && (
          <IconButton edge="start" onClick={onMenuClick} className="mr-3">
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" className="flex-1 font-semibold">
          {pageTitle}
        </Typography>
        <Box className="flex items-center gap-3">
          <Typography
            variant="body2"
            color="text.secondary"
            className="hidden sm:block"
          >
            {user?.first_name || user?.username}
          </Typography>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "secondary.main",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
