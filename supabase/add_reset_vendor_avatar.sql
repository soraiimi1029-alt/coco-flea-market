-- 出店者アイコンを初期状態(絵文字)に戻す機能用SQL
-- SQL Editorに貼って実行してください。

create or replace function public.clear_vendor_avatar(p_booth_number text, p_password text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  update public.vendors set avatar_url = null where id = v_id;
  return true;
end; $$;
grant execute on function public.clear_vendor_avatar(text, text) to anon;
