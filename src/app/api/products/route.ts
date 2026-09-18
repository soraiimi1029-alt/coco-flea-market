import { NextResponse } from "next/server";
import { getProducts } from "@/lib/server-data";

export const revalidate = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const vendorId = searchParams.get("vendorId");
  const products = await getProducts();
  const result = vendorId ? products.filter(p => p.vendor_id === vendorId) : products;
  return NextResponse.json(result);
}
