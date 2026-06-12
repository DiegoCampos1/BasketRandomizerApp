import { colors, gradients } from "./tokens";

interface TeamLike {
  group: string;
  name: string;
}

function isBlackTeam(team: TeamLike): boolean {
  const haystack = `${team.group} ${team.name}`.toLowerCase();
  return haystack.includes("preto");
}

export interface TeamIdentity {
  accent: string;
  tint: string;
  glow: string;
  /** Vertical gradient for the card header strip. */
  headerGradient: readonly [string, string];
  emoji: string;
}

/**
 * Team Preto becomes an "onyx" silver identity on the dark theme — the web's
 * #0F172A black is invisible on #0A0A0F.
 */
export function getTeamIdentity(team: TeamLike): TeamIdentity {
  if (isBlackTeam(team)) {
    return {
      accent: colors.team.onyx,
      tint: colors.team.onyxTint,
      glow: colors.team.onyxGlow,
      headerGradient: gradients.carbon,
      emoji: "⬛",
    };
  }
  return {
    accent: colors.team.red,
    tint: colors.team.redTint,
    glow: colors.team.redGlow,
    headerGradient: [colors.team.redTint, "rgba(244,82,77,0.02)"] as const,
    emoji: "🟥",
  };
}

/** Same emoji mapping as the web's getTeamEmoji — share text stays identical. */
export function getTeamEmoji(team: TeamLike): string {
  return getTeamIdentity(team).emoji;
}
