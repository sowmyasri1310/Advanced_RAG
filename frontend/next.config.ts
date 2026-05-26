import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rely on default Next.js server-side build mode for Vercel
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
