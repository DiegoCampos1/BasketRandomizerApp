import apiClient from "@/api/client";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/auth";

export async function login(data: LoginRequest): Promise<{ access: string; refresh: string }> {
  const response = await apiClient.post("/auth/login/", data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/register/", data);
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get("/auth/me/");
  return response.data;
}
