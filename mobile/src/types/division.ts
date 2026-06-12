import { Player } from "./player";

export type DivisionMode = "2_teams" | "4_teams";

export interface TeamPlayer {
  id: string;
  player: Player;
  order: number;
}

export interface Team {
  id: string;
  name: string;
  group: string;
  team_players: TeamPlayer[];
  total_quality: number;
  player_count: number;
}

export interface Division {
  id: string;
  date: string;
  mode: DivisionMode;
  created_by_name: string;
  teams: Team[];
  created_at: string;
}

export interface DivisionListItem {
  id: string;
  date: string;
  mode: DivisionMode;
  created_by_name: string;
  team_count: number;
  player_count: number;
  created_at: string;
}

export interface CreateDivisionInput {
  player_ids: string[];
  mode: DivisionMode;
  date: string;
}

export interface SwapPlayersInput {
  player_a_id: string;
  player_b_id: string;
}

export interface MovePlayerInput {
  team_player_id: string;
  target_team_id: string;
}
