"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTranslations } from "next-intl";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokens = await login({ email, password });
      await authLogin(tokens.access, tokens.refresh);
      router.push("/dashboard");
    } catch {
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 sm:p-6">
        <Box className="mb-6 flex flex-col items-center">
          <EmojiEventsIcon
            sx={{ fontSize: 48, color: "secondary.main", mb: 1 }}
          />
          <Typography variant="h5" className="font-bold">
            {t("login.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("login.subtitle")}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label={t("login.emailLabel")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label={t("login.passwordLabel")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? t("login.submitting") : t("login.submitButton")}
          </Button>
        </form>
        <Box className="my-4">
          <Typography variant="body2" className="mt-4 text-center">
            {t("login.noAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-[#4F46E5] hover:underline"
            >
              {t("login.register")}
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
