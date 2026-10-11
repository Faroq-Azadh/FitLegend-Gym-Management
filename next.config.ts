import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL;

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    if (!apiBaseUrl) return [];
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${apiBaseUrl.replace(/\/$/, "")}/api/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
