"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { STREET_HOTSPOTS, findHotspot, estimateHighlightWidth } from "@/lib/map-data";
import { Suspense } from "react";

function StreetMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetBooth = searchParams.get("booth") ? Number(searchParams.get("booth")) : null;
  const targetHotspot = targetBooth ? findHotspot(targetBooth) : null;
  const highlightWidth = targetHotspot ? estimateHighlightWidth(STREET_HOTSPOTS, targetHotspot, 2052 / 1596) : 0;

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/map"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">② ストリートブース</h1>
      </div>
      <p className="text-[11px] text-ink-soft text-center py-2">
        {targetBooth ? `ブース ${targetBooth} の位置を表示中` : "横にスライドして全体を確認 / 番号をタップして出店者を見る"}
      </p>

      <div className="flex-1 flex items-center pb-24">
        {/* gallery/sky と同じ縦幅になるよう、ギャラリー画像の縦横比でコンテナの高さを揃える */}
        <div className="w-full overflow-x-auto" style={{ aspectRatio: "1128 / 1596" }}>
          <div className="relative h-full" style={{ aspectRatio: "2052 / 1596" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/map/street.jpg" alt="ストリートブース 41〜90番"
              className="h-full w-auto block pointer-events-none" draggable={false} />
            {targetHotspot && (
              <span
                className="absolute -translate-x-1/2 -translate-y-1/2 aspect-square rounded-md border-2 border-brand bg-brand/15 animate-booth-glow pointer-events-none"
                style={{ left: `${targetHotspot.x}%`, top: `${targetHotspot.y}%`, width: `${highlightWidth}%` }}
              />
            )}
            {STREET_HOTSPOTS.map(h => (
              <button
                key={h.number}
                onClick={() => router.push(`/booth/${h.number}`)}
                className="absolute w-[4%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent active:bg-brand/40"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                aria-label={`ブース${h.number}`}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default function StreetMapPage() {
  return <Suspense><StreetMapContent /></Suspense>;
}
