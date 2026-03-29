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
        background: "linear-gradient(135deg, #4F46E5 0%, #F97316 100%)",
      }}
    >
      {children}
    </Box>
  );
}
