import { NextResponse } from "next/server";
import { getVendors } from "@/lib/server-data";

export const revalidate = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendors = await getVendors();
  const vendor = vendors.find(v => v.id === id);
  if (!vendor) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(vendor);
}
