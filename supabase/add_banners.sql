-- 広告バナーテーブル
-- Supabase SQL Editorで実行してください

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  link_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.banners enable row level security;
create policy "banners_public_read" on public.banners for select to anon using (true);

-- バナー一覧取得(管理者用)
create or replace function public.admin_list_banners(p_admin_id text, p_password text)
returns table (id uuid, image_url text, link_url text, sort_order integer, created_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  return query select b.id, b.image_url, b.link_url, b.sort_order, b.created_at
    from public.banners b order by b.sort_order, b.created_at;
end; $$;
grant execute on function public.admin_list_banners(text, text) to anon;

-- バナー追加(管理者用)
create or replace function public.admin_add_banner(p_admin_id text, p_password text, p_image_url text, p_link_url text, p_sort_order integer)
returns uuid language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid;
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  insert into public.banners (image_url, link_url, sort_order) values (p_image_url, p_link_url, p_sort_order) returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.admin_add_banner(text, text, text, text, integer) to anon;

-- バナー削除(管理者用)
create or replace function public.admin_delete_banner(p_admin_id text, p_password text, p_banner_id uuid)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if not exists (select 1 from public.admin where admin_id = p_admin_id and password_hash = crypt(p_password, password_hash)) then
    raise exception 'invalid admin credentials';
  end if;
  delete from public.banners where id = p_banner_id;
  return true;
end; $$;
grant execute on function public.admin_delete_banner(text, text, uuid) to anon;
