"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Banner = { id: string; image_url: string; link_url: string | null };

export default function BannerSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.from("banners").select("id, image_url, link_url").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setBanners(data);
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="px-4 py-2">
      <p className="text-[9px] text-ink-soft mb-1.5 tracking-wider">SPONSORED</p>
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "3/1" }}>
        {banner.link_url ? (
          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.image_url} alt="広告" className="w-full h-full object-cover" />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.image_url} alt="広告" className="w-full h-full object-cover" />
        )}
        {banners.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
