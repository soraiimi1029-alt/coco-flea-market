"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/lib/auth";

const ONBOARDING_KEY = "flea_onboarding_seen";
const GENDER_KEY = "flea_gender_answered";

const OPTIONS: { id: string; label: string }[] = [
  { id: "male", label: "男性" },
  { id: "female", label: "女性" },
  { id: "other", label: "その他" },
  { id: "no_answer", label: "回答しない" },
];

export default function GenderPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkAndShow = () => {
      if (localStorage.getItem(GENDER_KEY)) return;
      if (!localStorage.getItem(ONBOARDING_KEY)) return;
      setVisible(true);
    };
    checkAndShow();
    window.addEventListener("flea:onboarding-done", checkAndShow);
    return () => window.removeEventListener("flea:onboarding-done", checkAndShow);
  }, []);

  const answer = async (gender: string) => {
    localStorage.setItem(GENDER_KEY, "1");
    setVisible(false);
    await supabase.rpc("submit_visitor_gender", { p_device_id: getDeviceId(), p_gender: gender });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-6">
      <div className="w-full max-w-[340px] bg-white rounded-2xl p-6 flex flex-col items-center text-center">
        <h2 className="text-base font-bold text-ink mb-1.5">よろしければ教えてください</h2>
        <p className="text-xs text-ink-mid leading-relaxed mb-5">
          今後のイベント運営の参考にするための任意アンケートです。
        </p>
        <div className="grid grid-cols-2 gap-2 w-full">
          {OPTIONS.map(o => (
            <button key={o.id} onClick={() => answer(o.id)}
              className="bg-bg border border-border rounded-xl py-3 text-sm font-bold text-ink active:bg-brand active:text-white active:border-brand transition-colors">
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
