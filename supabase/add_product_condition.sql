-- 商品の状態(コンディション)対応用SQL
-- SQL Editorに貼って実行してください。

alter table public.products add column if not exists condition text not null default 'no_flaws';

drop function if exists public.create_product(text, text, text, integer, text, text, text);
create or replace function public.create_product(
  p_booth_number text, p_password text, p_name text, p_price integer, p_description text, p_photo_url text, p_category text, p_condition text default 'no_flaws'
) returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid; v_product_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  insert into public.products (vendor_id, name, price, description, photo_url, category, condition)
    values (v_id, p_name, p_price, p_description, p_photo_url, p_category, p_condition) returning id into v_product_id;
  return v_product_id;
end; $$;
grant execute on function public.create_product(text, text, text, integer, text, text, text, text) to anon;

drop function if exists public.update_product(text, text, uuid, text, integer, text, text, text, boolean);
create or replace function public.update_product(
  p_booth_number text, p_password text, p_product_id uuid,
  p_name text, p_price integer, p_description text, p_photo_url text, p_category text, p_in_stock boolean, p_condition text default 'no_flaws'
) returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  update public.products set name = p_name, price = p_price, description = p_description,
    photo_url = coalesce(p_photo_url, photo_url), category = p_category, in_stock = p_in_stock, condition = p_condition
    where id = p_product_id and vendor_id = v_id;
  if not found then raise exception 'product not found or not owned by this vendor'; end if;
  return true;
end; $$;
grant execute on function public.update_product(text, text, uuid, text, integer, text, text, text, boolean, text) to anon;
