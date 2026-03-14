import {
  CreateDivisionInput,
  Division,
  DivisionListItem,
  SwapPlayersInput,
} from "@/types/division";
import apiClient from "./client";

export async function getDivisions(): Promise<DivisionListItem[]> {
  const response = await apiClient.get("/divisions/");
  return response.data.results || response.data;
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

export async function deleteDivision(id: string): Promise<void> {
  await apiClient.delete(`/divisions/${id}/`);
}
