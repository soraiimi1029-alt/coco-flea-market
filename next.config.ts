import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.86.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbbaxkpiirtdwadmjybl.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  headers: async () => [
    {
      source: "/((?!_next/).*)",
      headers: [
        { key: "Cache-Control", value: "no-cache, must-revalidate" },
      ],
    },
  ],
};
export default nextConfig;
