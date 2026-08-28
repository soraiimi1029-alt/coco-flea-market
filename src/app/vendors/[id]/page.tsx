"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Heart } from "lucide-react";
import VendorAvatarPlaceholder from "@/components/VendorAvatarPlaceholder";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import NoPhotoPlaceholder from "@/components/NoPhotoPlaceholder";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";
import { getBoothMapUrl } from "@/lib/map-data";
import type { VendorRow, ProductRow } from "@/lib/types";

export default function VendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const deviceId = getDeviceId();
      const [{ data: vendorRow }, { data: productRows }] = await Promise.all([
        supabase.from("vendors_public").select("*").eq("id", id).single(),
        supabase.from("products").select("*").eq("vendor_id", id).order("created_at", { ascending: false }),
      ]);
      setVendor(vendorRow || null);
      setProducts(productRows || []);
      if (productRows && productRows.length > 0) {
        const { data: likeRows } = await supabase.from("likes").select("product_id")
          .eq("device_id", deviceId).in("product_id", productRows.map(p => p.id));
        setLiked(new Set((likeRows || []).map(l => l.product_id)));
      }
      setLoading(false);
    })();
  }, [id]);

  const toggleLike = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(30);
    const deviceId = getDeviceId();
    const isNowLiked = !liked.has(productId);
    const next = new Set(liked);
    isNowLiked ? next.add(productId) : next.delete(productId);
    setLiked(next);
    if (isNowLiked) {
      setPulsingId(productId);
      setTimeout(() => setPulsingId(cur => (cur === productId ? null : cur)), 450);
    }
    await supabase.rpc("toggle_like", { p_product_id: productId, p_device_id: deviceId });
  };

  if (loading) {
    return (
      <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">読み込み中…</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">出店者が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      {/* 戻るボタン */}
      <div className="sticky top-0 z-10 bg-brand px-4 py-3">
        <Link href="/vendors"><ArrowLeft size={22} className="text-white" /></Link>
      </div>

      {/* ヒーロー */}
      <div className="bg-brand pt-2 pb-6 px-5 text-center">
        <div className="relative w-[72px] h-[72px] rounded-full mx-auto mb-3 border-4 border-white/25 overflow-hidden">
          {vendor.avatar_url ? (
            <Image src={vendor.avatar_url} alt={vendor.store_name} fill sizes="72px" className="object-cover" />
          ) : (
            <VendorAvatarPlaceholder size={32} />
          )}
        </div>
        <h1 className="text-lg font-bold text-white mb-1">{vendor.store_name}</h1>
        <p className="text-xs text-white/70 font-bold tracking-wide mb-3">ブース {vendor.booth_number}</p>
        <p className="text-[13px] text-white leading-[1.7]">{vendor.profile}</p>
        <div className="flex gap-2.5 mt-3.5 justify-center">
          {vendor.instagram && (
            <a href={vendor.instagram} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20">
               Instagram
            </a>
          )}
          <Link href={getBoothMapUrl(vendor.booth_number)}
            className="flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20">
            <MapPin size={13} /> マップで見る
          </Link>
        </div>
      </div>

      {/* 商品一覧 */}
      <div className="p-4 pb-24">
        <h2 className="text-sm font-bold mb-3">
          商品一覧 <span className="text-xs text-ink-soft font-normal ml-1">{products.length}点</span>
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {products.map(p => {
            const isLiked = liked.has(p.id);
            return (
              <Link key={p.id} href={`/products/${p.id}`}
                className="relative aspect-square rounded-lg flex items-center justify-center overflow-hidden bg-bg block active:scale-95 transition-transform">
                {p.photo_url ? (
                  <Image src={p.photo_url} alt={p.name} fill sizes="33vw" className="object-cover" />
                ) : (
                  <NoPhotoPlaceholder size={22} />
                )}
                {p.price != null && (
                  <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-bold bg-white/90 py-0.5 rounded-b-lg">
                    ¥{p.price.toLocaleString()}
                  </div>
                )}
                {!p.in_stock && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-0.5 rounded-full">SOLD</span>
                  </div>
                )}
                <button onClick={(e) => toggleLike(p.id, e)}
                  className={`absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center transition-colors
                    ${isLiked ? "text-red-500" : "text-gray-300"}`}>
                  {pulsingId === p.id && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-heart-burst" />
                  )}
                  <Heart size={12} fill={isLiked ? "currentColor" : "none"}
                    className={pulsingId === p.id ? "animate-heart-pop" : ""} />
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
