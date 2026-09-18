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
      // マップ画像・ロゴは中身が変わらないので長期キャッシュしてよい。
      // (会場Wi-Fiで毎回再検証のラウンドトリップが発生するのを防ぐ)
      source: "/map/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      // /api/ 配下はRoute Handler側 (revalidate指定) がキャッシュを制御するので、
      // ここでno-cacheを強制しない。
      source: "/((?!_next/|api/|map/).*)",
      headers: [
        { key: "Cache-Control", value: "no-cache, must-revalidate" },
      ],
    },
  ],
};
export default nextConfig;
