-- ココフリマ Supabaseセットアップ用SQL
-- Supabaseダッシュボード > SQL Editor に、このファイルの内容を全部貼り付けて「Run」を押してください。

create extension if not exists pgcrypto;

-- ============ テーブル ============

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  booth_number text not null unique,
  password_hash text not null,
  store_name text not null default '',
  profile text not null default '',
  emoji text not null default '🛍️',
  avatar_bg text not null default '#FFF8E1',
  category text not null default 'clothing',
  instagram text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null default '',
  price integer,
  description text not null default '',
  photo_url text,
  category text not null default 'clothing',
  in_stock boolean not null default true,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  device_id text not null,
  created_at timestamptz not null default now(),
  unique (product_id, device_id)
);

create table public.admin (
  id int primary key default 1,
  admin_id text not null,
  password_hash text not null,
  constraint admin_singleton check (id = 1)
);

-- ============ いいね数の自動集計トリガー ============

create or replace function public.handle_like_count_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.products set like_count = like_count + 1 where id = new.product_id;
  elsif (tg_op = 'DELETE') then
    update public.products set like_count = like_count - 1 where id = old.product_id;
  end if;
  return null;
end;
$$;

create trigger likes_after_insert after insert on public.likes
  for each row execute function public.handle_like_count_change();
create trigger likes_after_delete after delete on public.likes
  for each row execute function public.handle_like_count_change();

-- ============ RLS(行レベルセキュリティ) ============

alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.likes enable row level security;
alter table public.admin enable row level security;

create policy "products_public_read" on public.products for select to anon using (true);
create policy "likes_public_read" on public.likes for select to anon using (true);

-- ============ 来場者向けビュー(パスワード列なし) ============

create view public.vendors_public as
  select id, booth_number, store_name, profile, emoji, avatar_bg, category, instagram, created_at
  from public.vendors;

grant select on public.vendors_public to anon;

-- ============ RPC関数 ============

create or replace function public.vendor_login(p_booth_number text, p_password text)
returns table (id uuid, booth_number text, store_name text, profile text, emoji text, avatar_bg text, category text, instagram text)
language plpgsql security definer set search_path = public as $$
begin
  return query
    select v.id, v.booth_number, v.store_name, v.profile, v.emoji, v.avatar_bg, v.category, v.instagram
    from public.vendors v
    where v.booth_number = p_booth_number and v.password_hash = crypt(p_password, v.password_hash);
end; $$;
grant execute on function public.vendor_login(text, text) to anon;

create or replace function public.update_vendor_profile(
  p_booth_number text, p_password text, p_store_name text, p_profile text, p_instagram text
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  update public.vendors set store_name = p_store_name, profile = p_profile, instagram = p_instagram where id = v_id;
  return true;
end; $$;
grant execute on function public.update_vendor_profile(text, text, text, text, text) to anon;

create or replace function public.create_product(
  p_booth_number text, p_password text, p_name text, p_price integer, p_description text, p_photo_url text, p_category text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_product_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  insert into public.products (vendor_id, name, price, description, photo_url, category)
    values (v_id, p_name, p_price, p_description, p_photo_url, p_category) returning id into v_product_id;
  return v_product_id;
end; $$;
grant execute on function public.create_product(text, text, text, integer, text, text, text) to anon;

create or replace function public.update_product(
  p_booth_number text, p_password text, p_product_id uuid,
  p_name text, p_price integer, p_description text, p_photo_url text, p_category text, p_in_stock boolean
) returns boolean language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  update public.products set name = p_name, price = p_price, description = p_description,
    photo_url = coalesce(p_photo_url, photo_url), category = p_category, in_stock = p_in_stock
    where id = p_product_id and vendor_id = v_id;
  if not found then raise exception 'product not found or not owned by this vendor'; end if;
  return true;
end; $$;
grant execute on function public.update_product(text, text, uuid, text, integer, text, text, text, boolean) to anon;

create or replace function public.delete_product(p_booth_number text, p_password text, p_product_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.vendors where booth_number = p_booth_number and password_hash = crypt(p_password, password_hash);
  if v_id is null then raise exception 'invalid credentials'; end if;
  delete from public.products where id = p_product_id and vendor_id = v_id;
  if not found then raise exception 'product not found or not owned by this vendor'; end if;
  return true;
end; $$;
grant execute on function public.delete_product(text, text, uuid) to anon;

create or replace function public.toggle_like(p_product_id uuid, p_device_id text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_existing uuid;
begin
  select id into v_existing from public.likes where product_id = p_product_id and device_id = p_device_id;
  if v_existing is not null then
    delete from public.likes where id = v_existing; return false;
  else
    insert into public.likes (product_id, device_id) values (p_product_id, p_device_id); return true;
  end if;
end; $$;
grant execute on function public.toggle_like(uuid, text) to anon;

create or replace function public.admin_login(p_admin_id text, p_password text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash));
end; $$;
grant execute on function public.admin_login(text, text) to anon;

create or replace function public.admin_list_vendors(p_admin_id text, p_password text)
returns table (id uuid, booth_number text, store_name text, profile text, category text, instagram text, product_count bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  return query
    select v.id, v.booth_number, v.store_name, v.profile, v.category, v.instagram, count(p.id) as product_count
    from public.vendors v left join public.products p on p.vendor_id = v.id
    group by v.id order by v.booth_number;
end; $$;
grant execute on function public.admin_list_vendors(text, text) to anon;

create or replace function public.admin_create_vendor(
  p_admin_id text, p_password text, p_booth_number text, p_vendor_password text, p_store_name text, p_category text
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  insert into public.vendors (booth_number, password_hash, store_name, category)
    values (p_booth_number, crypt(p_vendor_password, gen_salt('bf')), p_store_name, p_category) returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.admin_create_vendor(text, text, text, text, text, text) to anon;

create or replace function public.admin_set_vendor_password(
  p_admin_id text, p_password text, p_vendor_id uuid, p_new_vendor_password text
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  update public.vendors set password_hash = crypt(p_new_vendor_password, gen_salt('bf')) where id = p_vendor_id;
  if not found then raise exception 'vendor not found'; end if;
  return true;
end; $$;
grant execute on function public.admin_set_vendor_password(text, text, uuid, text) to anon;

-- ============ 初期データ(今のサンプル6出店者・10商品を移行) ============
-- 出店者の仮パスワードは全員 flea2026 / 管理者は soraiimi / 102977

insert into public.admin (id, admin_id, password_hash) values
  (1, 'soraiimi', crypt('102977', gen_salt('bf')));

insert into public.vendors (booth_number, password_hash, store_name, profile, emoji, avatar_bg, category, instagram) values
  ('B-12', crypt('flea2026', gen_salt('bf')), 'momo''s closet', '古着・ヴィンテージ好きが集めた宝箱。丁寧に選んだ1点ものを揃えています。', '👗', '#FFF8E1', 'clothing', 'https://instagram.com'),
  ('A-05', crypt('flea2026', gen_salt('bf')), 'Little Jewel', 'ビーズとシルバーで作るハンドメイドアクセサリー。世界に1つだけのデザイン。', '💍', '#F3E5F5', 'accessories', 'https://instagram.com'),
  ('C-08', crypt('flea2026', gen_salt('bf')), 'vintage denim co.', 'デニム専門店。501から希少なセルビッジまで幅広く取り揃えています。', '👖', '#E8F5E9', 'clothing', 'https://instagram.com'),
  ('D-03', crypt('flea2026', gen_salt('bf')), 'OLD MARKET', '古着・バッグ・小物など。使い込まれたレザーが好きな方へ。', '🎒', '#E3F2FD', 'clothing', null),
  ('E-01', crypt('flea2026', gen_salt('bf')), 'ART & CRAFT', '陶器・木工・布小物などオリジナルハンドメイド作品。', '🎨', '#FCE4EC', 'handmade', 'https://instagram.com'),
  ('E-02', crypt('flea2026', gen_salt('bf')), 'café stand', '自家焙煎コーヒーとスコーン。会場の真ん中でひとやすみ。', '☕', '#E0F7FA', 'food', 'https://instagram.com');

insert into public.products (vendor_id, name, price, description, category, in_stock)
select v.id, x.name, x.price, x.description, x.category, x.in_stock
from (values
  ('B-12', 'ヴィンテージワンピース', 2800, '70年代のフランス製。状態良好。', 'clothing', true),
  ('B-12', 'デニムスカート', 1800, 'ウエスト64cm。膝丈。', 'clothing', true),
  ('B-12', 'シルクブラウス', 3200, 'アイボリー。SOLD OUT。', 'clothing', false),
  ('A-05', 'ハンドメイドリング', 1200, 'シルバー925。フリーサイズ。', 'accessories', true),
  ('A-05', 'ビーズネックレス', 2400, '天然石使用。45cm。', 'accessories', true),
  ('C-08', 'リーバイス501 W30', 4500, '90s USA製。色落ち良好。', 'clothing', true),
  ('C-08', 'デニムジャケット', 5800, 'Lサイズ。3rdタイプ。', 'clothing', true),
  ('C-08', 'デニムキャップ', 900, 'フリーサイズ。', 'clothing', true),
  ('D-03', 'レザーリュック', 6000, '本革。使い込むほどに味が出る。', 'clothing', true),
  ('E-01', '陶器マグカップ', 2200, '手びねり。1点もの。', 'handmade', true)
) as x(booth_number, name, price, description, category, in_stock)
join public.vendors v on v.booth_number = x.booth_number;

-- ============ Storageバケット(商品写真) ============

insert into storage.buckets (id, name, public) values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

create policy "product_photos_public_read" on storage.objects for select to anon using (bucket_id = 'product-photos');
create policy "product_photos_anon_insert" on storage.objects for insert to anon with check (bucket_id = 'product-photos');
