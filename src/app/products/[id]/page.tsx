"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import VendorAvatarPlaceholder from "@/components/VendorAvatarPlaceholder";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import { CONDITIONS } from "@/lib/mock-data";
import NoPhotoPlaceholder from "@/components/NoPhotoPlaceholder";
import { getBoothMapUrl } from "@/lib/map-data";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";
import type { VendorRow, ProductRow } from "@/lib/types";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [liked, setLiked] = useState(false);
  const [pulsing, setPulsing] = useState(false);
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
    const isNowLiked = !liked;
    setLiked(isNowLiked);
    setProduct(p => p && { ...p, like_count: p.like_count + (isNowLiked ? 1 : -1) });
    if (isNowLiked) {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 450);
    }
    await supabase.rpc("toggle_like", { p_product_id: product.id, p_device_id: deviceId });
  };

  if (loading) {
    return (
      <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">読み込み中…</p>
      </div>
    );
  }

  if (!product || !vendor) {
    return (
      <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">商品が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 z-10 bg-surface border-b border-border px-4 py-3.5 flex items-center justify-between">
        <Link href={`/vendors/${vendor.id}`}><ArrowLeft size={22} className="text-ink" /></Link>
        <button onClick={toggleLike} className={`relative flex items-center gap-1 ${liked ? "text-red-500" : "text-ink-soft"}`}>
          {pulsing && <span className="absolute -inset-1.5 rounded-full bg-red-400 animate-heart-burst" />}
          <Heart size={20} fill={liked ? "currentColor" : "none"} className={pulsing ? "animate-heart-pop" : ""} />
        </button>
      </div>

      {/* 写真 */}
      <div className="relative w-full flex items-center justify-center bg-surface" style={{ aspectRatio: "1 / 1" }}>
        {product.photo_url ? (
          <Image src={product.photo_url} alt={product.name} fill sizes="390px" priority className="object-cover" />
        ) : (
          <NoPhotoPlaceholder size={48} />
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
          <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
            {vendor.avatar_url ? (
              <Image src={vendor.avatar_url} alt={vendor.store_name} fill sizes="36px" className="object-cover" />
            ) : (
              <VendorAvatarPlaceholder size={16} />
            )}
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

        <span className="inline-block text-[11px] font-medium text-ink-mid bg-surface border border-border rounded-full px-2.5 py-1 mb-4">
          {CONDITIONS.find(c => c.id === product.condition)?.name || CONDITIONS[2].name}
        </span>

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
