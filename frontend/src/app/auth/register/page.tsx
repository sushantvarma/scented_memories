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
    <div>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} noValidate>
        {[
          { name: "fullName", label: "Full Name", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "password", label: "Password", type: "password" },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <label htmlFor={name}>{label}</label>
            <input
              id={name} name={name} type={type} required
              value={form[name as keyof typeof form]}
              onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
            />
            {errors[name] && <span role="alert">{errors[name]}</span>}
          </div>
        ))}
        {errors._global && <p role="alert">{errors._global}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      <p>Already have an account? <Link href="/auth/login">Login</Link></p>
    </div>
  );
}
