import Link from "next/link";

interface Product {
  id: string; vendorId: string; name: string; price: number;
  emoji: string; bg: string; inStock: boolean;
}
interface Vendor { storeName: string; boothNumber: string; }

export default function ProductCard({ product, vendor }: { product: Product; vendor: Vendor }) {
  return (
    <Link href={`/vendors/${product.vendorId}`}
      className="bg-surface rounded-xl overflow-hidden cursor-pointer block active:scale-95 transition-transform">
      <div className="relative aspect-square flex items-center justify-center text-5xl" style={{ background: product.bg }}>
        {product.emoji}
        <span className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {vendor.boothNumber}
        </span>
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-full">SOLD</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-ink truncate">{product.name}</p>
        <p className="text-[11px] text-ink-soft mt-0.5">{vendor.storeName}</p>
        <p className="text-sm font-bold text-brand-dark mt-1.5">¥{product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
