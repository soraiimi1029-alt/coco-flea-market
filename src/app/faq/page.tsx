"use client";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";

// 会場マップの注意書き等、確認できている内容をもとにした暫定版です。
// 実際の運営方針に合わせて、質問・回答は自由に編集してください。
const FAQS = [
  {
    q: "再入場はできますか？",
    a: "はい、可能です。会場出入り口の「RE-ENTRY」の案内に従ってご入場ください。",
  },
  {
    q: "会場内は禁煙ですか？",
    a: "はい、会場内は全面禁煙です。",
  },
  {
    q: "休憩できる場所はありますか？",
    a: "はい、会場マップの「CAFETERIA」が休憩スペースとしてご利用いただけます。",
  },
  {
    q: "お手洗いはどこにありますか？",
    a: "会場マップに記載の「ACCESSIBLE WC」の案内表示をご確認ください。",
  },
  {
    q: "支払い方法は何が使えますか？",
    a: "出店者ごとに異なります。現金のみの店舗、電子決済に対応している店舗がありますので、各ブースでご確認ください。",
  },
  {
    q: "商品の返品・交換はできますか？",
    a: "個人の出店者による販売のため、返品・交換は基本的にお受けできません。ご購入前によくご確認ください。",
  },
  {
    q: "会場内で写真を撮っても良いですか？",
    a: "会場内ではイベントの様子を撮影しており、お客様が映り込む場合がございます。イベント終了後にSNS等で掲載される場合がありますので、あらかじめご了承ください。",
  },
  {
    q: "困ったときはどうすればいいですか？",
    a: "黄色い服を着た会場スタッフにお声がけください。",
  },
];

export default function FaqPage() {
  return (
    <div className="w-full sm:max-w-[390px] sm:mx-auto bg-bg min-h-screen flex flex-col">
      <div className="sticky top-0 bg-surface border-b border-border px-4 py-3.5 flex items-center gap-3 z-10">
        <Link href="/"><ArrowLeft size={22} className="text-ink" /></Link>
        <h1 className="text-sm font-bold">よくある質問</h1>
      </div>

      <div className="p-4 pb-24 flex flex-col gap-2.5">
        {FAQS.map((item, i) => (
          <details key={i} className="group bg-surface rounded-xl overflow-hidden border border-border">
            <summary className="flex items-center justify-between gap-2 p-3.5 cursor-pointer list-none">
              <span className="text-xs font-bold text-ink">{item.q}</span>
              <ChevronDown size={16} className="text-ink-soft flex-shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-3.5 pb-3.5 text-xs text-ink-mid leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
