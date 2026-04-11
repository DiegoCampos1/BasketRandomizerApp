"use client";

import Box from "@mui/material/Box";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      className="relative flex min-h-screen items-center justify-center p-4"
      sx={{
        background: "linear-gradient(135deg, #4F46E5 0%, #F97316 100%)",
      }}
    >
      <Box className="absolute right-4 top-4">
        <LanguageSwitcher />
      </Box>
      {children}
    </Box>
  );
}
