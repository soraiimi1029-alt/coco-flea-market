-- 出店者ダッシュボードから店舗カテゴリ(古着/アクセサリー/ハンドメイドなど)を
-- 後から編集できるようにする。今までは新規登録時に管理者が設定するのみで、
-- 出店者本人が変更する手段がなかった。
-- SQL Editorに貼って実行してください。

drop function if exists public.update_vendor_profile(text, text, text, text, text, text, text);
create or replace function public.update_vendor_profile(
  p_booth_number text, p_password text, p_store_name text, p_profile text, p_instagram text,
  p_avatar_url text default null, p_target_gender text default null, p_category text default null
) returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  update public.vendors set store_name = p_store_name, profile = p_profile, instagram = p_instagram,
    avatar_url = coalesce(p_avatar_url, avatar_url),
    target_gender = coalesce(p_target_gender, target_gender),
    category = coalesce(p_category, category)
    where id = v_id;
  return true;
end; $$;
grant execute on function public.update_vendor_profile(text, text, text, text, text, text, text, text) to anon;
