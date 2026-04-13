/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.scentedmemories.in",
      },
    ],
  },
};

export default nextConfig;
