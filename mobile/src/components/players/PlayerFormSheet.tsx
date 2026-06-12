import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, View } from "react-native";

import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import StarRatingInput from "@/components/ui/StarRatingInput";
import TextField from "@/components/ui/TextField";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { usePlayerMutations } from "@/hooks/players/usePlayerMutations";
import { colors, radius, spacing } from "@/theme/tokens";
import type { Player, Position } from "@/types/player";

const POSITIONS: Position[] = ["guard", "forward", "center"];

interface PlayerFormSheetProps {
  /** null = create mode; pending player = approve mode; approved = edit mode. */
  player: Player | null;
  onDismiss: () => void;
}

const PlayerFormSheet = forwardRef<BottomSheetModal, PlayerFormSheetProps>(
  function PlayerFormSheet({ player, onDismiss }, ref) {
    const { t } = useTranslation("players");
    const { t: tc } = useTranslation("common");
    const { positionLabels } = usePlayerLabels();
    const { createPlayer, updatePlayer, approvePlayer, deletePlayer } = usePlayerMutations();

    const isEditing = !!player;
    const isPendingApproval = isEditing && !player.is_approved;

    const [name, setName] = useState("");
    const [heightCm, setHeightCm] = useState("");
    const [position, setPosition] = useState<Position>("guard");
    const [quality, setQuality] = useState(3);
    const [submitError, setSubmitError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      setName(player?.name ?? "");
      setHeightCm(player ? String(player.height_cm) : "");
      setPosition(player?.position ?? "guard");
      setQuality(player?.quality || 3);
      setSubmitError("");
    }, [player]);

    const heightValue = parseFloat(heightCm);
    const isFormValid =
      name.trim() !== "" &&
      heightCm !== "" &&
      heightValue >= 100 &&
      heightValue <= 250 &&
      (isPendingApproval ? quality >= 1 : true);

    const handleSave = async () => {
      if (!isFormValid || saving) return;
      setSaving(true);
      setSubmitError("");
      const data = {
        name: name.trim(),
        height_cm: heightValue,
        position,
        quality,
      };

      try {
        if (isPendingApproval && player) {
          // Same sequence as web: persist edits, then approve with the rating.
          await updatePlayer.mutateAsync({ id: player.id, data });
          await approvePlayer.mutateAsync({ id: player.id, quality });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (player) {
          await updatePlayer.mutateAsync({ id: player.id, data });
        } else {
          await createPlayer.mutateAsync(data);
        }
        (ref as React.RefObject<BottomSheetModal | null>).current?.dismiss();
      } catch (error) {
        const detail = (error as { response?: { data?: { detail?: string } } }).response?.data;
        setSubmitError(
          detail && typeof detail === "object"
            ? Object.values(detail).flat().join("\n")
            : t("dialog.titleCreate")
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setSaving(false);
      }
    };

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.7}
        />
      ),
      []
    );

    const title = isPendingApproval
      ? t("dialog.titleApprove")
      : isEditing
        ? t("dialog.titleEdit")
        : t("dialog.titleCreate");

    return (
      <BottomSheetModal
        ref={ref}
        onDismiss={onDismiss}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.bg.elevated,
          borderRadius: radius.sheet,
        }}
        handleIndicatorStyle={{ backgroundColor: colors.border.strong, width: 36 }}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            padding: spacing.xl,
            paddingBottom: spacing["4xl"],
            gap: spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="title2">{title}</AppText>

          {isPendingApproval && (
            <View
              style={{
                backgroundColor: colors.warningTint,
                borderRadius: radius.input,
                padding: spacing.md,
              }}
            >
              <AppText variant="caption" color={colors.warning}>
                {t("dialog.approveAlert")}
              </AppText>
            </View>
          )}

          <TextField
            label={t("dialog.nameLabel")}
            value={name}
            onChangeText={setName}
            autoFocus={!isEditing}
          />
          <TextField
            label={t("dialog.heightLabel")}
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="numeric"
            placeholder={t("dialog.heightHelper")}
          />

          <View style={{ gap: spacing.sm }}>
            <AppText variant="micro" tone="secondary">
              {t("dialog.positionLabel")}
            </AppText>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {POSITIONS.map((pos) => {
                const selected = position === pos;
                return (
                  <Pressable
                    key={pos}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setPosition(pos);
                    }}
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: radius.pill,
                      borderWidth: selected ? 1.5 : 1,
                      borderColor: selected ? colors.brand[500] : colors.border.hairline,
                      backgroundColor: selected ? colors.brand.tint : colors.bg.raised,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AppText
                      variant="caption"
                      color={selected ? colors.brand[300] : colors.text.secondary}
                    >
                      {positionLabels[pos]}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <AppText variant="micro" tone="secondary">
                {t("dialog.qualityLabel")}
              </AppText>
              {isPendingApproval && (
                <Chip label={t("dialog.qualityRequired")} variant="warning" />
              )}
            </View>
            <StarRatingInput value={quality} onChange={setQuality} />
          </View>

          {submitError ? (
            <AppText variant="caption" color={colors.error}>
              {submitError}
            </AppText>
          ) : null}

          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.sm }}>
            <Button
              label={tc("buttons.cancel")}
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() =>
                (ref as React.RefObject<BottomSheetModal | null>).current?.dismiss()
              }
            />
            <Button
              label={
                isPendingApproval
                  ? t("dialog.buttonApprove")
                  : isEditing
                    ? t("dialog.buttonSave")
                    : t("dialog.buttonCreate")
              }
              style={{ flex: 1 }}
              disabled={!isFormValid}
              loading={saving}
              onPress={handleSave}
            />
          </View>

          {isEditing && player && (
            <Button
              label={t("deleteButton")}
              variant="destructive"
              onPress={() => {
                Alert.alert(player.name, tc("confirm.deletePlayer"), [
                  { text: tc("buttons.cancel"), style: "cancel" },
                  {
                    text: "OK",
                    style: "destructive",
                    onPress: async () => {
                      await deletePlayer.mutateAsync(player.id);
                      (ref as React.RefObject<BottomSheetModal | null>).current?.dismiss();
                    },
                  },
                ]);
              }}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

export default PlayerFormSheet;
