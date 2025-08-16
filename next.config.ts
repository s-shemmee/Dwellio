import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co', 'example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
  reactStrictMode: true,
};

export default nextConfig;
