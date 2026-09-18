import { NextResponse } from "next/server";
import { getVendors } from "@/lib/server-data";

export const revalidate = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const vendors = await getVendors();
  const vendor = vendors.find(v => v.booth_number === number);
  if (!vendor) return NextResponse.json(null, { status: 404 });
  return NextResponse.json({ id: vendor.id });
}
