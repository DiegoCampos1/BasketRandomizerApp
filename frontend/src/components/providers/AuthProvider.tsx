"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return (
      <Box className="flex h-screen w-screen items-center justify-center">
        <CircularProgress color="primary" size={48} />
      </Box>
    );
  }

  return <>{children}</>;
}
