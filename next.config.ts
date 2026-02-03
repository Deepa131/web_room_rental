import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5050',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '5050',
      },
    ],
  },
};

export default nextConfig;
