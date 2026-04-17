/** @type {import('next').NextConfig} */

// ── Build-time environment validation ────────────────────────────────────────
// Fail the Vercel build immediately if required env vars are missing.
// This prevents deploying a frontend that silently calls the wrong backend.
//
// NEXT_PUBLIC_* vars must be present at BUILD time (Next.js inlines them).
// They are NOT available at runtime from process.env in the browser.
if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "[next.config.mjs] NEXT_PUBLIC_API_URL is not set.\n" +
      "Set it in the Vercel dashboard under Settings → Environment Variables.\n" +
      "Value should be your Render service URL, e.g. https://scented-memories-backend.onrender.com"
    );
  }
}

const nextConfig = {
  images: {
    // Allow Next.js <Image> to load from the production image CDN.
    // Add additional hostnames here if product images are served from other domains.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.scentedmemories.in",
      },
    ],
  },
};

export default nextConfig;
