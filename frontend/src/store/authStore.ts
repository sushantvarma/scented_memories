/**
 * Auth store — holds JWT and user info in memory.
 * JWT is also persisted to localStorage (MVP trade-off; httpOnly cookie is post-MVP).
 */

import { create } from "zustand";
import type { AuthResponse } from "@/types";

interface AuthStore {
  user: Omit<AuthResponse, "token"> | null;
  token: string | null;
  isAdmin: boolean;
  setAuth: (response: AuthResponse) => void;
  clearAuth: () => void;
  initFromStorage: () => void;
}

const TOKEN_KEY = "sm_token";
const USER_KEY = "sm_user";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAdmin: false,

  setAuth: (response) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      }));
    }
    set({
      token: response.token,
      user: { id: response.id, fullName: response.fullName, email: response.email, role: response.role },
      isAdmin: response.role === "ADMIN",
    });
  },

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({ token: null, user: null, isAdmin: false });
  },

  initFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as AuthResponse;
        set({ token, user, isAdmin: user.role === "ADMIN" });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  },
}));
