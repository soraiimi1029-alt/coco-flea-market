import { supabase } from "@/lib/supabase";
import { generateId } from "@/lib/auth";

export async function uploadProductPhoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${generateId()}.${ext}`;
  const { error } = await supabase.storage.from("product-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `banners/${generateId()}.${ext}`;
  const { error } = await supabase.storage.from("product-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
  return data.publicUrl;
}
