"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";

type Banner = { id: string; image_url: string; link_url: string | null; sort_order: number };

export default function AdminBannersPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: string; password: string } | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const s = getAdminSession();
    if (!s) { router.push("/login?as=admin"); return; }
    setSession(s);
    load(s);
  }, [router]);

  const load = async (s: { id: string; password: string }) => {
    const { data } = await supabase.rpc("admin_list_banners", { p_admin_id: s.id, p_password: s.password });
    setBanners(data || []);
    setLoading(false);
  };

  const add = async () => {
    if (!session || !imageUrl.trim()) return;
    setSaving(true);
    await supabase.rpc("admin_add_banner", {
      p_admin_id: session.id,
      p_password: session.password,
      p_image_url: imageUrl.trim(),
      p_link_url: linkUrl.trim() || null,
      p_sort_order: banners.length,
    });
    setImageUrl("");
    setLinkUrl("");
    setMsg("追加しました");
    await load(session);
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  };

  const remove = async (id: string) => {
    if (!session) return;
    await supabase.rpc("admin_delete_banner", { p_admin_id: session.id, p_password: session.password, p_banner_id: id });
    await load(session);
  };

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/admin"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">広告バナー管理</h1>
      </div>

      <div className="p-4 flex flex-col gap-4 pb-24">
        {/* 追加フォーム */}
        <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-3">
          <p className="text-xs font-bold text-ink-soft tracking-wider">新しいバナーを追加</p>
          <div>
            <label className="block text-[11px] font-bold text-ink-soft mb-1">画像URL <span className="text-red-400">*</span></label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-ink-soft mb-1">リンク先URL（任意）</label>
            <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..."
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
          </div>
          <button onClick={add} disabled={saving || !imageUrl.trim()}
            className="w-full bg-navy text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus size={16} /> {saving ? "追加中…" : "バナーを追加"}
          </button>
          {msg && <p className="text-xs text-center text-green-600 font-medium">{msg}</p>}
        </div>

        {/* バナー一覧 */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-ink-soft tracking-wider">現在のバナー({banners.length}件)</p>
          {loading ? (
            <p className="text-xs text-ink-soft text-center py-4">読み込み中…</p>
          ) : banners.length === 0 ? (
            <p className="text-xs text-ink-soft text-center py-4">バナーがまだありません</p>
          ) : banners.map(b => (
            <div key={b.id} className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image_url} alt="バナー" className="w-full object-cover" style={{ aspectRatio: "3/1" }} />
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <p className="text-[11px] text-ink-soft truncate flex-1">
                  {b.link_url || "リンクなし"}
                </p>
                <button onClick={() => remove(b.id)}
                  className="flex-shrink-0 text-red-400 p-1.5 rounded-lg hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
