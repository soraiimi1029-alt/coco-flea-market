"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import VendorCard from "@/components/VendorCard";
import { supabase } from "@/lib/supabase";
import type { VendorRow } from "@/lib/types";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("vendors_public").select("*");
      const sorted = (data || []).sort((a, b) => Number(a.booth_number) - Number(b.booth_number));
      setVendors(sorted);
      setLoading(false);
    })();
  }, []);

  const filtered = vendors.filter(v =>
    v.store_name.toLowerCase().includes(query.toLowerCase()) ||
    v.booth_number.includes(query)
  );

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/"><ArrowLeft size={22} className="text-ink" /></Link>
        <div className="flex-1 flex items-center gap-2 bg-bg rounded-lg px-3 py-2 border border-border">
          <Search size={14} className="text-ink-soft flex-shrink-0" />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="出店者名・ブース番号で検索"
            className="flex-1 bg-transparent text-xs text-ink outline-none placeholder-ink-soft" />
        </div>
      </div>
      {loading ? (
        <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
      ) : (
        <>
          {query && <p className="px-4 pt-3 text-xs text-ink-soft">{filtered.length}件</p>}
          <div className="grid grid-cols-3 gap-2.5 p-4 pb-24">
            {filtered.map(v => (
              <VendorCard key={v.id} vendor={{
                id: v.id, storeName: v.store_name, boothNumber: v.booth_number,
                emoji: v.emoji, avatarBg: v.avatar_bg, avatarUrl: v.avatar_url, category: v.category,
              }} />
            ))}
            {!loading && filtered.length === 0 && query && (
              <p className="col-span-3 text-center text-xs text-ink-soft py-8">「{query}」の出店者が見つかりませんでした</p>
            )}
          </div>
        </>
      )}
      <BottomNav />
    </div>
  );
}
