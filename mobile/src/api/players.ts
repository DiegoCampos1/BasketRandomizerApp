import apiClient, { getAllPages } from "@/api/client";
import type { CreatePlayerInput, Player, UpdatePlayerInput } from "@/types/player";

export async function getPlayers(): Promise<Player[]> {
  return getAllPages<Player>("/players/");
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

export async function approvePlayer(id: string, quality: number): Promise<Player> {
  const response = await apiClient.post(`/players/${id}/approve/`, { quality });
  return response.data;
}
