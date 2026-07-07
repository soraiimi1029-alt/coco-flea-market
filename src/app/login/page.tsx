"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setVendorSession, setAdminSession } from "@/lib/auth";

function LoginContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"vendor" | "admin">("vendor");

  useEffect(() => {
    if (searchParams.get("as") === "admin") setTab("admin");
  }, [searchParams]);

  const [booth, setBooth] = useState("");
  const [password, setPassword] = useState("");
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVendorLogin = async () => {
    const boothVal = booth.trim();
    const passwordVal = password.trim().replace(/\s/g, "");
    if (!boothVal) { setError("ブース番号を入力してください"); return; }
    if (!passwordVal) { setError("パスワードを入力してください"); return; }
    setError("");
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("vendor_login", {
      p_booth_number: boothVal,
      p_password: passwordVal,
    });
    setLoading(false);
    if (rpcError || !data || data.length === 0) {
      setError("ブース番号またはパスワードが違います");
      return;
    }
    setVendorSession(boothVal, passwordVal);
    router.push("/dashboard");
  };

  const handleAdminLogin = async () => {
    if (!adminId.trim() || !adminPass) { setError("管理者IDとパスワードを入力してください"); return; }
    setError("");
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc("admin_login", {
      p_admin_id: adminId.trim(),
      p_password: adminPass,
    });
    setLoading(false);
    if (rpcError || !data) {
      setError("IDまたはパスワードが違います");
      return;
    }
    setAdminSession(adminId.trim(), adminPass);
    router.push("/admin");
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-bg flex flex-col">
      {/* ヒーロー */}
      <div className="bg-brand pt-12 pb-8 text-center">
        <img src="/logo-full.svg" alt="ココフリマ" className="w-32 mx-auto" />
        <p className="text-sm text-white/70 mt-3">出店者・管理者ログイン</p>
      </div>

      {/* フォーム */}
      <div className="flex-1 px-5 pt-7 pb-10">
        {/* タブ */}
        <div className="flex bg-border rounded-xl p-1 mb-6">
          {(["vendor", "admin"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all
                ${tab === t ? "bg-surface text-ink shadow-sm" : "text-ink-soft"}`}>
              {t === "vendor" ? "出店者ログイン" : "管理者ログイン"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-medium px-3 py-2.5 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {tab === "vendor" ? (
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-ink-soft tracking-wider mb-1.5">ブース番号（1〜135）</label>
              <input type="text" inputMode="numeric" value={booth} onChange={e => setBooth(e.target.value)} placeholder="例：42"
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand font-medium" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-soft tracking-wider mb-1.5">パスワード</label>
              <input type="password" inputMode="numeric" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワードを入力"
                autoComplete="off"
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand" />
            </div>
            <button onClick={handleVendorLogin} disabled={loading}
              className="w-full bg-brand text-white font-bold py-3.5 rounded-xl text-sm mt-1 disabled:opacity-60">
              {loading ? "ログイン中…" : "ログイン"}
            </button>
            <button onClick={() => router.push("/")}
              className="w-full bg-transparent border-2 border-border text-ink-mid font-medium py-3 rounded-xl text-sm">
              来場者として見る
            </button>
            <p className="text-center text-[11px] text-ink-soft mt-1">ブース番号とパスワードは管理者から受け取ってください</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-ink-soft tracking-wider mb-1.5">管理者ID</label>
              <input type="text" value={adminId} onChange={e => setAdminId(e.target.value)} placeholder="admin"
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-soft tracking-wider mb-1.5">パスワード</label>
              <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="パスワードを入力"
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm text-ink outline-none focus:border-brand" />
            </div>
            <button onClick={handleAdminLogin} disabled={loading}
              className="w-full bg-ink text-white font-bold py-3.5 rounded-xl text-sm mt-1 disabled:opacity-60">
              {loading ? "ログイン中…" : "管理者ログイン"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
