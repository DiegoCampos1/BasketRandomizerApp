import { Team } from "@/types/division";

export const TEAM_BLACK = "#0F172A";
export const TEAM_RED = "#EF4444";

export function getTeamColor(team: Pick<Team, "group" | "name">): string {
  const text = (team.group || team.name).toLowerCase();
  if (text.includes("preto")) return TEAM_BLACK;
  return TEAM_RED;
}

export function getTeamEmoji(team: Pick<Team, "group" | "name">): string {
  const text = (team.group || team.name).toLowerCase();
  if (text.includes("preto")) return "⬛";
  return "🟥";
}
