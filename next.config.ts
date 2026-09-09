import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.86.*"],
  images: {
    // Vercel's image optimizer (`/_next/image`) has a usage quota that this
    // project has exhausted, which was returning 402 Payment Required for
    // every photo on the site. Supabase Storage already serves images over
    // its own CDN, so skip Vercel's optimizer and load them directly.
    unoptimized: true,
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
