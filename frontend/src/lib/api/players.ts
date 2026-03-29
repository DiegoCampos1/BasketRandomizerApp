import { CreatePlayerInput, Player, PublicCreatePlayerInput, UpdatePlayerInput } from "@/types/player";
import apiClient from "./client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export async function approvePlayer(id: string, quality: number): Promise<Player> {
  const response = await apiClient.post(`/players/${id}/approve/`, { quality });
  return response.data;
}

export async function publicCreatePlayer(
  slug: string,
  data: PublicCreatePlayerInput,
): Promise<{ detail: string }> {
  const response = await axios.post(`${API_URL}/org/${slug}/players/register/`, data);
  return response.data;
}

export async function getOrganizationInfo(
  slug: string,
): Promise<{ name: string; slug: string }> {
  const response = await axios.get(`${API_URL}/org/${slug}/info/`);
  return response.data;
}
