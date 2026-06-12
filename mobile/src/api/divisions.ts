import apiClient, { getAllPages } from "@/api/client";
import type {
  CreateDivisionInput,
  Division,
  DivisionListItem,
  MovePlayerInput,
} from "@/types/division";

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

export async function movePlayer(divisionId: string, data: MovePlayerInput): Promise<Division> {
  const response = await apiClient.post(`/divisions/${divisionId}/move/`, data);
  return response.data;
}

export async function deleteDivision(id: string): Promise<void> {
  await apiClient.delete(`/divisions/${id}/`);
}
