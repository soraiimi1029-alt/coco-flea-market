export const CATEGORIES = [
  { id: "all", name: "すべて", emoji: "🛍️" },
  { id: "clothing", name: "古着", emoji: "👕" },
  { id: "accessories", name: "アクセサリー", emoji: "💍" },
  { id: "handmade", name: "ハンドメイド", emoji: "🎨" },
  { id: "goods", name: "雑貨", emoji: "🛒" },
  { id: "other", name: "その他", emoji: "✨" },
];

export const CONDITIONS = [
  { id: "new", name: "新品、未使用" },
  { id: "like_new", name: "未使用に近い" },
  { id: "no_flaws", name: "目立った傷や汚れなし" },
  { id: "some_flaws", name: "やや傷や汚れあり" },
  { id: "flaws", name: "傷や汚れあり" },
  { id: "poor", name: "全体的に状態が悪い" },
];

export const VENDORS = [
  {
    id: "v1", storeName: "momo's closet", boothNumber: "B-12",
    profile: "古着・ヴィンテージ好きが集めた宝箱。丁寧に選んだ1点ものを揃えています。",
    emoji: "👗", avatarBg: "#FFF8E1", category: "clothing",
    instagram: "https://instagram.com", posX: 42, posY: 15,
  },
  {
    id: "v2", storeName: "Little Jewel", boothNumber: "A-05",
    profile: "ビーズとシルバーで作るハンドメイドアクセサリー。世界に1つだけのデザイン。",
    emoji: "💍", avatarBg: "#F3E5F5", category: "accessories",
    instagram: "https://instagram.com", posX: 12, posY: 15,
  },
  {
    id: "v3", storeName: "vintage denim co.", boothNumber: "C-08",
    profile: "デニム専門店。501から希少なセルビッジまで幅広く取り揃えています。",
    emoji: "👖", avatarBg: "#E8F5E9", category: "clothing",
    instagram: "https://instagram.com", posX: 72, posY: 15,
  },
  {
    id: "v4", storeName: "OLD MARKET", boothNumber: "D-03",
    profile: "古着・バッグ・小物など。使い込まれたレザーが好きな方へ。",
    emoji: "🎒", avatarBg: "#E3F2FD", category: "clothing",
    instagram: null, posX: 72, posY: 57,
  },
  {
    id: "v5", storeName: "ART & CRAFT", boothNumber: "E-01",
    profile: "陶器・木工・布小物などオリジナルハンドメイド作品。",
    emoji: "🎨", avatarBg: "#FCE4EC", category: "handmade",
    instagram: "https://instagram.com", posX: 12, posY: 57,
  },
  {
    id: "v6", storeName: "café stand", boothNumber: "E-02",
    profile: "自家焙煎コーヒーとスコーン。会場の真ん中でひとやすみ。",
    emoji: "☕", avatarBg: "#E0F7FA", category: "food",
    instagram: "https://instagram.com", posX: 12, posY: 80,
  },
];

export const PRODUCTS = [
  { id: "p1", vendorId: "v1", name: "ヴィンテージワンピース", price: 2800, emoji: "👗", bg: "#FFF8E1", category: "clothing", inStock: true, description: "70年代のフランス製。状態良好。" },
  { id: "p2", vendorId: "v1", name: "デニムスカート", price: 1800, emoji: "🩳", bg: "#E8F5E9", category: "clothing", inStock: true, description: "ウエスト64cm。膝丈。" },
  { id: "p3", vendorId: "v1", name: "シルクブラウス", price: 3200, emoji: "👚", bg: "#FCE4EC", category: "clothing", inStock: false, description: "アイボリー。SOLD OUT。" },
  { id: "p4", vendorId: "v2", name: "ハンドメイドリング", price: 1200, emoji: "💍", bg: "#F3E5F5", category: "accessories", inStock: true, description: "シルバー925。フリーサイズ。" },
  { id: "p5", vendorId: "v2", name: "ビーズネックレス", price: 2400, emoji: "📿", bg: "#FFF8E1", category: "accessories", inStock: true, description: "天然石使用。45cm。" },
  { id: "p6", vendorId: "v3", name: "リーバイス501 W30", price: 4500, emoji: "👖", bg: "#E8F5E9", category: "clothing", inStock: true, description: "90s USA製。色落ち良好。" },
  { id: "p7", vendorId: "v3", name: "デニムジャケット", price: 5800, emoji: "🧥", bg: "#E3F2FD", category: "clothing", inStock: true, description: "Lサイズ。3rdタイプ。" },
  { id: "p8", vendorId: "v3", name: "デニムキャップ", price: 900, emoji: "🧢", bg: "#FCE4EC", category: "clothing", inStock: true, description: "フリーサイズ。" },
  { id: "p9", vendorId: "v4", name: "レザーリュック", price: 6000, emoji: "🎒", bg: "#E3F2FD", category: "clothing", inStock: true, description: "本革。使い込むほどに味が出る。" },
  { id: "p10", vendorId: "v5", name: "陶器マグカップ", price: 2200, emoji: "🍵", bg: "#FCE4EC", category: "handmade", inStock: true, description: "手びねり。1点もの。" },
];

export const EVENT = {
  id: "e1",
  title: "夏のフリーマーケット2026",
  date: "2026年7月6日（日）",
  venue: "中央公園",
  vendorCount: 42,
  status: "live" as const,
};
