import type { Metadata, Viewport } from "next";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import OnboardingModal from "@/components/OnboardingModal";
import GenderPrompt from "@/components/GenderPrompt";

export const metadata: Metadata = {
  title: "ココフリマ",
  description: "ココフリマ 出店者の商品を探せるアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet"/>
      </head>
      <body style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
        <SplashScreen />
        <OnboardingModal />
        <GenderPrompt />
        {children}
      </body>
    </html>
  );
}
