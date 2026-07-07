"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Users, Map, Bell, BarChart2, ChevronRight, LogOut } from "lucide-react";
import { EVENT } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { clearSession } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [vendorCount, setVendorCount] = useState<number | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("flea_role");
    if (role !== "admin") { router.push("/login?as=admin"); return; }
    (async () => {
      const [{ count: vCount }, { count: pCount }] = await Promise.all([
        supabase.from("vendors_public").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);
      setVendorCount(vCount ?? 0);
      setProductCount(pCount ?? 0);
    })();
  }, [router]);

  const logout = () => { clearSession(); router.push("/login"); };

  const menus = [
    { icon: Users, label: "出店者管理", sub: "アカウント発行・パスワード変更", href: "/admin/vendors" },
    { icon: BarChart2, label: "広告バナー管理", sub: "ホーム画面の広告を追加・削除", href: "/admin/banners" },
    { icon: Map, label: "マップ・ブース管理", sub: "配置・ブース番号設定", href: null },
    { icon: Calendar, label: "イベント管理", sub: "作成・編集・公開設定", href: null },
    { icon: Bell, label: "お知らせ配信", sub: "来場者へのアナウンス", href: null },
  ];

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen">
      <div className="bg-brand px-4 pt-12 pb-5">
        <div className="flex justify-between items-center mb-4">
          <div />
          <button onClick={logout} className="flex items-center gap-1 text-white/70 text-xs">
            <LogOut size={14} /> ログアウト
          </button>
        </div>
        <h1 className="text-base font-bold text-white mb-1">管理者パネル</h1>
        <p className="text-xs text-white/70">{EVENT.title}</p>
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          {[
            { label: "出店者数", value: vendorCount ?? "…", unit: "組" },
            { label: "登録商品数", value: productCount ?? "…", unit: "点" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-[11px] text-white/60 mb-1">{s.label}</p>
              <p className="text-xl font-bold text-white">
                {s.value}<span className="text-xs font-normal text-white/60 ml-0.5">{s.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 pb-24">
        <p className="text-[11px] font-bold text-ink-soft tracking-widest mb-3">管理メニュー</p>
        <div className="flex flex-col gap-2">
          {menus.map(({ icon: Icon, label, sub, href }) => {
            const content = (
              <>
                <div className="w-9 h-9 bg-brand-light rounded-lg flex items-center justify-center text-brand-dark flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{label}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5">{sub}</p>
                </div>
                <ChevronRight size={16} className="text-ink-soft flex-shrink-0" />
              </>
            );
            return href ? (
              <Link key={label} href={href}
                className="bg-surface rounded-xl px-4 py-3.5 flex items-center gap-3 border border-border w-full text-left">
                {content}
              </Link>
            ) : (
              <button key={label}
                className="bg-surface rounded-xl px-4 py-3.5 flex items-center gap-3 border border-border w-full text-left opacity-60">
                {content}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <Link href="/dashboard"
            className="bg-brand rounded-xl px-4 py-3.5 flex items-center justify-between block">
            <div>
              <p className="text-sm font-bold text-white">出店者ダッシュボード</p>
              <p className="text-xs text-white/70 mt-0.5">商品・プロフィール管理</p>
            </div>
            <ChevronRight size={18} className="text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
