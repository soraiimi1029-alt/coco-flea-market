import Link from "next/link";
export default function NotFound() {
  return (
    <div className="max-w-[390px] mx-auto min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-5xl">🔍</p>
      <h1 className="text-lg font-bold">ページが見つかりません</h1>
      <Link href="/" className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-bold">
        ホームに戻る
      </Link>
    </div>
  );
}
