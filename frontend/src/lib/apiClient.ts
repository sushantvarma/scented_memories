/**
 * ScentedMemories API client
 *
 * - Base URL from NEXT_PUBLIC_API_URL
 * - Injects Authorization: Bearer <token> from localStorage on protected requests
 * - Retries on 503 with exponential backoff (Render free-tier cold start)
 * - Normalises ALL errors to ApiError shape — never throws a raw Error or
 *   a secondary parse error on top of the real failure
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

// Render free tier spins down after inactivity. On cold start the container
// may take 30–50 s to respond. We retry 503s and network failures with
// exponential backoff up to ~35 s total (2 + 4 + 8 + 16 = 30 s of wait).
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // 2 s → 4 s → 8 s

export class ApiClientError extends Error {
  constructor(public readonly apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiClientError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sm_token");
}

/**
 * Safely parse a response body as JSON.
 * Returns null if the body is empty, HTML, or otherwise not valid JSON.
 * This guards against Render's HTML error pages during cold start.
 */
async function safeJson(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
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

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      // Disable Next.js fetch cache for SSR pages so product data is always
      // fresh. Without this, Next.js 14 App Router caches fetch() responses
      // indefinitely by default, causing stale image URLs and prices.
      cache: "no-store",
    });
  } catch (networkError) {
    // fetch() itself threw — network unreachable, DNS failure, or Render
    // gateway returning a non-HTTP response during cold start.
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
      return request<T>(path, options, retries - 1, delayMs * 2);
    }
    throw new ApiClientError({
      status: 0,
      message: "Unable to reach the server. Please try again in a moment.",
    });
  }

  // Render cold-start: the JVM is up but not yet ready — retry on 503.
  if (response.status === 503 && retries > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
    return request<T>(path, options, retries - 1, delayMs * 2);
  }

  if (!response.ok) {
    // Try to parse the backend's ErrorResponse JSON.
    // Fall back to a generic message if the body is HTML or empty
    // (e.g. Render gateway errors, Spring Security default error pages).
    const body = await safeJson(response);
    const apiError: ApiError =
      body && typeof body === "object" && "message" in body
        ? (body as ApiError)
        : { status: response.status, message: httpStatusMessage(response.status) };

    throw new ApiClientError(apiError);
  }

  // 204 No Content — return undefined without trying to parse an empty body
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/** Human-readable fallback for when the backend returns no JSON body. */
function httpStatusMessage(status: number): string {
  switch (status) {
    case 400: return "Bad request.";
    case 401: return "You must be logged in to do that.";
    case 403: return "You don't have permission to do that.";
    case 404: return "Not found.";
    case 409: return "Conflict — the request could not be completed.";
    case 422: return "Unprocessable request.";
    case 500: return "Server error. Please try again later.";
    case 503: return "Server is starting up. Please wait a moment and try again.";
    default:  return `Unexpected error (HTTP ${status}).`;
  }
}

export const apiClient = {
  get:    <T>(path: string)                  => request<T>(path),
  post:   <T>(path: string, body: unknown)   => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)   => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)                  => request<T>(path, { method: "DELETE" }),
};
