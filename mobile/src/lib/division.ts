import type { Division, TeamPlayer } from "@/types/division";

/**
 * Pure optimistic move — mirrors the web implementation, keeping the
 * total_quality and player_count bookkeeping consistent so the UI reflects
 * the move instantly while the API call is in flight.
 */
export function applyOptimisticMove(
  division: Division,
  teamPlayerId: string,
  targetTeamId: string
): Division {
  const teams = division.teams.map((team) => ({
    ...team,
    team_players: [...team.team_players],
  }));

  let movedPlayer: TeamPlayer | undefined;

  for (const team of teams) {
    const idx = team.team_players.findIndex((tp) => tp.id === teamPlayerId);
    if (idx !== -1) {
      movedPlayer = team.team_players.splice(idx, 1)[0];
      if (movedPlayer) {
        team.total_quality -= movedPlayer.player.quality;
        team.player_count -= 1;
      }
      break;
    }
  }

  if (movedPlayer) {
    const target = teams.find((t) => t.id === targetTeamId);
    if (target) {
      target.team_players.push(movedPlayer);
      target.total_quality += movedPlayer.player.quality;
      target.player_count += 1;
    }
  }

  return { ...division, teams };
}
