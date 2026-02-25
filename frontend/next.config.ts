import type { NextConfig } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BASE_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
