import { NextResponse } from "next/server";
import { getFeedProducts, paginateFeed, type SortOption } from "@/lib/server-data";

export const revalidate = 30;

const SORT_OPTIONS: SortOption[] = ["new", "popular", "price_asc", "price_desc"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";
  const sortParam = searchParams.get("sort") || "new";
  const sort: SortOption = SORT_OPTIONS.includes(sortParam as SortOption) ? (sortParam as SortOption) : "new";
  const target = searchParams.get("target") || null;
  const matchOffset = Number(searchParams.get("matchOffset")) || 0;
  const restOffset = Number(searchParams.get("restOffset")) || 0;

  const all = await getFeedProducts();
  const result = paginateFeed(all, category, sort, target, matchOffset, restOffset);
  return NextResponse.json(result);
}
