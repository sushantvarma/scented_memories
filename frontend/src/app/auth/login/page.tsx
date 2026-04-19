"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { ApiClientError } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(form);
      setAuth(response);
      router.push(response.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.apiError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Welcome back</p>
          <h1 className="font-serif text-3xl text-espresso font-light">Sign In</h1>
          <div className="w-8 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Card */}
        <div className="bg-white border border-sand p-6 sm:p-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
                Email Address
              </label>
              <input
                id="email" type="email" required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
                Password
              </label>
              <input
                id="password" type="password" required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-taupe mt-6">
          No account?{" "}
          <Link href="/auth/register" className="text-brown hover:text-espresso transition-colors underline underline-offset-2">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
