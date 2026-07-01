"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ZoomableImage from "@/components/ZoomableImage";
import { SKY_HOTSPOTS } from "@/lib/map-data";

export default function SkyMapPage() {
  const router = useRouter();

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/map"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">③〜⑦ スカイブース</h1>
      </div>
      <p className="text-[11px] text-ink-soft text-center py-2">ピンチで拡大・ドラッグで移動 / 番号をタップして出店者を見る</p>

      <div className="flex-1 flex items-center pb-24">
        <ZoomableImage src="/map/sky.png" alt="スカイブース 91〜135番">
          {SKY_HOTSPOTS.map(h => (
            <button
              key={h.number}
              onClick={() => router.push(`/booth/${h.number}`)}
              className="absolute w-[4%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent active:bg-brand/40"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={`ブース${h.number}`}
            />
          ))}
        </ZoomableImage>
      </div>

      <BottomNav />
    </div>
  );
}
