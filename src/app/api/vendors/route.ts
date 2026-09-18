import { NextResponse } from "next/server";
import { getVendors } from "@/lib/server-data";

export const revalidate = 30;

export async function GET() {
  const vendors = await getVendors();
  return NextResponse.json(vendors);
}
