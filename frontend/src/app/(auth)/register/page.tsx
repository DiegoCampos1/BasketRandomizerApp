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
import { register } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirm: "",
    organization_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirm) {
      setError(t("register.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await register(form);
      await authLogin(response.tokens.access, response.tokens.refresh);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: Record<string, string[]> };
        };
        const data = axiosErr.response?.data;
        if (data) {
          const messages = Object.values(data).flat().join(" ");
          setError(messages);
        } else {
          setError(t("register.error"));
        }
      } else {
        setError(t("register.error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <Box className="mb-6 flex flex-col items-center">
          <EmojiEventsIcon
            sx={{ fontSize: 48, color: "secondary.main", mb: 1 }}
          />
          <Typography variant="h5" className="font-bold">
            {t("register.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("register.subtitle")}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label={t("register.nameLabel")}
            value={form.name}
            onChange={handleChange("name")}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label={t("register.emailLabel")}
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            required
            fullWidth
          />
          <TextField
            label={t("register.passwordLabel")}
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            required
            fullWidth
          />
          <TextField
            label={t("register.confirmPasswordLabel")}
            type="password"
            value={form.password_confirm}
            onChange={handleChange("password_confirm")}
            required
            fullWidth
          />
          <TextField
            label={t("register.orgNameLabel")}
            value={form.organization_name}
            onChange={handleChange("organization_name")}
            required
            fullWidth
            helperText={t("register.orgNameHelper")}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? t("register.submitting") : t("register.submitButton")}
          </Button>
        </form>
        <Box className="mt-4">
          <Typography variant="body2" className="text-center">
            {t("register.hasAccount")}{" "}
            <Link
              href="/login"
              className="font-semibold text-[#4F46E5] hover:underline"
            >
              {t("register.login")}
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
