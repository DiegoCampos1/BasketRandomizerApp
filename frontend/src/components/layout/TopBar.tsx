"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/authStore";
import { useNotifications, useUnreadCount } from "@/hooks/notifications/useNotifications";
import { useNotificationMutations } from "@/hooks/notifications/useNotificationMutations";
import LanguageSwitcher from "./LanguageSwitcher";

const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "pageTitles.dashboard",
  "/players": "pageTitles.players",
  "/division": "pageTitles.divideTeams",
  "/history": "pageTitles.history",
};

interface TopBarProps {
  onMenuClick: () => void;
  showMenuButton: boolean;
}

export default function TopBar({ onMenuClick, showMenuButton }: TopBarProps) {
  const t = useTranslations("layout");
  const tc = useTranslations("common");
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();

  const { data: unreadData } = useUnreadCount();
  const { data: notifications = [] } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const unreadCount = unreadData?.count ?? 0;

  const titleKey = PAGE_TITLE_KEYS[pathname];
  const pageTitle = titleKey
    ? t(titleKey)
    : pathname.startsWith("/history/")
      ? t("pageTitles.divisionDetail")
      : "";

  const initials = user
    ? (user.first_name?.[0] || user.email[0]).toUpperCase()
    : "";

  const handleNotificationClick = (notificationId: string) => {
    markAsRead.mutate(notificationId);
    setAnchorEl(null);
    router.push("/players");
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return tc("time.now");
    if (minutes < 60) return tc("time.minutesAgo", { minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return tc("time.hoursAgo", { hours });
    const days = Math.floor(hours / 24);
    return tc("time.daysAgo", { days });
  };

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
        <Box className="flex items-center gap-2">
          <LanguageSwitcher />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Badge badgeContent={unreadCount} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography
            variant="body2"
            color="text.secondary"
            className="hidden sm:block"
          >
            {user?.first_name || user?.email}
          </Typography>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: "primary.main",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
        </Box>
      </Toolbar>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: { width: 360, maxHeight: 420 },
          },
        }}
      >
        <Box className="flex items-center justify-between px-4 py-3">
          <Typography variant="subtitle1" className="font-semibold">
            {t("notifications.title")}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              {t("notifications.markAllRead")}
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box className="px-4 py-8 text-center">
            <Typography variant="body2" color="text.secondary">
              {t("notifications.empty")}
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 320, overflow: "auto" }}>
            {notifications.map((n) => (
              <ListItem key={n.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNotificationClick(n.id)}
                  sx={{
                    backgroundColor: n.is_read
                      ? "transparent"
                      : "rgba(79, 70, 229, 0.04)",
                    "&:hover": {
                      backgroundColor: n.is_read
                        ? "action.hover"
                        : "rgba(79, 70, 229, 0.08)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box className="flex items-center justify-between">
                        <Typography
                          variant="body2"
                          className={n.is_read ? "" : "font-semibold"}
                        >
                          {n.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          className="ml-2 shrink-0"
                        >
                          {formatTimeAgo(n.created_at)}
                        </Typography>
                      </Box>
                    }
                    secondary={n.message}
                  />
                  {!n.is_read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "secondary.main",
                        ml: 1,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </AppBar>
  );
}
