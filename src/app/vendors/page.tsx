"use client";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import VendorCard from "@/components/VendorCard";
import { supabase } from "@/lib/supabase";
import type { VendorRow } from "@/lib/types";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("vendors_public").select("*").order("booth_number");
      setVendors(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">出店者一覧</h1>
      </div>
      {loading ? (
        <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
      ) : (
        <div className="grid grid-cols-3 gap-2.5 p-4 pb-24">
          {vendors.map(v => (
            <VendorCard key={v.id} vendor={{
              id: v.id, storeName: v.store_name, boothNumber: v.booth_number,
              emoji: v.emoji, avatarBg: v.avatar_bg, avatarUrl: v.avatar_url, category: v.category,
            }} />
          ))}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
