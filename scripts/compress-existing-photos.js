// 既にストレージにアップロード済みの写真(数MBあるものが混ざっている)を
// 一括でリサイズ・再圧縮するための一回限りのメンテナンススクリプト。
//
// 使い方:
//   SUPABASE_SERVICE_ROLE_KEY=xxxxx node scripts/compress-existing-photos.js
//
// SUPABASE_SERVICE_ROLE_KEY は Supabaseダッシュボード → Project Settings →
// API → service_role key。このキーはRLSを無視できる強い権限を持つため、
// このスクリプト実行時以外は使わず、コミットしたりチャットに貼り付けたり
// しないこと。実行が終わったらこのファイルは削除して構わない。
//
// 同じパスに upsert で上書きするので products/vendors テーブル側の
// photo_url / avatar_url は変更不要。

const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 75;
const SKIP_UNDER_BYTES = 150 * 1024; // これより小さい画像はそのままにする

function loadSupabaseUrl() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m);
  if (!match) throw new Error("NEXT_PUBLIC_SUPABASE_URL not found in .env.local");
  return match[1].trim();
}

async function main() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY env var required. See comment at top of this file.");
    process.exit(1);
  }
  const supabaseUrl = loadSupabaseUrl();
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const bucket = "product-photos";

  const allFiles = [];
  for (const prefix of ["", "banners"]) {
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 100, offset });
      if (error) throw error;
      if (!data || data.length === 0) break;
      for (const f of data) {
        if (f.id) allFiles.push(prefix ? `${prefix}/${f.name}` : f.name);
      }
      if (data.length < 100) break;
      offset += 100;
    }
  }

  console.log(`Found ${allFiles.length} files. Compressing anything over ${Math.round(SKIP_UNDER_BYTES / 1024)}KB...`);

  let processed = 0, skipped = 0, savedBytes = 0, failed = 0;
  for (const filePath of allFiles) {
    try {
      const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(filePath);
      if (dlError) throw dlError;
      const buf = Buffer.from(await blob.arrayBuffer());
      if (buf.length < SKIP_UNDER_BYTES) { skipped++; continue; }

      const out = await sharp(buf)
        .rotate() // EXIF回転を反映してから保存
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();

      if (out.length >= buf.length) { skipped++; continue; }

      const { error: upError } = await supabase.storage.from(bucket).upload(filePath, out, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "3600",
      });
      if (upError) throw upError;

      savedBytes += buf.length - out.length;
      processed++;
      console.log(`compressed ${filePath}: ${(buf.length / 1024).toFixed(0)}KB -> ${(out.length / 1024).toFixed(0)}KB`);
    } catch (e) {
      failed++;
      console.error(`failed ${filePath}:`, e.message || e);
    }
  }

  console.log(`\nDone. compressed=${processed} skipped=${skipped} failed=${failed} saved=${(savedBytes / 1024 / 1024).toFixed(1)}MB`);
}

main().catch(e => { console.error(e); process.exit(1); });
