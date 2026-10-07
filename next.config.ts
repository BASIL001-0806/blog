import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, max-age=0, must-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
          { key: "Vary", value: "Authorization, Cookie" },
        ],
      },
    ];
  },
};

export default nextConfig;
