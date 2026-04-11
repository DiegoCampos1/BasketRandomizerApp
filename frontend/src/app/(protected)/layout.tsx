"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationSocket } from "@/hooks/notifications/useNotificationSocket";

const DRAWER_WIDTH = 260;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useNotificationSocket();

  if (isLoading || !isAuthenticated) return null;

  return (
    <Box className="flex min-h-screen">
      <Sidebar
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        variant={isDesktop ? "permanent" : "temporary"}
      />
      <Box
        component="main"
        className="flex flex-1 flex-col"
        sx={{ ml: 0 }}
      >
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          showMenuButton={!isDesktop}
        />
        <Box className="flex-1 p-6">{children}</Box>
      </Box>
    </Box>
  );
}
