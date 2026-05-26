import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles only the necessary files for deployment
  // This significantly reduces Vercel build size
  output: "standalone",

  // Allow images from any HTTPS origin (adjust as needed)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Expose the backend API URL to client-side code
  // NEXT_PUBLIC_API_URL must be set in Vercel environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;
