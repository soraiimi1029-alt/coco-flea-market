"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BoothResolvePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "notfound">("loading");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("vendors_public")
        .select("id")
        .eq("booth_number", number)
        .maybeSingle();
      if (data) {
        router.replace(`/vendors/${data.id}`);
      } else {
        setStatus("notfound");
      }
    })();
  }, [number, router]);

  if (status === "loading") {
    return (
      <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl">🛍️</p>
      <p className="text-sm text-ink-soft">ブース {number} はまだ出店者登録がありません</p>
      <Link href="/map" className="flex items-center gap-1.5 bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-full">
        <ArrowLeft size={16} /> マップに戻る
      </Link>
    </div>
  );
}
