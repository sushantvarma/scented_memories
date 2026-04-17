/**
 * ScentedMemories API client
 *
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Injects Authorization: Bearer <token> from localStorage on protected requests
 * - Retries on 503 with exponential backoff (Render free-tier cold start)
 * - Normalises all errors to ApiError shape
 */

import type { ApiError } from "@/types";

// NEXT_PUBLIC_API_URL must be set in every environment:
//   - Local dev:  frontend/.env.local  → http://localhost:8080
//   - Vercel:     Environment variable → https://<your-render-service>.onrender.com
//
// In production (server-side), throw immediately if the variable is missing so
// the build fails loudly rather than silently calling localhost.
const BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    // During SSR / build on Vercel, window is undefined — throw to surface the
    // misconfiguration early. In the browser, fall back to localhost so local
    // development without .env.local still works.
    if (typeof window === "undefined") {
      throw new Error(
        "NEXT_PUBLIC_API_URL is not set. " +
        "Add it to .env.local for local dev or set it as an environment variable on Vercel."
      );
    }
    return "http://localhost:8080";
  }
  return url;
})();

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
