"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { ApiClientError } from "@/lib/apiClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, initFromStorage, user, isAdmin } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect immediately
  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (user && isAdmin) router.replace("/admin");
    else if (user && !isAdmin) setError("Access denied. Admin credentials required.");
  }, [user, isAdmin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(form);

      if (response.role !== "ADMIN") {
        setError("Access denied. This portal is for administrators only.");
        return;
      }

      setAuth(response);
      router.push("/admin");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          err.apiError.status === 401
            ? "Invalid email or password."
            : err.apiError.message
        );
      } else {
        setError("Unable to connect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-4">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-serif text-3xl text-cream tracking-widest mb-1">ScentedMemories</p>
          <div className="w-8 h-px bg-gold mx-auto mb-3" />
          <p className="text-xs tracking-[0.3em] uppercase text-taupe">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-warm-white border border-sand/20 p-10">
          <h1 className="font-serif text-2xl text-espresso font-light mb-1">Welcome back</h1>
          <p className="text-xs text-taupe tracking-wide mb-8">Sign in to manage your store</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
                placeholder="admin@scentedmemories.in"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 px-4 py-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p role="alert" className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-espresso text-cream text-xs tracking-[0.2em] uppercase font-medium hover:bg-brown transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Security note */}
        <p className="text-center text-[10px] text-taupe/60 tracking-wide mt-6">
          🔒 Secure admin access only. Unauthorised access is prohibited.
        </p>
      </div>
    </div>
  );
}
