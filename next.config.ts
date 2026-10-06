import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  // Vercel ignores this and builds its own way.
  output: "standalone",
};

export default nextConfig;
