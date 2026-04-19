"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/authStore";
import { ApiClientError } from "@/lib/apiClient";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const response = await authApi.register(form);
      setAuth(response);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.apiError.errors) setErrors(err.apiError.errors);
        else setErrors({ _global: err.apiError.message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Join us</p>
          <h1 className="font-serif text-3xl text-espresso font-light">Create Account</h1>
          <div className="w-8 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Card */}
        <div className="bg-white border border-sand p-6 sm:p-10">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {[
              { name: "fullName", label: "Full Name", type: "text", placeholder: "Your name" },
              { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
              { name: "password", label: "Password", type: "password", placeholder: "Min. 8 characters" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
                  {label}
                </label>
                <input
                  id={name} name={name} type={type} required
                  placeholder={placeholder}
                  value={form[name as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                  className={`input-field ${errors[name] ? "input-error" : ""}`}
                />
                {errors[name] && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{errors[name]}</p>
                )}
              </div>
            ))}
            {errors._global && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-3">
                {errors._global}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-taupe mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brown hover:text-espresso transition-colors underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
