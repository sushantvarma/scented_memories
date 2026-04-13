"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, clearAuth, initFromStorage } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { initFromStorage(); }, [initFromStorage]);

  useEffect(() => {
    // Don't redirect from the admin login page itself
    if (pathname === "/admin/login") return;

    if (!user) {
      router.replace("/admin/login");
    } else if (!isAdmin) {
      router.replace("/");
    }
  }, [user, isAdmin, router, pathname]);

  // Render the login page without the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!user || !isAdmin) return null;

  function handleLogout() {
    clearAuth();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F3F0] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-espresso flex-shrink-0 flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-serif text-lg text-cream tracking-widest">ScentedMemories</p>
          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mt-0.5">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-150 ${
                  active
                    ? "bg-white/10 text-cream"
                    : "text-taupe hover:text-cream hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span className="tracking-wide">{item.label}</span>
                {active && <div className="ml-auto w-1 h-4 bg-gold rounded-full" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-6 border-t border-white/10">
          {/* View store link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 py-4 text-xs text-taupe hover:text-cream transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="tracking-widest uppercase">View Store</span>
          </Link>
        </div>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold text-xs font-medium">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-cream truncate">{user.fullName}</p>
              <p className="text-[10px] text-taupe truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-taupe hover:text-cream hover:bg-white/5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="tracking-widest uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-sand px-8 py-4 flex items-center justify-between">
          <div>
            {NAV_ITEMS.find((n) => n.href === pathname) && (
              <h1 className="font-serif text-xl text-espresso">
                {NAV_ITEMS.find((n) => n.href === pathname)?.label}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-taupe">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Connected to Neon DB</span>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
