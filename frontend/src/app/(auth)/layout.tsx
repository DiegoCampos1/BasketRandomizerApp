import Box from "@mui/material/Box";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      className="flex min-h-screen items-center justify-center p-4"
      sx={{
        background: "linear-gradient(135deg, #1D428A 0%, #C8102E 100%)",
      }}
    >
      {children}
    </Box>
  );
}
