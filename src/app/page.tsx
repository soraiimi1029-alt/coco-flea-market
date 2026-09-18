"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, UserCircle, Heart, MapPin, ArrowUpDown, HelpCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { vibrate } from "@/lib/haptics";
import { CATEGORIES } from "@/lib/mock-data";
import BannerSlider from "@/components/BannerSlider";
import NoPhotoPlaceholder from "@/components/NoPhotoPlaceholder";
import { supabase } from "@/lib/supabase";
import { getDeviceId, getVisitorGender } from "@/lib/auth";
import type { VendorRow, ProductRow } from "@/lib/types";

type SortOption = "new" | "popular" | "price_asc" | "price_desc";

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "new", label: "新着順" },
  { id: "popular", label: "人気順" },
  { id: "price_asc", label: "価格が安い順" },
  { id: "price_desc", label: "価格が高い順" },
];

const PAGE_SIZE = 20;

// 商品詳細から戻ったときに一覧・スクロール位置を保持するためのタブ内キャッシュ
// (ページ全体を再読み込みしない限り有効。フルリロードすればリセットされる)
interface HomeCache {
  activeCategory: string;
  sortBy: SortOption;
  products: ProductRow[];
  vendorMap: Record<string, VendorRow>;
  liked: string[];
  hasMore: boolean;
  match: number;
  rest: number;
  targetGender: string | null;
  scrollY: number;
}
let homeCache: HomeCache | null = null;

// 来場者アンケートの回答からターゲット属性へのマッピング
function targetGenderFor(visitorGender: string | null): string | null {
  if (visitorGender === "male") return "mens";
  if (visitorGender === "female") return "ladies";
  return null;
}

// 一致する性別ターゲットの商品を優先し、残りを他の商品で埋める（キャッシュされたフィードAPI経由）
async function fetchFeedPage(
  category: string, sort: SortOption, target: string | null, matchOffset: number, restOffset: number
): Promise<{ items: ProductRow[]; matchConsumed: number; restConsumed: number; error: unknown }> {
  const params = new URLSearchParams({
    category, sort, matchOffset: String(matchOffset), restOffset: String(restOffset),
  });
  if (target) params.set("target", target);
  try {
    const res = await fetch(`/api/feed?${params.toString()}`);
    if (!res.ok) return { items: [], matchConsumed: 0, restConsumed: 0, error: new Error(`feed fetch failed: ${res.status}`) };
    const data = await res.json();
    return { items: data.items || [], matchConsumed: data.matchConsumed || 0, restConsumed: data.restConsumed || 0, error: null };
  } catch (error) {
    return { items: [], matchConsumed: 0, restConsumed: 0, error };
  }
}

export default function Home() {
  const [restored] = useState(() => homeCache);
  const [activeCategory, setActiveCategory] = useState(restored?.activeCategory ?? "all");
  const [sortBy, setSortBy] = useState<SortOption>(restored?.sortBy ?? "new");
  const [liked, setLiked] = useState<Set<string>>(new Set(restored?.liked ?? []));
  const [pulsingId, setPulsingId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRow[]>(restored?.products ?? []);
  const [vendorMap, setVendorMap] = useState<Record<string, VendorRow>>(restored?.vendorMap ?? {});
  const [loading, setLoading] = useState(!restored);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(restored?.hasMore ?? true);
  const isFirstRun = useRef(true);
  const offsets = useRef({ match: restored?.match ?? 0, rest: restored?.rest ?? 0 });
  const targetGender = useRef<string | null>(restored?.targetGender ?? null);

  // 戻ってきた直後、続きのスクロール位置に復元する
  useLayoutEffect(() => {
    if (restored?.scrollY) {
      requestAnimationFrame(() => window.scrollTo(0, restored.scrollY));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // スクロール位置と一覧の状態を常にキャッシュしておく(離脱時に使う値を先読みしておく)
  useEffect(() => {
    const onScroll = () => {
      if (homeCache) homeCache.scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    homeCache = {
      activeCategory, sortBy, products, vendorMap,
      liked: Array.from(liked), hasMore,
      match: offsets.current.match, rest: offsets.current.rest,
      targetGender: targetGender.current,
      scrollY: homeCache?.scrollY ?? 0,
    };
  }, [activeCategory, sortBy, products, vendorMap, liked, hasMore]);

  useEffect(() => {
    if (restored) return;
    targetGender.current = targetGenderFor(getVisitorGender());
    (async () => {
      try {
        const deviceId = getDeviceId();
        const [vendorRows, feedResult, { data: likeRows, error: likeErr }] = await Promise.all([
          fetch("/api/vendors").then(r => r.json()) as Promise<VendorRow[]>,
          fetchFeedPage("all", "new", targetGender.current, 0, 0),
          supabase.from("likes").select("product_id").eq("device_id", deviceId),
        ]);
        if (feedResult.error) console.error("products fetch error:", feedResult.error);
        if (likeErr) console.error("likes fetch error:", likeErr);
        const map: Record<string, VendorRow> = {};
        (vendorRows || []).forEach(v => { map[v.id] = v; });
        setVendorMap(map);
        setProducts(feedResult.items);
        offsets.current = { match: feedResult.matchConsumed, rest: feedResult.restConsumed };
        setHasMore(feedResult.items.length === PAGE_SIZE);
        setLiked(new Set((likeRows || []).map(l => l.product_id)));
      } catch (e) {
        console.error("Home data fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [restored]);

  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    (async () => {
      setLoading(true);
      const result = await fetchFeedPage(activeCategory, sortBy, targetGender.current, 0, 0);
      if (result.error) console.error("products fetch error:", result.error);
      setProducts(result.items);
      offsets.current = { match: result.matchConsumed, rest: result.restConsumed };
      setHasMore(result.items.length === PAGE_SIZE);
      setLoading(false);
    })();
  }, [activeCategory, sortBy]);

  const loadMore = async () => {
    setLoadingMore(true);
    const result = await fetchFeedPage(activeCategory, sortBy, targetGender.current, offsets.current.match, offsets.current.rest);
    if (result.error) console.error("products fetch error:", result.error);
    setProducts(prev => [...prev, ...result.items]);
    offsets.current = { match: offsets.current.match + result.matchConsumed, rest: offsets.current.rest + result.restConsumed };
    setHasMore(result.items.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  const getVendor = (id: string) => vendorMap[id];

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    vibrate(30);
    const deviceId = getDeviceId();
    const isNowLiked = !liked.has(id);
    const next = new Set(liked);
    isNowLiked ? next.add(id) : next.delete(id);
    setLiked(next);
    if (isNowLiked) {
      setPulsingId(id);
      setTimeout(() => setPulsingId(cur => (cur === id ? null : cur)), 450);
    }
    await supabase.rpc("toggle_like", { p_product_id: id, p_device_id: deviceId });
  };

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen">
      {/* ヘッダー */}
      <header className="bg-brand sticky top-0 z-10 border-b border-border">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <img src="/logo-cocotap-white.png" alt="COCO TAP" className="h-8 w-auto" />
          <div className="flex items-center gap-3.5">
            <Link href="/faq" className="flex items-center gap-1 text-navy">
              <HelpCircle size={20} />
              <span className="text-xs font-bold">よくある質問</span>
            </Link>
            <Link href="/login" className="flex items-center gap-1 text-navy">
              <UserCircle size={20} />
              <span className="text-xs font-bold">ログイン</span>
            </Link>
          </div>
        </div>
        <Link href="/search" className="block px-4 pb-3">
          <div className="flex items-center gap-2 bg-bg rounded-lg px-3 py-2.5 border border-border">
            <Search size={16} className="text-ink-soft flex-shrink-0" />
            <span className="text-sm text-ink-soft">商品を検索…</span>
          </div>
        </Link>
      </header>

      {/* 広告バナー */}
      <BannerSlider />

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

      {/* 並び替え */}
      <div className="flex justify-end px-4 pb-2">
        <label className="flex items-center gap-1.5 text-xs text-ink-mid bg-surface border border-border rounded-full pl-3 pr-2 py-1.5">
          <ArrowUpDown size={12} className="text-ink-soft" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent text-xs font-medium focus:outline-none"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
      ) : (
        <>
        <div className="grid grid-cols-2 gap-2 px-3 pb-4">
          {products.map(p => {
            const vendor = getVendor(p.vendor_id);
            if (!vendor) return null;
            const isLiked = liked.has(p.id);
            return (
              <Link key={p.id} href={`/products/${p.id}`}
                className="block bg-surface rounded-xl overflow-hidden active:scale-95 transition-transform">
                <div className="relative flex items-center justify-center bg-bg" style={{ height: "190px" }}>
                  {p.photo_url ? (
                    <Image src={p.photo_url} alt={p.name} fill sizes="50vw" className="object-cover" />
                  ) : (
                    <NoPhotoPlaceholder />
                  )}
                  {!p.in_stock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">SOLD</span>
                    </div>
                  )}
                  <button onClick={(e) => toggleLike(p.id, e)}
                    className={`absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors
                      ${isLiked ? "text-red-500" : "text-gray-300"}`}>
                    {pulsingId === p.id && (
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-heart-burst" />
                    )}
                    <Heart size={15} fill={isLiked ? "currentColor" : "none"}
                      className={pulsingId === p.id ? "animate-heart-pop" : ""} />
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
        {hasMore && (
          <div className="px-3 pb-24 flex justify-center">
            <button onClick={loadMore} disabled={loadingMore}
              className="text-xs font-bold text-ink-mid bg-surface border border-border rounded-full px-5 py-2.5 disabled:opacity-60">
              {loadingMore ? "読み込み中…" : "もっと見る"}
            </button>
          </div>
        )}
        {!hasMore && <div className="pb-24" />}
        </>
      )}
      <BottomNav />
    </div>
  );
}
