"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function Navbar() {
  const itemCount = useCartStore((s) => s.itemCount());
  const { user, isAdmin, clearAuth, initFromStorage } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { initFromStorage(); }, [initFromStorage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm" : "bg-cream"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl text-espresso tracking-widest hover:text-brown transition-colors"
        >
          ScentedMemories
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/products"
            className="text-xs tracking-widest uppercase text-espresso hover:text-brown transition-colors font-medium"
          >
            Shop
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-xs tracking-widest uppercase text-espresso hover:text-brown transition-colors font-medium"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-6">
          {user ? (
            <button
              onClick={clearAuth}
              className="text-xs tracking-widest uppercase text-taupe hover:text-espresso transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs tracking-widest uppercase text-taupe hover:text-espresso transition-colors"
            >
              Login
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-xs tracking-widest uppercase text-espresso hover:text-brown transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-espresso text-cream text-[10px] flex items-center justify-center rounded-full font-medium">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
