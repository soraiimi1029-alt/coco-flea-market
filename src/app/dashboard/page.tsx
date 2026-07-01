"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Link2, Pencil, Trash2, Heart, ImagePlus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getVendorSession, clearSession } from "@/lib/auth";
import { uploadProductPhoto } from "@/lib/upload";
import { CATEGORIES } from "@/lib/mock-data";
import type { VendorRow, ProductRow } from "@/lib/types";

const PRODUCT_CATEGORIES = CATEGORIES.filter(c => c.id !== "all");

interface ProductForm {
  name: string;
  price: string;
  description: string;
  category: string;
  photoFile: File | null;
  existingPhotoUrl: string | null;
}

const EMPTY_FORM: ProductForm = { name: "", price: "", description: "", category: "clothing", photoFile: null, existingPhotoUrl: null };

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ booth: string; password: string } | null>(null);
  const [vendor, setVendor] = useState<VendorRow | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<"products" | "profile">("products");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [storeName, setStoreName] = useState("");
  const [profileText, setProfileText] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const loadAll = useCallback(async (s: { booth: string; password: string }) => {
    const { data: vendorRows, error: vendorError } = await supabase.rpc("vendor_login", {
      p_booth_number: s.booth,
      p_password: s.password,
    });
    if (vendorError) {
      // 通信エラーなど一時的な失敗。パスワードが間違っているとは限らないのでログアウトはしない
      setLoadingPage(false);
      setLoadError(true);
      return;
    }
    if (!vendorRows || vendorRows.length === 0) {
      // ブース番号・パスワードが実際に一致しなかった場合のみログアウトする
      clearSession();
      router.push("/login");
      return;
    }
    setLoadError(false);
    const v: VendorRow = vendorRows[0];
    setVendor(v);
    setStoreName(v.store_name);
    setProfileText(v.profile);
    setInstagramUrl(v.instagram || "");

    const { data: productRows } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", v.id)
      .order("created_at", { ascending: false });
    setProducts(productRows || []);
    setLoadingPage(false);
  }, [router]);

  useEffect(() => {
    const role = localStorage.getItem("flea_role");
    if (role !== "vendor") { router.push("/login"); return; }
    const s = getVendorSession();
    if (!s) { router.push("/login"); return; }
    setSession(s);
    loadAll(s);
  }, [router, loadAll]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: p.price != null ? String(p.price) : "",
      description: p.description,
      category: p.category,
      photoFile: null,
      existingPhotoUrl: p.photo_url,
    });
    setFormError("");
    setFormOpen(true);
  };

  const submitForm = async () => {
    if (!session) return;
    if (!form.name.trim()) { setFormError("商品名を入力してください"); return; }
    setSubmitting(true);
    setFormError("");
    try {
      let photoUrl: string | null = form.existingPhotoUrl;
      if (form.photoFile) {
        photoUrl = await uploadProductPhoto(form.photoFile);
      }
      const priceValue = form.price.trim() ? parseInt(form.price, 10) : null;

      if (editingId) {
        const existing = products.find(p => p.id === editingId);
        const { error } = await supabase.rpc("update_product", {
          p_booth_number: session.booth,
          p_password: session.password,
          p_product_id: editingId,
          p_name: form.name.trim(),
          p_price: priceValue,
          p_description: form.description,
          p_photo_url: photoUrl,
          p_category: form.category,
          p_in_stock: existing ? existing.in_stock : true,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc("create_product", {
          p_booth_number: session.booth,
          p_password: session.password,
          p_name: form.name.trim(),
          p_price: priceValue,
          p_description: form.description,
          p_photo_url: photoUrl,
          p_category: form.category,
        });
        if (error) throw error;
      }
      setFormOpen(false);
      await loadAll(session);
    } catch {
      setFormError("保存に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStock = async (p: ProductRow) => {
    if (!session) return;
    const nextInStock = !p.in_stock;
    setProducts(prev => prev.map(item => item.id === p.id ? { ...item, in_stock: nextInStock } : item));
    await supabase.rpc("update_product", {
      p_booth_number: session.booth,
      p_password: session.password,
      p_product_id: p.id,
      p_name: p.name,
      p_price: p.price,
      p_description: p.description,
      p_photo_url: p.photo_url,
      p_category: p.category,
      p_in_stock: nextInStock,
    });
  };

  const deleteProduct = async (p: ProductRow) => {
    if (!session) return;
    if (!confirm(`「${p.name}」を削除しますか？`)) return;
    setProducts(prev => prev.filter(item => item.id !== p.id));
    await supabase.rpc("delete_product", {
      p_booth_number: session.booth,
      p_password: session.password,
      p_product_id: p.id,
    });
  };

  const saveProfile = async () => {
    if (!session) return;
    setSavingProfile(true);
    setSavedMsg(false);
    let avatarUrl: string | null = null;
    if (avatarFile) {
      avatarUrl = await uploadProductPhoto(avatarFile);
    }
    const { error } = await supabase.rpc("update_vendor_profile", {
      p_booth_number: session.booth,
      p_password: session.password,
      p_store_name: storeName,
      p_profile: profileText,
      p_instagram: instagramUrl || null,
      p_avatar_url: avatarUrl,
    });
    setSavingProfile(false);
    if (!error) {
      setSavedMsg(true);
      setAvatarFile(null);
      setTimeout(() => setSavedMsg(false), 2000);
      setVendor(v => v ? {
        ...v, store_name: storeName, profile: profileText, instagram: instagramUrl || null,
        avatar_url: avatarUrl || v.avatar_url,
      } : v);
    }
  };

  if (loadError) {
    return (
      <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-ink-soft">通信に失敗しました。もう一度お試しください。</p>
        <button onClick={() => session && loadAll(session)}
          className="bg-brand text-white text-sm font-bold px-5 py-2.5 rounded-full">
          もう一度読み込む
        </button>
      </div>
    );
  }

  if (loadingPage || !vendor) {
    return (
      <div className="max-w-[390px] mx-auto bg-bg min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-soft">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="max-w-[390px] mx-auto bg-bg min-h-screen">
      {/* ヒーロー */}
      <div className="bg-brand px-4 pt-12 pb-5">
        <Link href="/" className="inline-block mb-3"><ArrowLeft size={22} className="text-white" /></Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-white/25 overflow-hidden"
            style={{ background: vendor.avatar_bg }}>
            {vendor.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vendor.avatar_url} alt={vendor.store_name} className="w-full h-full object-cover" />
            ) : vendor.emoji}
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{vendor.store_name}</h1>
            <p className="text-xs text-white/70">ブース {vendor.booth_number}</p>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex bg-surface border-b border-border">
        {(["products", "profile"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2
              ${tab === t ? "border-brand text-brand-dark" : "border-transparent text-ink-soft"}`}>
            {t === "products" ? "商品管理" : "プロフィール"}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        <div className="p-4 pb-24">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold">商品一覧 <span className="text-xs text-ink-soft font-normal">{products.length}点</span></h2>
            <button onClick={openAddForm} className="flex items-center gap-1 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Plus size={13} /> 商品を追加
            </button>
          </div>

          {formOpen && (
            <div className="bg-surface rounded-xl p-4 mb-3 border-2 border-brand flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold">{editingId ? "商品を編集" : "新しい商品を追加"}</h3>
                <button onClick={() => setFormOpen(false)}><X size={18} className="text-ink-soft" /></button>
              </div>

              <label className="flex flex-col items-center justify-center gap-1.5 bg-bg border-2 border-dashed border-border rounded-lg h-32 cursor-pointer overflow-hidden">
                {(form.photoFile || form.existingPhotoUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.photoFile ? URL.createObjectURL(form.photoFile) : form.existingPhotoUrl || ""}
                    alt="商品写真"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus size={26} className="text-ink-soft" />
                    <span className="text-xs text-ink-soft">写真を選択</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setForm(f => ({ ...f, photoFile: e.target.files?.[0] || null }))} />
              </label>

              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="商品名"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />

              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value.replace(/[^0-9]/g, "") }))}
                placeholder="価格（任意・数字のみ）" inputMode="numeric"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />

              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="おすすめポイント" rows={3}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand resize-none" />

              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand">
                {PRODUCT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
              </select>

              {formError && <p className="text-xs text-red-600">{formError}</p>}

              <button onClick={submitForm} disabled={submitting}
                className="w-full bg-brand text-white text-sm font-bold py-3 rounded-xl disabled:opacity-60">
                {submitting ? "保存中…" : "保存する"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {products.map(p => (
              <div key={p.id} className="bg-surface rounded-xl flex items-center gap-3 p-3">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden bg-bg">
                  {p.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    PRODUCT_CATEGORIES.find(c => c.id === p.category)?.emoji || "🛍️"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                  {p.price != null && <p className="text-xs text-brand-dark font-bold mt-0.5">¥{p.price.toLocaleString()}</p>}
                  <p className="flex items-center gap-1 text-[11px] text-ink-soft mt-0.5">
                    <Heart size={11} className={p.like_count > 0 ? "text-red-500" : ""} fill={p.like_count > 0 ? "currentColor" : "none"} />
                    {p.like_count}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleStock(p)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full transition-colors
                      ${p.in_stock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {p.in_stock ? "在庫あり" : "SOLD"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(p)}><Pencil size={14} className="text-ink-soft" /></button>
                    <button onClick={() => deleteProduct(p)}><Trash2 size={14} className="text-ink-soft" /></button>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && !formOpen && (
              <p className="text-center text-xs text-ink-soft py-10">まだ商品がありません。「商品を追加」から登録してください。</p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 pb-24 flex flex-col gap-3">
          <div className="bg-surface rounded-xl p-4">
            <label className="text-[11px] font-bold text-ink-soft block mb-1.5 tracking-wider">アイコン</label>
            <div className="flex items-center gap-3">
              <label className="w-16 h-16 rounded-full flex items-center justify-center text-3xl overflow-hidden cursor-pointer flex-shrink-0 border-2 border-dashed border-border"
                style={{ background: vendor.avatar_bg }}>
                {avatarFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={URL.createObjectURL(avatarFile)} alt="アイコン" className="w-full h-full object-cover" />
                ) : vendor.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vendor.avatar_url} alt="アイコン" className="w-full h-full object-cover" />
                ) : vendor.emoji}
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
              </label>
              <p className="text-[11px] text-ink-soft">タップして写真を変更</p>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4">
            <label className="text-[11px] font-bold text-ink-soft block mb-1.5 tracking-wider">店舗名</label>
            <input value={storeName} onChange={e => setStoreName(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
          </div>
          <div className="bg-surface rounded-xl p-4">
            <label className="text-[11px] font-bold text-ink-soft block mb-1.5 tracking-wider">プロフィール</label>
            <textarea value={profileText} onChange={e => setProfileText(e.target.value)} rows={4}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand resize-none" />
          </div>
          <div className="bg-surface rounded-xl p-4">
            <label className="text-[11px] font-bold text-ink-soft block mb-1.5 tracking-wider">Instagram URL</label>
            <div className="flex items-center gap-2">
              <Link2 size={15} className="text-ink-soft flex-shrink-0" />
              <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourname"
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none focus:border-brand" />
            </div>
          </div>
          <button onClick={saveProfile} disabled={savingProfile}
            className="w-full bg-brand text-white text-sm font-bold py-3.5 rounded-xl disabled:opacity-60">
            {savingProfile ? "保存中…" : savedMsg ? "保存しました ✓" : "保存する"}
          </button>
        </div>
      )}
    </div>
  );
}
