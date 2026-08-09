"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Map, Heart, Store } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/favorites", icon: Heart, label: "お気に入り" },
  { href: "/search", icon: Search, label: "検索" },
  { href: "/map", icon: Map, label: "マップ" },
  { href: "/vendors", icon: Store, label: "出店者" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full sm:max-w-[390px] sm:mx-auto bg-white border-t border-ink/10 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex justify-around py-2 z-10"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-1 min-w-[56px] text-[10px] font-medium transition-colors
              ${active ? "text-navy" : "text-ink-soft"}`}>
            <span className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${active ? "bg-navy/10" : ""}`}>
              <Icon size={20} />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
