"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, Search, Heart, MapPin } from "lucide-react";

const STORAGE_KEY = "flea_onboarding_seen";

const SLIDES = [
  {
    icon: ShoppingBag,
    title: "ここから始まる出会い",
    text: "会場に出店するお店の商品を、このアプリからチェックできます。",
  },
  {
    icon: Search,
    title: "カテゴリーや並び替えで探せる",
    text: "ジャンルや価格で絞り込んで、お気に入りの商品を見つけましょう。",
  },
  {
    icon: Heart,
    title: "ハートでお気に入り登録",
    text: "気になる商品はハートをタップ。後で「お気に入り」からまとめて見返せます。",
  },
  {
    icon: MapPin,
    title: "マップでブースを確認",
    text: "商品ページの「マップで見る」から、出店ブースの場所がすぐわかります。",
  },
];

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
    window.dispatchEvent(new Event("flea:onboarding-done"));
  };

  if (!visible) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-6">
      <div className="w-full max-w-[340px] bg-white rounded-2xl p-6 flex flex-col items-center text-center">
        <button onClick={close} className="self-end text-xs text-ink-soft font-medium mb-1">スキップ</button>
        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-4">
          <Icon size={28} className="text-navy" />
        </div>
        <h2 className="text-base font-bold text-ink mb-2">{slide.title}</h2>
        <p className="text-xs text-ink-mid leading-relaxed mb-6">{slide.text}</p>
        <div className="flex gap-1.5 mb-5">
          {SLIDES.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === step ? "bg-brand" : "bg-border"}`} />
          ))}
        </div>
        <button
          onClick={() => (isLast ? close() : setStep(s => s + 1))}
          className="w-full bg-brand text-white text-sm font-bold py-3 rounded-xl"
        >
          {isLast ? "はじめる" : "次へ"}
        </button>
      </div>
    </div>
  );
}
