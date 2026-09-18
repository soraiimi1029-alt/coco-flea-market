import { NextResponse } from "next/server";
import { getProducts } from "@/lib/server-data";

export const revalidate = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(product);
}
