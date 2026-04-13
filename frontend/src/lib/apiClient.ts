/**
 * ScentedMemories API client
 *
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Injects Authorization: Bearer <token> from localStorage on protected requests
 * - Retries on 503 with exponential backoff (Render free-tier cold start)
 * - Normalises all errors to ApiError shape
 */

import type { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // 2s → 4s → 8s

class ApiClientError extends Error {
  constructor(public readonly apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sm_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retries = MAX_RETRIES,
  delayMs = INITIAL_RETRY_DELAY_MS
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Render cold-start: retry on 503
  if (response.status === 503 && retries > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
    return request<T>(path, options, retries - 1, delayMs * 2);
  }

  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = await response.json();
    } catch {
      apiError = { status: response.status, message: response.statusText };
    }
    throw new ApiClientError(apiError);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiClientError };
