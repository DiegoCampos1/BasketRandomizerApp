import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import { Share, type View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { translateTeamName } from "@/lib/teamNames";
import { getTeamEmoji } from "@/theme/teamColors";
import type { Division } from "@/types/division";
import type { Position } from "@/types/player";

type TFunction = (key: string, options?: Record<string, unknown>) => string;

/**
 * Builds the share text in the exact same format as the web app's
 * "copy text" action, so groups receive identical messages from both.
 */
export function buildDivisionShareText(
  division: Division,
  t: TFunction,
  positionLabels: Record<Position, string>,
  locale: string
): string {
  const dateStr = new Date(division.date).toLocaleDateString(locale);
  const header = `🏀 ${t("share.textHeader", { date: dateStr })}`;

  const teamsText = division.teams
    .map((team) => {
      const playerLines = team.team_players
        .map((tp) => `- ${tp.player.name} | ${positionLabels[tp.player.position]}`)
        .join("\n");
      const count = t("share.playerCount", { count: team.team_players.length });
      const name = translateTeamName(team.name, t);
      return `\n${getTeamEmoji(team)} ${name} (${count})\n${playerLines}`;
    })
    .join("\n");

  return `${header}\n${teamsText}`;
}

export async function shareDivisionText(
  division: Division,
  t: TFunction,
  positionLabels: Record<Position, string>,
  locale: string
): Promise<void> {
  await Share.share({
    message: buildDivisionShareText(division, t, positionLabels, locale),
  });
}

export async function shareViewAsImage(ref: RefObject<View | null>): Promise<void> {
  if (!ref.current) return;
  const uri = await captureRef(ref, {
    format: "png",
    quality: 1,
    result: "tmpfile",
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png" });
  }
}
