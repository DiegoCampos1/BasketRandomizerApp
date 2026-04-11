"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";

const DRAWER_WIDTH = 260;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant: "permanent" | "temporary";
}

export default function Sidebar({ open, onClose, variant }: SidebarProps) {
  const t = useTranslations("layout");
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const navItems = [
    { label: t("nav.dashboard"), href: "/dashboard", icon: <DashboardIcon /> },
    { label: t("nav.players"), href: "/players", icon: <PeopleIcon /> },
    { label: t("nav.divideTeams"), href: "/division", icon: <ShuffleIcon /> },
    { label: t("nav.history"), href: "/history", icon: <HistoryIcon /> },
  ];

  const drawerContent = (
    <Box className="flex h-full flex-col px-1">
      <Box className="flex items-center gap-2 px-4 py-3 h-20">
        <EmojiEventsIcon sx={{ color: "secondary.main", fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle1" color="text.secondary">
            {user?.organization?.name || ""}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ ml: -1, mr: -1 }} />

      <List className="flex-1 px-3 pt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.href} disablePadding className="mb-1">
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onClose}
                selected={isActive}
                sx={{
                  borderRadius: 1.5,
                  transition: "all 200ms ease-out",
                  "&.Mui-selected": {
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                    "& .MuiListItemIcon-root": { color: "white" },
                  },
                  "&:hover:not(.Mui-selected)": {
                    backgroundColor: "rgba(79, 70, 229, 0.06)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <List className="px-3 pb-2">
        <ListItem disablePadding>
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: 1.5,
              transition: "all 200ms ease-out",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.06)",
                color: "error.main",
                "& .MuiListItemIcon-root": { color: "error.main" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t("logout")} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
