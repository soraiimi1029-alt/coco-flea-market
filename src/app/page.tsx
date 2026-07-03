"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserCircle, Heart, MapPin } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import { CATEGORIES } from "@/lib/mock-data";
import { SPONSORS } from "@/lib/sponsors";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";
import type { VendorRow, ProductRow } from "@/lib/types";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [vendorMap, setVendorMap] = useState<Record<string, VendorRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const deviceId = getDeviceId();
      const [{ data: vendorRows }, { data: productRows }, { data: likeRows }] = await Promise.all([
        supabase.from("vendors_public").select("*"),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("likes").select("product_id").eq("device_id", deviceId),
      ]);
      const map: Record<string, VendorRow> = {};
      (vendorRows || []).forEach(v => { map[v.id] = v; });
      setVendorMap(map);
      setProducts(productRows || []);
      setLiked(new Set((likeRows || []).map(l => l.product_id)));
      setLoading(false);
    })();
  }, []);

  const filtered = (activeCategory === "all" ? products : products.filter(p => p.category === activeCategory))
    .filter(p => p.photo_url);
  const getVendor = (id: string) => vendorMap[id];

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(30);
    const deviceId = getDeviceId();
    const next = new Set(liked);
    next.has(id) ? next.delete(id) : next.add(id);
    setLiked(next);
    await supabase.rpc("toggle_like", { p_product_id: id, p_device_id: deviceId });
  };

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen">
      {/* ヘッダー */}
      <header className="bg-brand sticky top-0 z-10 border-b border-border">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <img src="/logo-pictogram.svg" alt="ココフリマ" className="h-6 w-auto" />
          <Link href="/login" className="flex items-center gap-1 text-navy">
            <UserCircle size={20} />
            <span className="text-xs font-bold">ログイン</span>
          </Link>
        </div>
        <Link href="/search" className="block px-4 pb-3">
          <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2.5 border border-border">
            <Search size={16} className="text-ink-soft flex-shrink-0" />
            <span className="text-sm text-ink-soft">商品を検索…</span>
          </div>
        </Link>
      </header>

      {/* カテゴリー */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border
              ${activeCategory === c.id ? "bg-navy text-white border-navy active:bg-navy active:border-navy" : "bg-surface text-ink-mid border-border active:bg-navy active:text-white active:border-navy"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* 協賛バナー */}
      {SPONSORS.length > 0 && (
        <div className="px-4 py-2">
          <p className="text-[9px] text-ink-soft mb-1.5 tracking-wider">SPONSORED</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {SPONSORS.map((s, i) => (
              <a key={i} href={s.linkUrl} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 h-14 w-40 rounded-xl overflow-hidden border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
      ) : (
        <div className="columns-2 gap-2 px-3 pb-24" style={{ columnGap: "8px" }}>
          {filtered.map(p => {
            const vendor = getVendor(p.vendor_id);
            if (!vendor) return null;
            const isLiked = liked.has(p.id);
            const fallbackEmoji = CATEGORIES.find(c => c.id === p.category)?.emoji || "🛍️";
            return (
              <Link key={p.id} href={`/products/${p.id}`}
                className="break-inside-avoid mb-2 block bg-surface rounded-xl overflow-hidden active:scale-95 transition-transform">
                <div className="relative flex items-center justify-center text-5xl bg-bg" style={{ height: "190px" }}>
                  {p.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    fallbackEmoji
                  )}
                  {!p.in_stock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">SOLD</span>
                    </div>
                  )}
                  <button onClick={(e) => toggleLike(p.id, e)}
                    className={`absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors
                      ${isLiked ? "text-red-500" : "text-gray-300"}`}>
                    <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5 truncate">{vendor.store_name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    {p.price != null ? (
                      <span className="text-xs font-bold text-brand-dark">¥{p.price.toLocaleString()}</span>
                    ) : <span />}
                    <span className="flex items-center gap-0.5 text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">
                      <MapPin size={11} />
                      {vendor.booth_number}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
