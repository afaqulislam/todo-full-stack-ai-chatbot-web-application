import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://afaqulislam-todo-full-stack-ai-chatbot-web-appli-3149b07.hf.space/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
