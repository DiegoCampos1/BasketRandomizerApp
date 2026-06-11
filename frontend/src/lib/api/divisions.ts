import {
  CreateDivisionInput,
  Division,
  DivisionListItem,
  MovePlayerInput,
  SwapPlayersInput,
} from "@/types/division";
import apiClient, { getAllPages } from "./client";

export async function getDivisions(): Promise<DivisionListItem[]> {
  return getAllPages<DivisionListItem>("/divisions/");
}

export async function getDivision(id: string): Promise<Division> {
  const response = await apiClient.get(`/divisions/${id}/`);
  return response.data;
}

export async function createDivision(data: CreateDivisionInput): Promise<Division> {
  const response = await apiClient.post("/divisions/", data);
  return response.data;
}

export async function swapPlayers(divisionId: string, data: SwapPlayersInput): Promise<Division> {
  const response = await apiClient.post(`/divisions/${divisionId}/swap/`, data);
  return response.data;
}

export async function movePlayer(
  divisionId: string,
  data: MovePlayerInput
): Promise<Division> {
  const response = await apiClient.post(
    `/divisions/${divisionId}/move/`,
    data
  );
  return response.data;
}

export async function deleteDivision(id: string): Promise<void> {
  await apiClient.delete(`/divisions/${id}/`);
}
