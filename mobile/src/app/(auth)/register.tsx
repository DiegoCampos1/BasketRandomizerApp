import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { z } from "zod";

import { register as apiRegister } from "@/api/auth";
import { setAccessToken, setStoredRefreshToken } from "@/api/client";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing } from "@/theme/tokens";

const schema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    password_confirm: z.string().min(1),
    organization_name: z.string().min(1),
  })
  .refine((data) => data.password === data.password_confirm, {
    path: ["password_confirm"],
    message: "mismatch",
  });

type FormValues = z.infer<typeof schema>;

function flattenApiErrors(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  return Object.values(data as Record<string, unknown>)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter((v): v is string => typeof v === "string")
    .join("\n");
}

export default function RegisterScreen() {
  const { t } = useTranslation("auth");
  const [submitError, setSubmitError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirm: "",
      organization_name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    try {
      const { user, tokens } = await apiRegister(values);
      setAccessToken(tokens.access);
      await setStoredRefreshToken(tokens.refresh);
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const data = (error as { response?: { data?: unknown } }).response?.data;
      setSubmitError(flattenApiErrors(data) || t("register.error"));
    }
  };

  const fieldError = (name: keyof FormValues, code?: string) =>
    code === "mismatch" && name === "password_confirm"
      ? t("register.passwordMismatch")
      : code
        ? t("register.error")
        : undefined;

  return (
    <Screen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingVertical: spacing["3xl"],
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="none"
      >
          <View style={{ gap: spacing["2xl"] }}>
            <Animated.View entering={FadeInDown.duration(320)}>
              <AppText variant="display">{t("register.title")}</AppText>
              <AppText variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
                {t("register.subtitle")}
              </AppText>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(320).delay(60)}
              style={{ gap: spacing.lg }}
            >
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("register.nameLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    autoComplete="name"
                    error={fieldError("name", fieldState.error?.message)}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("register.emailLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    error={fieldError("email", fieldState.error?.message)}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("register.passwordLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    secureTextEntry
                    autoComplete="new-password"
                    error={fieldError("password", fieldState.error?.message)}
                  />
                )}
              />
              <Controller
                control={control}
                name="password_confirm"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("register.confirmPasswordLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    secureTextEntry
                    error={fieldError("password_confirm", fieldState.error?.message)}
                  />
                )}
              />
              <Controller
                control={control}
                name="organization_name"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("register.orgNameLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("register.orgNameHelper")}
                    error={fieldError("organization_name", fieldState.error?.message)}
                  />
                )}
              />
              {submitError ? (
                <AppText variant="caption" color={colors.error}>
                  {submitError}
                </AppText>
              ) : null}
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(320).delay(120)}
              style={{ gap: spacing.lg }}
            >
              <Button
                label={isSubmitting ? t("register.submitting") : t("register.submitButton")}
                size="lg"
                loading={isSubmitting}
                onPress={handleSubmit(onSubmit)}
              />
              <View
                style={{ flexDirection: "row", justifyContent: "center", gap: spacing.xs }}
              >
                <AppText variant="body" tone="secondary">
                  {t("register.hasAccount")}
                </AppText>
                <Link href="/login">
                  <AppText variant="bodyStrong" tone="brand">
                    {t("register.login")}
                  </AppText>
                </Link>
              </View>
            </Animated.View>
          </View>
      </ScrollView>
    </Screen>
  );
}
