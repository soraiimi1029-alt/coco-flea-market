"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, MapPin, ChevronRight, Heart } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import { CATEGORIES } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";
import type { VendorRow, ProductRow } from "@/lib/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [vendorMap, setVendorMap] = useState<Record<string, VendorRow>>({});
  const [liked, setLiked] = useState<Set<string>>(new Set());
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

  const toggleLike = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(30);
    const deviceId = getDeviceId();
    const next = new Set(liked);
    next.has(productId) ? next.delete(productId) : next.add(productId);
    setLiked(next);
    await supabase.rpc("toggle_like", { p_product_id: productId, p_device_id: deviceId });
  };

  const results = useMemo(() => {
    return products.filter(p => {
      const matchQuery = query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.description?.toLowerCase().includes(query.toLowerCase());
      const matchCategory = activeCategory === "all" || p.category === activeCategory;
      return matchQuery && matchCategory;
    });
  }, [products, query, activeCategory]);

  const getVendor = (vendorId: string) => vendorMap[vendorId];

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/"><ArrowLeft size={22} className="text-ink" /></Link>
        <div className="flex-1 flex items-center gap-2 bg-bg rounded-lg px-3 py-2.5 border-2 border-brand">
          <Search size={16} className="text-brand flex-shrink-0" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="商品を検索…" autoFocus
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder-ink-soft" />
        </div>
      </div>

      {/* カテゴリー */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border bg-surface">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors border
              ${activeCategory === cat.id ? "bg-navy text-white border-navy active:bg-navy active:border-navy" : "bg-bg text-ink-mid border-border active:bg-navy active:text-white active:border-navy"}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 件数 */}
      <p className="px-4 py-3 text-xs text-ink-soft">
        {query ? `「${query}」の` : ""}検索結果 <strong className="text-brand-dark">{results.length}件</strong>
      </p>

      {/* マップヒント */}
      {results.length > 0 && (
        <Link href="/map" className="mx-4 mb-3 bg-brand-light rounded-lg px-3.5 py-2.5 flex items-center gap-2">
          <MapPin size={16} className="text-brand-dark" />
          <span className="text-xs text-brand-dark font-medium">マップでブース位置を確認する</span>
          <ChevronRight size={14} className="ml-auto text-brand-dark" />
        </Link>
      )}

      {/* 検索結果 */}
      <div className="px-4 flex flex-col gap-2.5 pb-24">
        {loading ? (
          <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
        ) : results.map(product => {
          const vendor = getVendor(product.vendor_id);
          if (!vendor) return null;
          const fallbackEmoji = CATEGORIES.find(c => c.id === product.category)?.emoji || "🛍️";
          const isLiked = liked.has(product.id);
          return (
            <Link key={product.id} href={`/products/${product.id}`}
              className="bg-surface rounded-xl flex gap-3 p-3 items-center active:scale-95 transition-transform">
              <div className="relative w-[72px] h-[72px] rounded-lg flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden bg-bg">
                {product.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  fallbackEmoji
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink">{product.name}</p>
                <p className="text-xs text-ink-soft mt-0.5">{vendor.store_name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  {product.price != null ? (
                    <span className="text-[15px] font-bold text-brand-dark">¥{product.price.toLocaleString()}</span>
                  ) : <span />}
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                    ${product.in_stock ? "bg-brand text-white" : "bg-gray-200 text-gray-500"}`}>
                    <MapPin size={11} />{vendor.booth_number}
                  </span>
                </div>
              </div>
              <button onClick={(e) => toggleLike(product.id, e)}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-colors ${isLiked ? "text-red-500" : "text-gray-300"}`}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              </button>
            </Link>
          );
        })}
        {!loading && results.length === 0 && query && (
          <div className="text-center py-16 text-ink-soft">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">「{query}」の商品が見つかりませんでした</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
