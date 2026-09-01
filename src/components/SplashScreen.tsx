"use client";
import { useState, useEffect } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1500);
    const hideTimer = setTimeout(() => setVisible(false), 2000);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <img src="/logo-cocotap-splash.png" alt="COCO TAP" className="w-56" />
    </div>
  );
}
