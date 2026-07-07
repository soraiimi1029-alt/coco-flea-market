import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.86.27"],
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
