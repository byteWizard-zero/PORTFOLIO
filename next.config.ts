import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.5'],
  // 'standalone' is required for Docker builds, but conflicts with Vercel's native deployment pipeline
  output: isVercel ? undefined : 'standalone',
};

export default nextConfig;
