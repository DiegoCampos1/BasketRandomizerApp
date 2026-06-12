import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { z } from "zod";

import { login } from "@/api/auth";
import { API_URL } from "@/api/urls";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import { useAuthStore } from "@/stores/authStore";
import { colors, spacing } from "@/theme/tokens";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { t } = useTranslation("auth");
  const authLogin = useAuthStore((s) => s.login);
  const [submitError, setSubmitError] = useState("");
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    try {
      const tokens = await login(values);
      await authLogin(tokens.access, tokens.refresh);
    } catch {
      setSubmitError(t("login.error"));
    }
  };

  return (
    <Screen>
      <LinearGradient
        colors={["rgba(255,107,44,0.12)", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320 }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="none"
      >
          <View style={{ gap: spacing["2xl"] }}>
            <Animated.View entering={FadeInDown.duration(320)}>
              <AppText variant="displayXl">{"Draft\nSquad"}</AppText>
              <View
                style={{
                  width: 64,
                  height: 3,
                  backgroundColor: colors.brand[500],
                  marginTop: spacing.sm,
                  borderRadius: 2,
                }}
              />
              <AppText variant="body" tone="secondary" style={{ marginTop: spacing.md }}>
                {t("login.subtitle")}
              </AppText>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.duration(320).delay(60)}
              style={{ gap: spacing.lg }}
            >
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("login.emailLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    error={fieldState.error ? t("login.error") : undefined}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <TextField
                    label={t("login.passwordLabel")}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    secureTextEntry
                    autoComplete="password"
                    error={fieldState.error ? t("login.error") : undefined}
                    onSubmitEditing={handleSubmit(onSubmit)}
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
                label={isSubmitting ? t("login.submitting") : t("login.submitButton")}
                size="lg"
                loading={isSubmitting}
                onPress={handleSubmit(onSubmit)}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: spacing.xs,
                }}
              >
                <AppText variant="body" tone="secondary">
                  {t("login.noAccount")}
                </AppText>
                <Link href="/register">
                  <AppText variant="bodyStrong" tone="brand">
                    {t("login.register")}
                  </AppText>
                </Link>
              </View>
            </Animated.View>
          </View>
      </ScrollView>
      {__DEV__ && (
        <AppText
          variant="caption"
          tone="tertiary"
          style={{ textAlign: "center", paddingBottom: spacing.sm }}
        >
          API: {API_URL}
        </AppText>
      )}
    </Screen>
  );
}
