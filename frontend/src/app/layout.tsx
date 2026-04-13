import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: { default: "ScentedMemories", template: "%s | ScentedMemories" },
  description: "Premium home fragrance and wellness products",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream">
        <Navbar />
        <main className="pt-16">{children}</main>
        <footer className="mt-24 border-t border-sand py-12 text-center">
          <p className="font-serif text-2xl text-espresso tracking-wide mb-2">ScentedMemories</p>
          <p className="text-sm text-taupe tracking-widest uppercase">
            Premium Home Fragrance &amp; Wellness
          </p>
          <p className="mt-6 text-xs text-taupe">© {new Date().getFullYear()} ScentedMemories. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
