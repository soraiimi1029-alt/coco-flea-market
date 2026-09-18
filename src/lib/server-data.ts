import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { VendorRow, ProductRow } from "@/lib/types";

// 当日は大人数が同時に同じ一覧を見るため、共有データ（出店者・商品）は
// テーブル単位でまとめてキャッシュし、個々のページ表示のたびにSupabaseへ
// 問い合わせるのを防ぐ。個人依存のデータ（いいね等）はここではキャッシュしない。
const REVALIDATE_SECONDS = 30;

export const getVendors = unstable_cache(
  async (): Promise<VendorRow[]> => {
    const { data } = await supabase.from("vendors_public").select("*");
    return data || [];
  },
  ["vendors_public_all"],
  { revalidate: REVALIDATE_SECONDS }
);

export const getProducts = unstable_cache(
  async (): Promise<ProductRow[]> => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    return data || [];
  },
  ["products_all"],
  { revalidate: REVALIDATE_SECONDS }
);

export interface FeedProductRow extends ProductRow {
  target_gender: string | null;
  created_at: string;
}

export const getFeedProducts = unstable_cache(
  async (): Promise<FeedProductRow[]> => {
    const { data } = await supabase.from("products_feed").select("*").not("photo_url", "is", null);
    return data || [];
  },
  ["products_feed_all"],
  { revalidate: REVALIDATE_SECONDS }
);

export type SortOption = "new" | "popular" | "price_asc" | "price_desc";

const FEED_PAGE_SIZE = 20;

function sortFeed(rows: FeedProductRow[], sort: SortOption): FeedProductRow[] {
  if (sort === "popular") {
    return [...rows].sort((a, b) => b.like_count - a.like_count);
  }
  if (sort === "price_asc" || sort === "price_desc") {
    // Postgresの nullsFirst:false と同じく、価格未設定は並び順に関わらず末尾に置く
    const withPrice = rows.filter(p => p.price != null);
    const withoutPrice = rows.filter(p => p.price == null);
    withPrice.sort((a, b) => sort === "price_asc" ? a.price! - b.price! : b.price! - a.price!);
    return [...withPrice, ...withoutPrice];
  }
  return [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export interface FeedPageResult {
  items: FeedProductRow[];
  matchConsumed: number;
  restConsumed: number;
}

// ターゲット性別に一致する商品を優先し、残りを他の商品で埋める（元のDBクエリと同じ挙動）
export function paginateFeed(
  all: FeedProductRow[],
  category: string,
  sort: SortOption,
  target: string | null,
  matchOffset: number,
  restOffset: number
): FeedPageResult {
  const filtered = category === "all" ? all : all.filter(p => p.category === category);
  const sorted = sortFeed(filtered, sort);

  if (!target) {
    const items = sorted.slice(restOffset, restOffset + FEED_PAGE_SIZE);
    return { items, matchConsumed: 0, restConsumed: items.length };
  }

  const matchList = sorted.filter(p => p.target_gender === target);
  const restList = sorted.filter(p => p.target_gender !== target);
  const matchItems = matchList.slice(matchOffset, matchOffset + FEED_PAGE_SIZE);
  const remaining = FEED_PAGE_SIZE - matchItems.length;
  const restItems = remaining > 0 ? restList.slice(restOffset, restOffset + remaining) : [];
  return {
    items: [...matchItems, ...restItems],
    matchConsumed: matchItems.length,
    restConsumed: restItems.length,
  };
}
