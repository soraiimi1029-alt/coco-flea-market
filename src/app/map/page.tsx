"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { OVERVIEW_HOTSPOTS, zoneTarget } from "@/lib/map-data";

export default function MapPage() {
  const router = useRouter();

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">会場マップ</h1>
      </div>

      <div className="p-4 pb-24">
        <p className="text-xs text-ink-soft mb-3 text-center">エリアをタップすると、ブース一覧が表示されます</p>
        <div className="relative w-full rounded-xl overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/map/overview.png" alt="会場マップ全体" className="w-full h-auto block" />
          {OVERVIEW_HOTSPOTS.map((h, i) => (
            <button
              key={i}
              onClick={() => router.push(zoneTarget(h.zone))}
              className="absolute w-[8%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent active:bg-black/15"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              aria-label={`エリア${h.zone}`}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
