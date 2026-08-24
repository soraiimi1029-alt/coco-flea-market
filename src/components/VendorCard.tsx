import Link from "next/link";
import Image from "next/image";
import VendorAvatarPlaceholder from "./VendorAvatarPlaceholder";

interface Vendor {
  id: string; storeName: string; boothNumber: string;
  emoji: string; avatarBg: string; avatarUrl?: string | null; category: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  clothing: "古着", accessories: "アクセサリー", handmade: "ハンドメイド",
  food: "フード", books: "本・雑貨", plants: "植物",
};

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link href={`/vendors/${vendor.id}`}
      className="flex-shrink-0 w-[120px] bg-surface rounded-xl p-3 text-center block active:scale-95 transition-transform">
      <div className="relative w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden border-2 border-brand-light">
        {vendor.avatarUrl ? (
          <Image src={vendor.avatarUrl} alt={vendor.storeName} fill sizes="48px" className="object-cover" />
        ) : (
          <VendorAvatarPlaceholder size={22} />
        )}
      </div>
      <p className="text-xs font-bold text-ink truncate">{vendor.storeName}</p>
      <p className="text-[10px] text-ink-soft mt-0.5">ブース {vendor.boothNumber}</p>
      <span className="inline-block mt-1.5 bg-brand-light text-brand-dark text-[10px] font-medium px-2 py-0.5 rounded-full">
        {CATEGORY_LABELS[vendor.category] || vendor.category}
      </span>
    </Link>
  );
}
