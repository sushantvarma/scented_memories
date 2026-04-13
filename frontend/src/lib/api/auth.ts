import { apiClient } from "@/lib/apiClient";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authApi = {
  register: (request: RegisterRequest) =>
    apiClient.post<AuthResponse>("/api/auth/register", request),

  login: (request: LoginRequest) =>
    apiClient.post<AuthResponse>("/api/auth/login", request),
};
