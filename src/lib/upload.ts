import { supabase } from "@/lib/supabase";
import { generateId } from "@/lib/auth";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// Vercelの画像最適化を経由しなくなった(unoptimized: true)ため、
// スマホの高解像度写真(数MB)をそのまま配信すると表示が重くなる。
// アップロード時にブラウザ側でリサイズ・再圧縮しておく。
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob: Blob | null = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    // 変換に失敗した場合は元のファイルをそのままアップロードする
    return file;
  }
}

export async function uploadProductPhoto(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop() || "jpg";
  const path = `${generateId()}.${ext}`;
  const { error } = await supabase.storage.from("product-photos").upload(path, compressed, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const ext = compressed.name.split(".").pop() || "jpg";
  const path = `banners/${generateId()}.${ext}`;
  const { error } = await supabase.storage.from("product-photos").upload(path, compressed, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
  return data.publicUrl;
}
