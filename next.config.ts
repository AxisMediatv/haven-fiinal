import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily removed CSP for testing
  async headers() {
    return [
      {
        source: '/haven-chat/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/haven-chat/:path*',
        destination: '/public/haven-chat/:path*',
      },
    ];
  },
};

export default nextConfig;
