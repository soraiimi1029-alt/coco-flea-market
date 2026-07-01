-- 出店者アイコン(写真アップロード)対応用SQL
-- SQL Editorに貼って実行してください。

alter table public.vendors add column if not exists avatar_url text;

drop function if exists public.vendor_login(text, text);
create or replace function public.vendor_login(p_booth_number text, p_password text)
returns table (id uuid, booth_number text, store_name text, profile text, emoji text, avatar_bg text, avatar_url text, category text, instagram text)
language plpgsql security definer set search_path = public, extensions as $$
begin
  return query
    select v.id, v.booth_number, v.store_name, v.profile, v.emoji, v.avatar_bg, v.avatar_url, v.category, v.instagram
    from public.vendors v
    where v.booth_number = p_booth_number and v.password_hash = crypt(p_password, v.password_hash);
end; $$;
grant execute on function public.vendor_login(text, text) to anon;

create or replace function public.update_vendor_profile(
  p_booth_number text, p_password text, p_store_name text, p_profile text, p_instagram text, p_avatar_url text default null
) returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  update public.vendors set store_name = p_store_name, profile = p_profile, instagram = p_instagram,
    avatar_url = coalesce(p_avatar_url, avatar_url)
    where id = v_id;
  return true;
end; $$;
grant execute on function public.update_vendor_profile(text, text, text, text, text, text) to anon;

drop view if exists public.vendors_public;
create view public.vendors_public as
  select id, booth_number, store_name, profile, emoji, avatar_bg, category, instagram, created_at, avatar_url
  from public.vendors;
grant select on public.vendors_public to anon;
