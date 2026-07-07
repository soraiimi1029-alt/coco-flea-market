"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import { CATEGORIES } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";
import type { VendorRow, ProductRow } from "@/lib/types";

export default function FavoritesPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [vendorMap, setVendorMap] = useState<Record<string, VendorRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const deviceId = getDeviceId();
      const { data: likeRows } = await supabase.from("likes").select("product_id").eq("device_id", deviceId);
      const productIds = (likeRows || []).map(l => l.product_id);
      if (productIds.length === 0) { setLoading(false); return; }
      const [{ data: productRows }, { data: vendorRows }] = await Promise.all([
        supabase.from("products").select("*").in("id", productIds).order("created_at", { ascending: false }),
        supabase.from("vendors_public").select("*"),
      ]);
      const map: Record<string, VendorRow> = {};
      (vendorRows || []).forEach(v => { map[v.id] = v; });
      setVendorMap(map);
      setProducts(productRows || []);
      setLoading(false);
    })();
  }, []);

  const getVendor = (vendorId: string) => vendorMap[vendorId];

  const unlike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(30);
    const deviceId = getDeviceId();
    setProducts(prev => prev.filter(p => p.id !== id));
    await supabase.rpc("toggle_like", { p_product_id: id, p_device_id: deviceId });
  };

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 z-10 flex items-center gap-3">
        <Link href="/"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">お気に入り</h1>
      </div>

      {loading ? (
        <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-ink-soft px-6">
          <Heart size={36} className="mx-auto mb-3 text-ink-soft" />
          <p className="text-sm">まだお気に入りがありません</p>
          <p className="text-xs mt-1.5">商品の♡をタップすると、ここに表示されます</p>
        </div>
      ) : (
        <div className="columns-2 gap-2 px-3 pt-3 pb-24" style={{ columnGap: "8px" }}>
          {products.map(p => {
            const vendor = getVendor(p.vendor_id);
            if (!vendor) return null;
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
                  <button onClick={(e) => unlike(p.id, e)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-red-500">
                    <Heart size={15} fill="currentColor" />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-ink truncate">{p.name}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5 truncate">{vendor.store_name}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    {p.price != null ? (
                      <span className="text-xs font-bold text-brand-dark">¥{p.price.toLocaleString()}</span>
                    ) : <span />}
                    <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">{vendor.booth_number}</span>
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
