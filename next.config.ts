import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.5'],
  // 'standalone' is required for Docker builds, but conflicts with Vercel's native deployment pipeline
  output: isVercel ? undefined : 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@/data'],
  },
};

export default nextConfig;
