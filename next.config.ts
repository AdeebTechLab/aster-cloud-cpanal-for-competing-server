import path from "node:path";
import type { NextConfig } from "next";

const backendApiUrl = (
  process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, ".."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
