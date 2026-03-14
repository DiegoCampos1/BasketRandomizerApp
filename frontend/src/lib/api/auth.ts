import { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/auth";
import apiClient from "./client";

export async function login(data: LoginRequest): Promise<{ access: string; refresh: string }> {
  const response = await apiClient.post("/auth/login/", data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/register/", data);
  return response.data;
}

export async function refreshToken(refresh: string): Promise<{ access: string; refresh?: string }> {
  const response = await apiClient.post("/auth/refresh/", { refresh });
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get("/auth/me/");
  return response.data;
}
