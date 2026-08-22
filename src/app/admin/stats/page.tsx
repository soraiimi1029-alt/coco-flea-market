"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";

const GENDER_LABELS: Record<string, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  no_answer: "回答しない",
};

const GENDER_ORDER = ["male", "female", "other", "no_answer"];

interface GenderStat {
  gender: string;
  count: number;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<GenderStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("flea_role");
    if (role !== "admin") { router.push("/login?as=admin"); return; }
    const s = getAdminSession();
    if (!s) { router.push("/login?as=admin"); return; }
    (async () => {
      const { data, error: rpcError } = await supabase.rpc("admin_gender_stats", {
        p_admin_id: s.id,
        p_password: s.password,
      });
      if (rpcError) { setError("集計の取得に失敗しました"); setLoading(false); return; }
      setStats(data || []);
      setLoading(false);
    })();
  }, [router]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const sorted = [...stats].sort((a, b) => GENDER_ORDER.indexOf(a.gender) - GENDER_ORDER.indexOf(b.gender));

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/admin"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">来場者統計</h1>
      </div>

      <div className="p-4 pb-24">
        {loading ? (
          <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
        ) : error ? (
          <p className="text-center text-xs text-red-600 py-16">{error}</p>
        ) : total === 0 ? (
          <p className="text-center text-xs text-ink-soft py-16">まだ回答がありません</p>
        ) : (
          <>
            <p className="text-xs text-ink-soft mb-4">回答数 {total}件(任意アンケート)</p>
            <div className="flex flex-col gap-3">
              {sorted.map(s => {
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.gender} className="bg-surface rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-ink">{GENDER_LABELS[s.gender] || s.gender}</span>
                      <span className="text-xs text-ink-soft">{s.count}件 ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
