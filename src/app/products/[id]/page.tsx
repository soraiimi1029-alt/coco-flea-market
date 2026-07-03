"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import { CATEGORIES } from "@/lib/mock-data";
import { getBoothMapUrl } from "@/lib/map-data";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";
import type { VendorRow, ProductRow } from "@/lib/types";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const deviceId = getDeviceId();
      const { data: productRow } = await supabase.from("products").select("*").eq("id", id).single();
      if (!productRow) { setLoading(false); return; }
      setProduct(productRow);
      const [{ data: vendorRow }, { data: likeRow }] = await Promise.all([
        supabase.from("vendors_public").select("*").eq("id", productRow.vendor_id).single(),
        supabase.from("likes").select("id").eq("product_id", id).eq("device_id", deviceId).maybeSingle(),
      ]);
      setVendor(vendorRow || null);
      setLiked(!!likeRow);
      setLoading(false);
    })();
  }, [id]);

  const toggleLike = async () => {
    if (!product) return;
    vibrate(30);
    const deviceId = getDeviceId();
    setLiked(v => !v);
    setProduct(p => p && { ...p, like_count: p.like_count + (liked ? -1 : 1) });
    await supabase.rpc("toggle_like", { p_product_id: product.id, p_device_id: deviceId });
  };

  if (loading) {
    return (
      <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">読み込み中…</p>
      </div>
    );
  }

  if (!product || !vendor) {
    return (
      <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">商品が見つかりませんでした</p>
      </div>
    );
  }

  const fallbackEmoji = CATEGORIES.find(c => c.id === product.category)?.emoji || "🛍️";

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3.5 flex items-center justify-between">
        <Link href={`/vendors/${vendor.id}`}><ArrowLeft size={22} className="text-ink" /></Link>
        <button onClick={toggleLike} className={`flex items-center gap-1 ${liked ? "text-red-500" : "text-ink-soft"}`}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>

      {/* 写真 */}
      <div className="relative w-full flex items-center justify-center text-7xl bg-surface" style={{ aspectRatio: "1 / 1" }}>
        {product.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          fallbackEmoji
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-full">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-4 pb-24">
        {/* 出店者ミニカード */}
        <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg overflow-hidden flex-shrink-0"
            style={{ background: vendor.avatar_bg }}>
            {vendor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.avatar_url} alt={vendor.store_name} className="w-full h-full object-cover" />
            ) : vendor.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink truncate">{vendor.store_name}</p>
            <p className="text-[11px] text-ink-soft">ブース {vendor.booth_number}</p>
          </div>
        </Link>

        <h1 className="text-base font-bold text-ink mb-1.5">{product.name}</h1>
        <div className="flex items-center justify-between mb-4">
          {product.price != null ? (
            <span className="text-xl font-bold text-brand-dark">¥{product.price.toLocaleString()}</span>
          ) : <span />}
          <span className="flex items-center gap-1 text-[11px] text-ink-soft">
            <Heart size={12} /> {product.like_count}
          </span>
        </div>

        {product.description && (
          <div className="bg-surface rounded-xl p-3.5 mb-4">
            <p className="text-[11px] font-bold text-ink-soft mb-1.5">おすすめポイント</p>
            <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">{product.description}</p>
          </div>
        )}

        <Link href={getBoothMapUrl(vendor.booth_number)}
          className="w-full flex items-center justify-center gap-1.5 bg-navy text-white text-xs font-bold py-3 rounded-xl">
          <MapPin size={14} /> マップでブース位置を見る
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
