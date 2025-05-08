import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Skip ESLint during builds
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable any needed experimental features here
  }
};

export default nextConfig;
