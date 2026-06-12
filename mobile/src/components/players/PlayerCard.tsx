import { View } from "react-native";

import AppText from "@/components/ui/AppText";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import StarRating from "@/components/ui/StarRating";
import { usePlayerLabels } from "@/hooks/usePlayerLabels";
import { colors, fonts, radius, spacing } from "@/theme/tokens";
import type { Player } from "@/types/player";

const AVATAR_PALETTE = ["#2D2A3A", "#1F2D3A", "#2A3329", "#3A2A2A", "#332D24"];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index] ?? AVATAR_PALETTE[0]!;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

interface PlayerCardProps {
  player: Player;
  pendingLabel?: string;
  onPress?: () => void;
  /** Extra content rendered on the right edge (e.g. inline approve button). */
  trailing?: React.ReactNode;
}

export default function PlayerCard({ player, pendingLabel, onPress, trailing }: PlayerCardProps) {
  const { positionLabels, heightCategoryLabels } = usePlayerLabels();
  const pending = !player.is_approved;

  const a11yLabel = [
    player.name,
    positionLabels[player.position],
    heightCategoryLabels[player.height_category],
    player.is_approved ? `${player.quality} estrelas` : pendingLabel,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={a11yLabel}
      style={{
        padding: spacing.md,
        ...(pending
          ? { borderLeftWidth: 3, borderLeftColor: colors.warning }
          : null),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.pill,
            backgroundColor: avatarColor(player.name),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText
            variant="caption"
            style={{ fontFamily: fonts.bold, fontSize: 14 }}
          >
            {initials(player.name)}
          </AppText>
        </View>

        <View style={{ flex: 1, gap: spacing.xs }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <AppText variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
              {player.name}
            </AppText>
            {pending && pendingLabel ? <Chip label={pendingLabel} variant="warning" /> : null}
          </View>
          <View style={{ flexDirection: "row", gap: spacing.xs + 2 }}>
            <Chip label={positionLabels[player.position]} variant="outlined" />
            <Chip
              label={`${heightCategoryLabels[player.height_category]} · ${Math.round(player.height_cm)}cm`}
              variant="filled"
            />
          </View>
        </View>

        {trailing ?? (player.is_approved ? <StarRating value={player.quality} /> : null)}
      </View>
    </Card>
  );
}
