"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getAdminSession } from "@/lib/auth";
import { CATEGORIES } from "@/lib/mock-data";

interface AdminVendorRow {
  id: string;
  booth_number: string;
  store_name: string;
  profile: string;
  category: string;
  instagram: string | null;
  product_count: number;
}

const PRODUCT_CATEGORIES = CATEGORIES.filter(c => c.id !== "all");

export default function AdminVendorsPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ id: string; password: string } | null>(null);
  const [vendors, setVendors] = useState<AdminVendorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [newBooth, setNewBooth] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newVendorPassword, setNewVendorPassword] = useState("");
  const [newCategory, setNewCategory] = useState("clothing");
  const [addSubmitting, setAddSubmitting] = useState(false);

  const loadVendors = useCallback(async (s: { id: string; password: string }) => {
    setError("");
    const { data, error: rpcError } = await supabase.rpc("admin_list_vendors", {
      p_admin_id: s.id,
      p_password: s.password,
    });
    if (rpcError) { setError("出店者一覧の取得に失敗しました"); setLoading(false); return; }
    setVendors(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("flea_role");
    if (role !== "admin") { router.push("/login?as=admin"); return; }
    const s = getAdminSession();
    if (!s) { router.push("/login?as=admin"); return; }
    setSession(s);
    loadVendors(s);
  }, [router, loadVendors]);

  const submitReset = async () => {
    if (!session || !resetTargetId || !newPassword) return;
    const { error: rpcError } = await supabase.rpc("admin_set_vendor_password", {
      p_admin_id: session.id,
      p_password: session.password,
      p_vendor_id: resetTargetId,
      p_new_vendor_password: newPassword,
    });
    if (rpcError) { setResetMsg("変更に失敗しました"); return; }
    setResetMsg("パスワードを変更しました ✓");
    setNewPassword("");
    setTimeout(() => { setResetTargetId(null); setResetMsg(""); }, 1200);
  };

  const submitAddVendor = async () => {
    if (!session) return;
    if (!newBooth.trim() || !newVendorPassword || !newStoreName.trim()) {
      setError("ブース番号・店舗名・パスワードを入力してください");
      return;
    }
    setAddSubmitting(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("admin_create_vendor", {
      p_admin_id: session.id,
      p_password: session.password,
      p_booth_number: newBooth.trim(),
      p_vendor_password: newVendorPassword,
      p_store_name: newStoreName.trim(),
      p_category: newCategory,
    });
    setAddSubmitting(false);
    if (rpcError) { setError("追加に失敗しました(ブース番号が重複していないか確認してください)"); return; }
    setNewBooth(""); setNewStoreName(""); setNewVendorPassword(""); setNewCategory("clothing");
    setAddOpen(false);
    await loadVendors(session);
  };

  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin"><ArrowLeft size={22} className="text-ink" /></Link>
          <h1 className="text-sm font-bold">出店者管理</h1>
        </div>
        <button onClick={() => setAddOpen(v => !v)}
          className="flex items-center gap-1 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full">
          <Plus size={13} /> ブースを追加
        </button>
      </div>

      <div className="p-4 pb-24">
        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-2.5 rounded-lg mb-3 border border-red-200">
            {error}
          </div>
        )}

        {addOpen && (
          <div className="bg-surface rounded-xl p-4 mb-3 border-2 border-brand flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold">新しいブースを追加</h3>
              <button onClick={() => setAddOpen(false)}><X size={18} className="text-ink-soft" /></button>
            </div>
            <input value={newBooth} onChange={e => setNewBooth(e.target.value)} placeholder="ブース番号（1〜135、例：42）" inputMode="numeric"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
            <input value={newStoreName} onChange={e => setNewStoreName(e.target.value)} placeholder="店舗名"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
            <input value={newVendorPassword} onChange={e => setNewVendorPassword(e.target.value)} placeholder="初期パスワード"
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand">
              {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
            <button onClick={submitAddVendor} disabled={addSubmitting}
              className="w-full bg-brand text-white text-sm font-bold py-3 rounded-xl disabled:opacity-60">
              {addSubmitting ? "追加中…" : "追加する"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-center text-xs text-ink-soft py-16">読み込み中…</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {vendors.map(v => (
              <div key={v.id} className="bg-surface rounded-xl p-3.5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink truncate">{v.store_name}</p>
                    <p className="text-[11px] text-ink-soft mt-0.5">ブース {v.booth_number} ・ 商品{v.product_count}点</p>
                  </div>
                  <button onClick={() => { setResetTargetId(v.id); setNewPassword(""); setResetMsg(""); }}
                    className="flex items-center gap-1 bg-bg border border-border text-ink-mid text-[11px] font-bold px-2.5 py-1.5 rounded-full flex-shrink-0">
                    <KeyRound size={12} /> パスワード変更
                  </button>
                </div>

                {resetTargetId === v.id && (
                  <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                    <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="新しいパスワード"
                      className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-brand" />
                    {resetMsg && <p className="text-xs text-brand-dark font-medium">{resetMsg}</p>}
                    <div className="flex gap-2">
                      <button onClick={submitReset}
                        className="flex-1 bg-brand text-white text-xs font-bold py-2 rounded-lg">変更する</button>
                      <button onClick={() => setResetTargetId(null)}
                        className="flex-1 bg-bg border border-border text-ink-mid text-xs font-bold py-2 rounded-lg">キャンセル</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {vendors.length === 0 && (
              <p className="text-center text-xs text-ink-soft py-10">出店者がいません。「ブースを追加」から登録してください。</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
