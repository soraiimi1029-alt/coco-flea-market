"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ZoomableImage from "@/components/ZoomableImage";
import { SKY_5_6_HOTSPOTS, findHotspot } from "@/lib/map-data";
import { Suspense } from "react";

function SkyMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetBooth = searchParams.get("booth") ? Number(searchParams.get("booth")) : null;
  const targetHotspot = targetBooth ? findHotspot(targetBooth) : null;

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/map"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">⑤⑥ スカイブース</h1>
      </div>
      <p className="text-[11px] text-ink-soft text-center py-2">
        {targetBooth ? `ブース ${targetBooth} の位置を表示中` : "ピンチで拡大・ドラッグで移動 / 番号をタップして出店者を見る"}
      </p>

      <div className="flex-1 flex items-center pb-24">
        <ZoomableImage src="/map/sky-5-6.jpg" alt="スカイブース 101〜114番">
          {targetHotspot && (
            <>
              <span className="absolute -translate-x-1/2 -translate-y-1/2 w-[10%] aspect-square rounded-full bg-brand/50 animate-ping"
                style={{ left: `${targetHotspot.x}%`, top: `${targetHotspot.y}%` }} />
              <span className="absolute -translate-x-1/2 -translate-y-1/2 w-[8%] aspect-square rounded-full bg-brand border-2 border-white"
                style={{ left: `${targetHotspot.x}%`, top: `${targetHotspot.y}%` }} />
            </>
          )}
          {SKY_5_6_HOTSPOTS.map(h => (
            <button
              key={h.number}
              onClick={() => router.push(`/booth/${h.number}`)}
              className="absolute w-[8%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent active:bg-brand/40"
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

export default function SkyMapPage() {
  return <Suspense><SkyMapContent /></Suspense>;
}
