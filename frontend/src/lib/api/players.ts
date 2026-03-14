import { CreatePlayerInput, Player, UpdatePlayerInput } from "@/types/player";
import apiClient from "./client";

export async function getPlayers(): Promise<Player[]> {
  const response = await apiClient.get("/players/");
  return response.data.results || response.data;
}

export async function getPlayer(id: string): Promise<Player> {
  const response = await apiClient.get(`/players/${id}/`);
  return response.data;
}

export async function createPlayer(data: CreatePlayerInput): Promise<Player> {
  const response = await apiClient.post("/players/", data);
  return response.data;
}

export async function updatePlayer(id: string, data: UpdatePlayerInput): Promise<Player> {
  const response = await apiClient.patch(`/players/${id}/`, data);
  return response.data;
}

export async function deletePlayer(id: string): Promise<void> {
  await apiClient.delete(`/players/${id}/`);
}
